import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { MentorId, money, UserId } from '../../../shared/domain/index.ts';
import {
  attachPhoto,
  createDraftProfile,
  firstIncompleteStep,
  type MentorProfile,
  saveStep,
} from './mentor-profile.entity.ts';

const NOW = Temporal.Instant.from('2026-11-22T12:00:00Z');
const LATER = NOW.add({ minutes: 5 });

const draft = (): MentorProfile =>
  createDraftProfile({
    id: MentorId.parse('0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d10'),
    userId: UserId.parse('0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d11'),
    displayName: 'Łucja',
    now: NOW,
  });

const filled = (): MentorProfile => {
  let profile = attachPhoto(draft(), 'mentor-photos/p/1', NOW)._unsafeUnwrap();
  profile = saveStep(
    profile,
    { step: 'about', fields: { country: 'PL', languages: ['pl'] } },
    NOW,
  )._unsafeUnwrap();
  profile = saveStep(
    profile,
    {
      step: 'skills',
      fields: {
        categories: ['data-ai'],
        tags: ['sql', 'python', 'dbt'],
        yearsExperience: 7,
        experience: [],
      },
    },
    NOW,
  )._unsafeUnwrap();
  profile = saveStep(
    profile,
    { step: 'bio', fields: { headline: 'h'.repeat(20), bio: 'b'.repeat(300), videoUrl: null } },
    NOW,
  )._unsafeUnwrap();
  return saveStep(
    profile,
    { step: 'rate', fields: { rate60: money.of(15_000n) } },
    NOW,
  )._unsafeUnwrap();
};

describe('MentorProfile', () => {
  it('starts as a draft on step 1 with a stable slug and PL as the country', () => {
    const profile = draft();
    expect(profile).toMatchObject({
      status: 'draft',
      version: 1,
      country: 'PL',
      completedSteps: [],
    });
    expect(profile.slug).toMatch(/^lucja-[0-9a-z]{6}$/);
    expect(firstIncompleteStep(profile)).toBe('about');
  });

  it('saves a partial step without completing it', () => {
    const profile = saveStep(
      draft(),
      { step: 'about', fields: { country: 'PL', languages: ['pl'] } },
      LATER,
    );
    // No photo yet, so step 1 is not done.
    expect(profile._unsafeUnwrap()).toMatchObject({
      languages: ['pl'],
      completedSteps: [],
      updatedAt: LATER,
    });
  });

  it('completes steps 1–4 and points to the first step E2-S3 still has to add', () => {
    const profile = filled();
    expect(profile.completedSteps).toEqual(['about', 'skills', 'bio', 'rate']);
    expect(firstIncompleteStep(profile)).toBe('availability');
  });

  it('drops a step from the completed list when its data no longer satisfies the rules', () => {
    const profile = saveStep(
      filled(),
      { step: 'rate', fields: { rate60: null } },
      LATER,
    )._unsafeUnwrap();
    expect(profile.completedSteps).toEqual(['about', 'skills', 'bio']);
    expect(firstIncompleteStep(profile)).toBe('rate');
  });

  it('keeps steps recorded by later commands (5–6) when steps 1–4 are re-derived', () => {
    const withLater: MentorProfile = {
      ...filled(),
      completedSteps: ['about', 'availability', 'verification'],
    };
    const saved = saveStep(
      withLater,
      { step: 'rate', fields: { rate60: money.of(20_000n) } },
      LATER,
    )._unsafeUnwrap();
    expect(saved.completedSteps).toEqual([
      'about',
      'skills',
      'bio',
      'rate',
      'availability',
      'verification',
    ]);
    expect(firstIncompleteStep(saved)).toBeNull();
  });

  it('rejects invalid values with field issues and leaves the profile unchanged', () => {
    const result = saveStep(
      draft(),
      { step: 'bio', fields: { headline: 'za krótki', bio: null, videoUrl: null } },
      LATER,
    );
    expect(result._unsafeUnwrapErr()).toEqual({
      code: 'catalog.invalid_fields',
      issues: [{ field: 'headline', problem: 'too_short' }],
    });
  });

  it.each(['submitted', 'rejected', 'suspended'] as const)('is locked in %s (Q6)', (status) => {
    const locked: MentorProfile = { ...draft(), status };
    const rate = { step: 'rate', fields: { rate60: money.of(10_000n) } } as const;
    expect(saveStep(locked, rate, LATER)._unsafeUnwrapErr()).toEqual({
      code: 'catalog.profile_locked',
      status,
    });
    expect(attachPhoto(locked, 'k', LATER)._unsafeUnwrapErr()).toEqual({
      code: 'catalog.profile_locked',
      status,
    });
  });

  it.each(['changes_requested', 'approved'] as const)('stays editable in %s', (status) => {
    const editable: MentorProfile = { ...draft(), status };
    expect(
      saveStep(editable, { step: 'rate', fields: { rate60: money.of(10_000n) } }, LATER).isOk(),
    ).toBe(true);
  });
});
