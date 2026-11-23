import type { Clock } from '../../../shared/domain/index.ts';
import { err, MentorId, newId, ok, type Result } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { CatalogForbidden } from '../domain/catalog.errors.ts';
import {
  createDraftProfile,
  firstIncompleteStep,
  type MentorProfile,
  type ProfileStep,
} from '../domain/mentor-profile.entity.ts';
import type { MentorProfileStatus } from '../domain/mentor-profile.state.ts';
import { type MentorProfileRepository, requirePermission } from './ports.ts';

/**
 * M1: the signed-in mentor's own profile, created lazily as a draft on the first visit (F1 Q3:
 * the profile does not exist after sign-up, `catalog` does not listen to `identity`).
 */
export const makeOpenMyMentorProfile =
  ({
    clock,
    mentorProfileRepository,
  }: {
    clock: Clock;
    mentorProfileRepository: MentorProfileRepository;
  }) =>
  async (actor: CurrentUser): Promise<Result<MentorProfile, CatalogForbidden>> => {
    const allowed = requirePermission(actor, 'catalog.mentor_profile.edit.own');
    if (allowed.isErr()) return err(allowed.error);
    const existing = await mentorProfileRepository.findByUserId(actor.id);
    if (existing !== null) return ok(existing);
    const draft = createDraftProfile({
      id: newId(MentorId),
      userId: actor.id,
      displayName: actor.name,
      now: clock.now(),
    });
    return ok(await mentorProfileRepository.createIfMissing(draft));
  };

export interface MentorAccess {
  /** `null` — no profile yet (the mentor has never opened M1). */
  readonly status: MentorProfileStatus | null;
  /** First step still to fill in; `null` when every step is done. */
  readonly nextStep: ProfileStep | null;
}

/** Guard of `/mentor/*` (requirement 5): status and next step, without creating a profile. */
export const makeGetMentorAccess =
  ({ mentorProfileRepository }: { mentorProfileRepository: MentorProfileRepository }) =>
  async (actor: CurrentUser): Promise<Result<MentorAccess, CatalogForbidden>> => {
    const allowed = requirePermission(actor, 'catalog.mentor_profile.edit.own');
    if (allowed.isErr()) return err(allowed.error);
    const profile = await mentorProfileRepository.findByUserId(actor.id);
    if (profile === null) return ok({ status: null, nextStep: 'about' });
    return ok({ status: profile.status, nextStep: firstIncompleteStep(profile) });
  };

export type OpenMyMentorProfile = ReturnType<typeof makeOpenMyMentorProfile>;
export type GetMentorAccess = ReturnType<typeof makeGetMentorAccess>;
