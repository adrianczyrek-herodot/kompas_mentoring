import type { Clock } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type {
  CatalogForbidden,
  CatalogNotFound,
  ProfileLocked,
  VersionConflict,
} from '../domain/catalog.errors.ts';
import { type MentorProfile, setAcceptingNew } from '../domain/mentor-profile.entity.ts';
import { type MentorProfileRepository, requirePermission } from './ports.ts';

export interface SetAcceptingNewInput {
  readonly acceptingNew: boolean;
  /** Optimistic lock, like every other catalogue write (a second tab → 409 "odśwież"). */
  readonly expectedVersion: number;
}

export type SetAcceptingNewError =
  | CatalogForbidden
  | CatalogNotFound
  | ProfileLocked
  | VersionConflict;

/**
 * Q13 "wstrzymaj przyjmowanie nowych uczniów" from the M3 settings: `catalog` stays the source of
 * truth and publishes `catalog.mentor_bookability_changed.v1` in the same transaction, so
 * `scheduling` rejects a new trial without ever calling back into `catalog` (spec §2.4 rule 5).
 */
export const makeSetAcceptingNew =
  ({
    clock,
    mentorProfileRepository,
  }: {
    clock: Clock;
    mentorProfileRepository: MentorProfileRepository;
  }) =>
  async (
    actor: CurrentUser,
    input: SetAcceptingNewInput,
  ): Promise<Result<MentorProfile, SetAcceptingNewError>> => {
    const allowed = requirePermission(actor, 'catalog.mentor_profile.edit.own');
    if (allowed.isErr()) return err(allowed.error);
    const profile = await mentorProfileRepository.findByUserId(actor.id);
    if (profile === null) return err({ code: 'catalog.not_found' });
    if (profile.version !== input.expectedVersion) return err({ code: 'catalog.version_conflict' });
    const changed = setAcceptingNew(profile, input.acceptingNew, clock.now());
    if (changed.isErr()) return err(changed.error);
    const next = { ...changed.value, version: input.expectedVersion + 1 };
    const outcome = await mentorProfileRepository.save(next, input.expectedVersion, [
      // Always published, in both directions: `scheduling` mirrors the flag (Q13).
      { name: 'catalog.mentor_bookability_changed.v1', mentorProfileId: next.id },
    ]);
    return outcome === 'saved' ? ok(next) : err({ code: 'catalog.version_conflict' });
  };

export type SetAcceptingNew = ReturnType<typeof makeSetAcceptingNew>;
