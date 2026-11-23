import type { MentorId } from '../../../shared/domain/index.ts';
import { weeklyAvailabilityMinutes } from '../domain/policies/availability-template.policy.ts';
import type { AvailabilityRepository } from './ports.ts';

/**
 * Public query for `catalog` (the only direction `catalog → scheduling`, spec "Dostępność"):
 * the weekly template's minutes in the mentor's local time, without exceptions. F2 uses it to
 * enforce the 3 h minimum when the mentor submits the M1 application (requirement 2).
 */
export const makeGetWeeklyAvailabilityMinutes =
  ({ availabilityRepository }: { availabilityRepository: AvailabilityRepository }) =>
  async (mentorId: MentorId): Promise<number> => {
    const rules = await availabilityRepository.listRules(mentorId);
    return weeklyAvailabilityMinutes(rules);
  };

export type GetWeeklyAvailabilityMinutes = ReturnType<typeof makeGetWeeklyAvailabilityMinutes>;
