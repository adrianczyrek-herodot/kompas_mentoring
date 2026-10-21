import type { Temporal } from 'temporal-polyfill';
import type { BookingId, MentorId, StudentId } from '../../../shared/domain/index.ts';
import type { BookingStatus } from './booking.state.ts';

/** Unions instead of flags (spec §6.3). */
export type BookingType = 'trial' | 'plan' | 'single';

/**
 * Booking aggregate (pure domain shape). Persistence mapping lives in infrastructure/ (F3);
 * holds are bookings in the `hold` state (spec §4.3, §4.4).
 */
export interface Booking {
  readonly id: BookingId;
  readonly mentorId: MentorId;
  readonly studentId: StudentId;
  readonly type: BookingType;
  readonly status: BookingStatus;
  readonly startsAt: Temporal.Instant;
  readonly endsAt: Temporal.Instant;
}
