import type { Temporal } from 'temporal-polyfill';
import { v7 as uuidv7 } from 'uuid';
import { money } from '../../../shared/domain/index.ts';
import type { OutboxEvent } from '../../../shared/infrastructure/events/outbox.ts';
import type { Booking } from '../domain/booking.entity.ts';

// Outbox events of the booking lifecycle (spec §4.7); infrastructure builds them so the payload
// stays next to the writer that publishes it. The contract schemas in `@kompas/contracts/events`
// are the wire shape.

/** scheduling → notifications: a trial waits for the mentor's decision (Q14). */
export const bookingRequestedEvent = (
  booking: Booking,
  acceptDeadlineAt: Temporal.Instant,
  now: Temporal.Instant,
): OutboxEvent => ({
  eventId: uuidv7(),
  name: 'scheduling.booking_requested.v1',
  occurredAt: now.toString(),
  payload: {
    bookingId: booking.id,
    mentorId: booking.mentorId,
    studentId: booking.studentId,
    startsAt: booking.startsAt.toString(),
    endsAt: booking.endsAt.toString(),
    acceptDeadlineAt: acceptDeadlineAt.toString(),
  },
});

/** scheduling → notifications/ledger: the booking is `scheduled` (credit or mentor/auto). */
export const bookingConfirmedEvent = (
  booking: Booking,
  confirmedBy: 'mentor' | 'auto' | 'credit',
  now: Temporal.Instant,
): OutboxEvent => ({
  eventId: uuidv7(),
  name: 'scheduling.booking_confirmed.v1',
  occurredAt: now.toString(),
  payload: {
    bookingId: booking.id,
    type: booking.type,
    mentorId: booking.mentorId,
    studentId: booking.studentId,
    startsAt: booking.startsAt.toString(),
    endsAt: booking.endsAt.toString(),
    price:
      booking.price === null
        ? null
        : { amountMinorUnits: money.toMinorUnits(booking.price), currency: booking.price.currency },
    confirmedBy,
  },
});

/** scheduling → billing (F4): a hold was released or expired without becoming a request. */
export const bookingExpiredEvent = (booking: Booking, now: Temporal.Instant): OutboxEvent => ({
  eventId: uuidv7(),
  name: 'scheduling.booking_expired.v1',
  occurredAt: now.toString(),
  payload: { bookingId: booking.id, fromStatus: booking.status },
});
