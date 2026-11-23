import type { Temporal } from 'temporal-polyfill';
import { type Clock, err, MentorId, ok, type Result } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { AvailabilityRule } from '../domain/availability.entity.ts';
import type { BookingError, VersionConflict } from '../domain/booking.errors.ts';
import { validateTemplate } from '../domain/policies/availability-template.policy.ts';
import { type MentorCalendar, readMentorCalendar } from './mentor-calendar.ts';
import { type AvailabilityRepository, requirePermission } from './ports.ts';

export interface SaveAvailabilityTemplateInput {
  readonly rules: readonly AvailabilityRule[];
  readonly expectedVersion: number;
  /** Q11: a second save keeps the sessions the change overlaps. */
  readonly acknowledgeConflicts: boolean;
}

const conflict = (expected: number, actual: number): VersionConflict => ({
  code: 'scheduling.version_conflict',
  expected,
  actual,
});

/**
 * M3 "Zapisz": validates the whole weekly template and replaces it (requirement 1, T1). The owner
 * comes from the session, never from the request body (A01); a stale `expectedVersion` → 409.
 * A change that overlaps `requested`/`scheduled` sessions returns their ids (Q11) unless the caller
 * acknowledges them — the sessions themselves are never touched (the conflict list depends on the
 * `booking` table from step 10, so it is empty in E3-S2).
 */
export const makeSaveAvailabilityTemplate =
  ({
    clock,
    availabilityRepository,
  }: {
    clock: Clock;
    availabilityRepository: AvailabilityRepository;
  }) =>
  async (
    actor: CurrentUser,
    input: SaveAvailabilityTemplateInput,
  ): Promise<Result<MentorCalendar, BookingError>> => {
    const allowed = requirePermission(actor, 'scheduling.availability.manage.own');
    if (allowed.isErr()) return err(allowed.error);
    const validated = validateTemplate(input.rules);
    if (validated.isErr()) return err(validated.error);

    const mentorId = MentorId.parse(actor.id);
    const stored = await availabilityRepository.findSchedule(mentorId);
    const actualVersion = stored?.version ?? 0;
    if (actualVersion !== input.expectedVersion)
      return err(conflict(input.expectedVersion, actualVersion));

    const conflicts = await availabilityRepository.listConflictingBookingIds(mentorId, input.rules);
    if (conflicts.length > 0 && !input.acknowledgeConflicts) {
      return err({ code: 'scheduling.availability_conflicts', bookingIds: conflicts });
    }

    const now: Temporal.Instant = clock.now();
    const outcome = await availabilityRepository.saveTemplate(
      mentorId,
      input.rules,
      input.expectedVersion,
      now,
    );
    if (outcome === 'version_conflict') {
      const fresh = await availabilityRepository.findSchedule(mentorId);
      return err(conflict(input.expectedVersion, fresh?.version ?? 0));
    }
    return ok(await readMentorCalendar(availabilityRepository, mentorId));
  };

export type SaveAvailabilityTemplate = ReturnType<typeof makeSaveAvailabilityTemplate>;
