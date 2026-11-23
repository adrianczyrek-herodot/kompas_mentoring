import { err, MentorId, ok, type Result } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { BookingError } from '../domain/booking.errors.ts';
import { type MentorCalendar, readMentorCalendar } from './mentor-calendar.ts';
import { type AvailabilityRepository, requirePermission } from './ports.ts';

/**
 * M3: the mentor's own week of availability and sessions (requirement 1). The mentor id comes from
 * the session, never from the request (A01) — a mentor can only ever read their own calendar.
 * Sessions are empty until step 10 of the plan adds the `booking` table.
 */
export const makeGetMentorCalendar =
  ({ availabilityRepository }: { availabilityRepository: AvailabilityRepository }) =>
  async (actor: CurrentUser): Promise<Result<MentorCalendar, BookingError>> => {
    const allowed = requirePermission(actor, 'scheduling.availability.manage.own');
    if (allowed.isErr()) return err(allowed.error);
    const calendar = await readMentorCalendar(availabilityRepository, MentorId.parse(actor.id));
    return ok(calendar);
  };

export type GetMentorCalendar = ReturnType<typeof makeGetMentorCalendar>;
