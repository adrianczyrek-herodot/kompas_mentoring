import { FakeClock } from '@kompas/testing';
import { describe, expect, it } from 'vitest';
import { money, type UserId, UserId as UserIdSchema } from '../../../shared/domain/index.ts';
import type { CurrentUser, Role } from '../../identity/index.ts';
import type { MentorProfile } from '../domain/mentor-profile.entity.ts';
import type { MentorProfileDomainEvent } from '../domain/mentor-profile.events.ts';
import { makeGetMentorAccess, makeOpenMyMentorProfile } from './open-my-mentor-profile.query.ts';
import type { MentorProfileRepository } from './ports.ts';
import { makeSaveProfileStep } from './save-profile-step.command.ts';
import { makeSetAcceptingNew } from './set-accepting-new.command.ts';

class InMemoryProfiles implements MentorProfileRepository {
  readonly byUser = new Map<string, MentorProfile>();
  readonly published: MentorProfileDomainEvent[] = [];

  findByUserId(userId: UserId) {
    return Promise.resolve(this.byUser.get(userId) ?? null);
  }

  createIfMissing(profile: MentorProfile) {
    if (!this.byUser.has(profile.userId)) this.byUser.set(profile.userId, profile);
    return Promise.resolve(this.byUser.get(profile.userId) ?? profile);
  }

  save(
    profile: MentorProfile,
    expectedVersion: number,
    events: readonly MentorProfileDomainEvent[],
  ) {
    if (this.byUser.get(profile.userId)?.version !== expectedVersion) {
      return Promise.resolve('version_conflict' as const);
    }
    this.byUser.set(profile.userId, profile);
    this.published.push(...events);
    return Promise.resolve('saved' as const);
  }
}

const actor = (
  roles: Role[] = ['mentor'],
  id = '0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d11',
): CurrentUser => ({
  id: UserIdSchema.parse(id),
  name: 'Ola',
  email: 'ola@example.com',
  emailVerified: true,
  twoFactorEnabled: false,
  roles,
});

const setup = () => {
  const clock = new FakeClock();
  const mentorProfileRepository = new InMemoryProfiles();
  const deps = { clock, mentorProfileRepository };
  return {
    repo: mentorProfileRepository,
    open: makeOpenMyMentorProfile(deps),
    access: makeGetMentorAccess(deps),
    save: makeSaveProfileStep(deps),
    setAcceptingNew: makeSetAcceptingNew(deps),
  };
};

const rate = (zloty: bigint) =>
  ({ step: 'rate', fields: { rate60: money.of(zloty * 100n) } }) as const;

describe('catalog commands', () => {
  it('creates the draft lazily once and returns the same profile afterwards', async () => {
    const { open, repo } = setup();
    const first = (await open(actor()))._unsafeUnwrap();
    const second = (await open(actor()))._unsafeUnwrap();
    expect(second.id).toBe(first.id);
    expect(first.slug).toMatch(/^ola-[0-9a-z]{6}$/);
    expect(repo.byUser.size).toBe(1);
  });

  it('reports no profile to the /mentor guard without creating one', async () => {
    const { access, repo } = setup();
    expect((await access(actor()))._unsafeUnwrap()).toEqual({ status: null, nextStep: 'about' });
    expect(repo.byUser.size).toBe(0);
  });

  it.each([['student'], ['admin_trust'], ['admin_finance']] as const)(
    'refuses %s (catalog.forbidden → 403)',
    async (role) => {
      const { open, access, save } = setup();
      const forbidden = { code: 'catalog.forbidden' };
      expect((await open(actor([role])))._unsafeUnwrapErr()).toEqual(forbidden);
      expect((await access(actor([role])))._unsafeUnwrapErr()).toEqual(forbidden);
      expect((await save(actor([role]), rate(150n), 1))._unsafeUnwrapErr()).toEqual(forbidden);
    },
  );

  it('saves a step, bumps the version and keeps the owner from the session', async () => {
    const { open, save } = setup();
    await open(actor());
    const saved = (await save(actor(), rate(150n), 1))._unsafeUnwrap();
    expect(saved).toMatchObject({ version: 2, completedSteps: ['rate'] });
    expect(saved.rate60).toEqual(money.of(15_000n));
  });

  it('treats a mentor without a profile as not found (someone else’s profile is never reachable)', async () => {
    const { open, save } = setup();
    await open(actor(['mentor'], '0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d12'));
    expect((await save(actor(), rate(150n), 1))._unsafeUnwrapErr()).toEqual({
      code: 'catalog.not_found',
    });
  });

  it('rejects a stale version (another tab saved first)', async () => {
    const { open, save } = setup();
    await open(actor());
    await save(actor(), rate(150n), 1);
    expect((await save(actor(), rate(200n), 1))._unsafeUnwrapErr()).toEqual({
      code: 'catalog.version_conflict',
    });
  });

  it('reports a lost race with the repository as a version conflict', async () => {
    const { open, save, repo } = setup();
    await open(actor());
    const original = repo.save.bind(repo);
    repo.save = () => Promise.resolve('version_conflict' as const);
    expect((await save(actor(), rate(150n), 1))._unsafeUnwrapErr()).toEqual({
      code: 'catalog.version_conflict',
    });
    repo.save = original;
  });

  it('refuses edits while the application is under review (Q6)', async () => {
    const { open, save, repo } = setup();
    const profile = (await open(actor()))._unsafeUnwrap();
    repo.byUser.set(profile.userId, { ...profile, status: 'submitted' });
    expect((await save(actor(), rate(150n), 1))._unsafeUnwrapErr()).toEqual({
      code: 'catalog.profile_locked',
      status: 'submitted',
    });
  });

  it('publishes the profile update only when public, and the bookability change on every rate save', async () => {
    const { open, save, repo } = setup();
    const profile = (await open(actor()))._unsafeUnwrap();
    // A draft mentor's rate still reaches `scheduling` — it mirrors the rate for step 10 (Q13).
    await save(actor(), rate(150n), 1);
    expect(repo.published).toEqual([
      { name: 'catalog.mentor_bookability_changed.v1', mentorProfileId: profile.id },
    ]);
    repo.published.length = 0;
    repo.byUser.set(profile.userId, { ...profile, status: 'approved', version: 2 });
    await save(actor(), rate(200n), 2);
    expect(repo.published).toEqual([
      { name: 'catalog.mentor_profile_updated.v1', mentorProfileId: profile.id },
      { name: 'catalog.mentor_bookability_changed.v1', mentorProfileId: profile.id },
    ]);
  });

  it('points the guard at the first incomplete step', async () => {
    const { open, save, access } = setup();
    await open(actor());
    await save(actor(), rate(150n), 1);
    expect((await access(actor()))._unsafeUnwrap()).toEqual({ status: 'draft', nextStep: 'about' });
  });

  it('pauses new trial students and tells scheduling in the same save (Q13)', async () => {
    const { open, save, setAcceptingNew, repo } = setup();
    await open(actor());
    await save(actor(), rate(150n), 1);
    const paused = (
      await setAcceptingNew(actor(), { acceptingNew: false, expectedVersion: 2 })
    )._unsafeUnwrap();
    expect(paused.acceptingNew).toBe(false);
    expect(paused.version).toBe(3);
    expect(
      repo.published.filter((event) => event.name === 'catalog.mentor_bookability_changed.v1')
        .length,
    ).toBe(2);
  });

  it('refuses the switch for a locked profile, a stale version and someone else', async () => {
    const { open, save, setAcceptingNew, repo } = setup();
    const profile = (await open(actor()))._unsafeUnwrap();
    await save(actor(), rate(150n), 1);
    expect(
      (
        await setAcceptingNew(actor(), { acceptingNew: false, expectedVersion: 1 })
      )._unsafeUnwrapErr(),
    ).toEqual({ code: 'catalog.version_conflict' });
    expect(
      (
        await setAcceptingNew(actor(['student']), { acceptingNew: false, expectedVersion: 2 })
      )._unsafeUnwrapErr(),
    ).toEqual({ code: 'catalog.forbidden' });
    repo.byUser.set(profile.userId, { ...profile, status: 'submitted', version: 2 });
    expect(
      (
        await setAcceptingNew(actor(), { acceptingNew: false, expectedVersion: 2 })
      )._unsafeUnwrapErr(),
    ).toEqual({ code: 'catalog.profile_locked', status: 'submitted' });
    repo.byUser.delete(profile.userId);
    expect(
      (
        await setAcceptingNew(actor(), { acceptingNew: false, expectedVersion: 2 })
      )._unsafeUnwrapErr(),
    ).toEqual({ code: 'catalog.not_found' });
  });
});
