import type { Clock } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type {
  CatalogForbidden,
  CatalogNotFound,
  InvalidFields,
  ProfileLocked,
  VersionConflict,
} from '../domain/catalog.errors.ts';
import { type MentorProfile, type StepInput, saveStep } from '../domain/mentor-profile.entity.ts';
import type { MentorProfileDomainEvent } from '../domain/mentor-profile.events.ts';
import { isPublic } from '../domain/mentor-profile.state.ts';
import { type MentorProfileRepository, requirePermission } from './ports.ts';

export type SaveProfileStepError =
  | CatalogForbidden
  | CatalogNotFound
  | ProfileLocked
  | InvalidFields
  | VersionConflict;

/** A public profile changed: the search read model and the P3 cache refresh (spec "Zdarzenia"). */
const eventsFor = (profile: MentorProfile): MentorProfileDomainEvent[] =>
  isPublic(profile.status)
    ? [{ name: 'catalog.mentor_profile_updated.v1', mentorProfileId: profile.id }]
    : [];

/**
 * M1 "Zapisz i dalej" / "Zapisz szkic": saves one step of the actor's own profile. The owner
 * comes from the session, never from the request body (A01); a stale `expectedVersion` → 409.
 */
export const makeSaveProfileStep =
  ({
    clock,
    mentorProfileRepository,
  }: {
    clock: Clock;
    mentorProfileRepository: MentorProfileRepository;
  }) =>
  async (
    actor: CurrentUser,
    input: StepInput,
    expectedVersion: number,
  ): Promise<Result<MentorProfile, SaveProfileStepError>> => {
    const allowed = requirePermission(actor, 'catalog.mentor_profile.edit.own');
    if (allowed.isErr()) return err(allowed.error);
    const profile = await mentorProfileRepository.findByUserId(actor.id);
    if (profile === null) return err({ code: 'catalog.not_found' });
    if (profile.version !== expectedVersion) return err({ code: 'catalog.version_conflict' });
    const changed = saveStep(profile, input, clock.now());
    if (changed.isErr()) return err(changed.error);
    const next = { ...changed.value, version: expectedVersion + 1 };
    const outcome = await mentorProfileRepository.save(next, expectedVersion, eventsFor(next));
    return outcome === 'saved' ? ok(next) : err({ code: 'catalog.version_conflict' });
  };

export type SaveProfileStep = ReturnType<typeof makeSaveProfileStep>;
