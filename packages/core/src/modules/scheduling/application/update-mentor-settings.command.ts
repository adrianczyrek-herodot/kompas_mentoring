import { type Clock, err, MentorId, ok, type Result } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { MentorSchedule } from '../domain/availability.entity.ts';
import type { BookingError, VersionConflict } from '../domain/booking.errors.ts';
import {
  type MentorSettingsInput,
  validateMentorSettings,
} from '../domain/policies/mentor-schedule.policy.ts';
import { type AvailabilityRepository, requirePermission } from './ports.ts';

export interface UpdateMentorSettingsInput extends MentorSettingsInput {
  readonly expectedVersion: number;
}

const conflict = (expected: number, actual: number): VersionConflict => ({
  code: 'scheduling.version_conflict',
  expected,
  actual,
});

/**
 * M3 settings (requirement 1): notice 2–48 h (Q9), buffer 0–30 min and the IANA time zone (Q12).
 * A stale `expectedVersion` → 409, so two open tabs cannot silently overwrite each other.
 */
export const makeUpdateMentorSettings =
  ({
    clock,
    availabilityRepository,
  }: {
    clock: Clock;
    availabilityRepository: AvailabilityRepository;
  }) =>
  async (
    actor: CurrentUser,
    input: UpdateMentorSettingsInput,
  ): Promise<Result<MentorSchedule, BookingError>> => {
    const allowed = requirePermission(actor, 'scheduling.availability.manage.own');
    if (allowed.isErr()) return err(allowed.error);
    const validated = validateMentorSettings(input);
    if (validated.isErr()) return err(validated.error);

    const mentorId = MentorId.parse(actor.id);
    const stored = await availabilityRepository.findSchedule(mentorId);
    const actualVersion = stored?.version ?? 0;
    if (actualVersion !== input.expectedVersion) {
      return err(conflict(input.expectedVersion, actualVersion));
    }

    const outcome = await availabilityRepository.saveSettings(
      {
        timeZone: input.timeZone,
        minNoticeMinutes: input.minNoticeMinutes,
        bufferMinutes: input.bufferMinutes,
      },
      mentorId,
      input.expectedVersion,
      clock.now(),
    );
    if (outcome === 'version_conflict') {
      const fresh = await availabilityRepository.findSchedule(mentorId);
      return err(conflict(input.expectedVersion, fresh?.version ?? 0));
    }
    const fresh = await availabilityRepository.findSchedule(mentorId);
    return fresh === null ? err({ code: 'scheduling.not_found' }) : ok(fresh);
  };

export type UpdateMentorSettings = ReturnType<typeof makeUpdateMentorSettings>;
