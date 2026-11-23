import type { Temporal } from 'temporal-polyfill';
import type { BookingId, MentorId, Money, StudentId } from '../../../shared/domain/index.ts';
import type { BookingStatus } from './booking.state.ts';

/** Unions instead of flags (spec §6.3). */
export type BookingType = 'trial' | 'plan' | 'single';

/** Q1: which payment adapter confirmed the booking; `none` until F4 turns Stripe on. */
export type BookingPaymentMode = 'none' | 'stripe';

/** Who ended the booking (spec §4.4). */
export type BookingCancelledBy = 'student' | 'mentor' | 'system';

/**
 * Booking aggregate (pure domain shape, spec §4.4). Persistence mapping lives in infrastructure/;
 * holds are bookings in the `hold` state. `bufferMinutes` and `price` are snapshots taken at booking
 * time, so a later change to the mentor's settings or rate never moves an existing booking (Q11).
 */
export interface Booking {
  readonly id: BookingId;
  readonly mentorId: MentorId;
  readonly studentId: StudentId;
  readonly type: BookingType;
  readonly status: BookingStatus;
  readonly startsAt: Temporal.Instant;
  readonly endsAt: Temporal.Instant;
  readonly bufferMinutes: number;
  readonly holdExpiresAt: Temporal.Instant | null;
  readonly goal: string | null;
  readonly price: Money | null;
  readonly paymentMode: BookingPaymentMode | null;
  readonly acceptDeadlineAt: Temporal.Instant | null;
  readonly declineReason: string | null;
  readonly declineComment: string | null;
  readonly cancelledBy: BookingCancelledBy | null;
  readonly cancelReason: string | null;
  readonly rescheduleCount: number;
  readonly version: number;
  readonly createdAt: Temporal.Instant;
  readonly updatedAt: Temporal.Instant;
}
