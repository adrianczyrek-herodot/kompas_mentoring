import { type DomainError, err, ok, type Result } from '../../../shared/domain/index.ts';

export type BookingStatus =
  | 'hold'
  | 'pending_payment'
  | 'requested'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'late_cancelled'
  | 'no_show_student'
  | 'no_show_mentor'
  | 'disputed'
  | 'cancelled'
  | 'expired'
  | 'settled'
  | 'refunded';

export type BookingEvent =
  | 'checkout_started'
  | 'confirmed_with_credit'
  | 'hold_expired'
  | 'payment_succeeded'
  | 'mentor_accepted'
  | 'auto_accepted'
  | 'mentor_declined'
  | 'calendar_conflict'
  | 'started'
  | 'rescheduled'
  | 'cancelled_free'
  | 'cancelled_late'
  | 'cancelled_by_mentor'
  | 'mentor_no_show'
  | 'student_no_show'
  | 'ended'
  | 'dispute_opened'
  | 'settled'
  | 'resolved_no_refund'
  | 'resolved_refund';

export interface InvalidBookingTransition extends DomainError<'booking.invalid_transition'> {
  readonly from: BookingStatus;
  readonly event: BookingEvent;
}

/** Transition table from spec §4.3 — the single source of truth for the booking lifecycle. */
const transitions = {
  hold: {
    checkout_started: 'pending_payment',
    confirmed_with_credit: 'scheduled',
    hold_expired: 'expired',
  },
  pending_payment: { payment_succeeded: 'requested', hold_expired: 'expired' },
  requested: {
    mentor_accepted: 'scheduled',
    auto_accepted: 'scheduled',
    mentor_declined: 'cancelled',
    calendar_conflict: 'cancelled',
  },
  scheduled: {
    started: 'in_progress',
    rescheduled: 'scheduled',
    cancelled_free: 'cancelled', // Z4: ≥ 12 h before start, credit returns
    cancelled_late: 'late_cancelled', // Z4: < 12 h before start, credit is forfeited
    cancelled_by_mentor: 'cancelled',
    mentor_no_show: 'no_show_mentor',
    student_no_show: 'no_show_student',
  },
  in_progress: {
    ended: 'completed',
    mentor_no_show: 'no_show_mentor',
    student_no_show: 'no_show_student',
  },
  completed: { dispute_opened: 'disputed', settled: 'settled' },
  late_cancelled: { dispute_opened: 'disputed', settled: 'settled' },
  no_show_student: { dispute_opened: 'disputed', settled: 'settled' },
  disputed: { resolved_no_refund: 'settled', resolved_refund: 'refunded' },
  no_show_mentor: {},
  cancelled: {},
  expired: {},
  settled: {},
  refunded: {},
} as const satisfies Record<BookingStatus, Partial<Record<BookingEvent, BookingStatus>>>;

export const transition = (
  from: BookingStatus,
  event: BookingEvent,
): Result<BookingStatus, InvalidBookingTransition> => {
  const allowed: Partial<Record<BookingEvent, BookingStatus>> = transitions[from];
  const to = allowed[event];
  return to === undefined ? err({ code: 'booking.invalid_transition', from, event }) : ok(to);
};
