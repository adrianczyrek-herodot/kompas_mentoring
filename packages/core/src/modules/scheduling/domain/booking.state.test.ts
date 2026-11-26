import { describe, expect, it } from 'vitest';
import {
  type BookingEvent,
  type BookingStatus,
  sourcesOf,
  transition,
  transitionAll,
} from './booking.state.ts';

const STATUSES: BookingStatus[] = [
  'hold',
  'pending_payment',
  'requested',
  'scheduled',
  'in_progress',
  'completed',
  'late_cancelled',
  'no_show_student',
  'no_show_mentor',
  'disputed',
  'cancelled',
  'expired',
  'settled',
  'refunded',
];

const EVENTS: BookingEvent[] = [
  'checkout_started',
  'confirmed_with_credit',
  'hold_released',
  'hold_expired',
  'payment_succeeded',
  'mentor_accepted',
  'auto_accepted',
  'mentor_declined',
  'calendar_conflict',
  'cancelled_by_student',
  'started',
  'rescheduled',
  'cancelled_free',
  'cancelled_late',
  'cancelled_by_mentor',
  'mentor_no_show',
  'student_no_show',
  'ended',
  'dispute_opened',
  'settled',
  'resolved_no_refund',
  'resolved_refund',
];

const ALLOWED: [BookingStatus, BookingEvent, BookingStatus][] = [
  ['hold', 'checkout_started', 'pending_payment'],
  ['hold', 'confirmed_with_credit', 'scheduled'],
  ['hold', 'hold_released', 'expired'],
  ['hold', 'hold_expired', 'expired'],
  ['pending_payment', 'payment_succeeded', 'requested'],
  ['pending_payment', 'hold_expired', 'expired'],
  ['requested', 'mentor_accepted', 'scheduled'],
  ['requested', 'auto_accepted', 'scheduled'],
  ['requested', 'mentor_declined', 'cancelled'],
  ['requested', 'calendar_conflict', 'cancelled'],
  ['requested', 'cancelled_by_student', 'cancelled'],
  ['scheduled', 'started', 'in_progress'],
  ['scheduled', 'rescheduled', 'scheduled'],
  ['scheduled', 'cancelled_free', 'cancelled'],
  ['scheduled', 'cancelled_late', 'late_cancelled'],
  ['scheduled', 'cancelled_by_mentor', 'cancelled'],
  ['scheduled', 'mentor_no_show', 'no_show_mentor'],
  ['scheduled', 'student_no_show', 'no_show_student'],
  ['in_progress', 'ended', 'completed'],
  ['in_progress', 'mentor_no_show', 'no_show_mentor'],
  ['in_progress', 'student_no_show', 'no_show_student'],
  ['completed', 'dispute_opened', 'disputed'],
  ['completed', 'settled', 'settled'],
  ['late_cancelled', 'dispute_opened', 'disputed'],
  ['late_cancelled', 'settled', 'settled'],
  ['no_show_student', 'dispute_opened', 'disputed'],
  ['no_show_student', 'settled', 'settled'],
  ['disputed', 'resolved_no_refund', 'settled'],
  ['disputed', 'resolved_refund', 'refunded'],
];

describe('booking state machine', () => {
  it('follows the trial path from hold to scheduled', () => {
    const status = transition('hold', 'checkout_started')
      .andThen((s) => transition(s, 'payment_succeeded'))
      .andThen((s) => transition(s, 'mentor_accepted'));
    expect(status._unsafeUnwrap()).toBe('scheduled');
  });

  it('lets the student release a hold or withdraw a request (F3 Q7)', () => {
    expect(transition('hold', 'hold_released')._unsafeUnwrap()).toBe('expired');
    expect(transition('requested', 'cancelled_by_student')._unsafeUnwrap()).toBe('cancelled');
  });

  it.each(ALLOWED)('%s --%s--> %s', (from, event, to) => {
    expect(transition(from, event)._unsafeUnwrap()).toBe(to);
  });

  it('applies several events in a row and stops at the first invalid one', () => {
    expect(
      transitionAll('hold', ['checkout_started', 'payment_succeeded'])._unsafeUnwrap(),
    ).toBe('requested');
    expect(transitionAll('hold', ['confirmed_with_credit'])._unsafeUnwrap()).toBe('scheduled');
    expect(transitionAll('expired', ['checkout_started'])._unsafeUnwrapErr()).toEqual({
      code: 'booking.invalid_transition',
      from: 'expired',
      event: 'checkout_started',
    });
  });

  it('lists the source statuses of an event for set-based writers', () => {
    expect(sourcesOf('hold_expired')).toEqual({ from: ['hold', 'pending_payment'], to: 'expired' });
    expect(sourcesOf('hold_released')).toEqual({ from: ['hold'], to: 'expired' });
  });

  it('rejects every transition missing from the table', () => {
    const allowed = new Set(ALLOWED.map(([from, event]) => `${from}:${event}`));
    for (const from of STATUSES) {
      for (const event of EVENTS.filter((e) => !allowed.has(`${from}:${e}`))) {
        expect(transition(from, event)._unsafeUnwrapErr()).toEqual({
          code: 'booking.invalid_transition',
          from,
          event,
        });
      }
    }
  });
});
