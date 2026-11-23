import type { MentorId } from '../../../shared/domain/index.ts';
import {
  type AvailabilityException,
  type AvailabilityRule,
  defaultScheduleSettings,
  type MentorSchedule,
} from '../domain/availability.entity.ts';
import { sortTemplate } from '../domain/policies/availability-template.policy.ts';
import type { AvailabilityRepository } from './ports.ts';

/** The whole editable availability of one mentor, as M3 reads it (no sessions yet). */
export interface MentorCalendar {
  readonly schedule: MentorSchedule;
  readonly rules: readonly AvailabilityRule[];
  readonly exceptions: readonly AvailabilityException[];
}

/**
 * Reads the mentor's settings, weekly template and exceptions. A mentor who never saved anything
 * gets the defaults with `version: 0`, so the first save sends `expectedVersion: 0`.
 */
export const readMentorCalendar = async (
  repository: AvailabilityRepository,
  mentorId: MentorId,
): Promise<MentorCalendar> => {
  const [schedule, rules, exceptions] = await Promise.all([
    repository.findSchedule(mentorId),
    repository.listRules(mentorId),
    repository.listExceptions(mentorId),
  ]);
  return {
    schedule: schedule ?? { mentorId, ...defaultScheduleSettings() },
    rules: sortTemplate(rules),
    exceptions,
  };
};
