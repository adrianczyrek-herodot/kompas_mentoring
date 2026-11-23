import type { Temporal } from 'temporal-polyfill';
import type { Booking } from '../domain/booking.entity.ts';

/** `.ics` download: a filename and its content (`GET /bookings/:id/ics`). */
export interface BookingIcs {
  readonly filename: string;
  readonly content: string;
}

const pad = (value: number): string => value.toString().padStart(2, '0');

/** RFC 5545 UTC timestamp: `YYYYMMDDTHHMMSSZ`. */
const stamp = (instant: Temporal.Instant): string => {
  const { year, month, day, hour, minute, second } = instant.toZonedDateTimeISO('UTC');
  return `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}${pad(second)}Z`;
};

/**
 * Minimal `.ics` of one booking (U3, requirement 6): `UID = <bookingId>@kompas` and
 * `SEQUENCE = reschedule_count`, so a reschedule updates the same calendar entry instead of adding
 * a second one. DTSTART/DTEND are UTC instants.
 */
export const toIcs = (booking: Booking): BookingIcs => {
  const summary = booking.type === 'trial' ? 'Sesja próbna — Kompas' : 'Sesja — Kompas';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kompas//Booking//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@kompas`,
    `SEQUENCE:${booking.rescheduleCount}`,
    `DTSTAMP:${stamp(booking.createdAt)}`,
    `DTSTART:${stamp(booking.startsAt)}`,
    `DTEND:${stamp(booking.endsAt)}`,
    `SUMMARY:${summary}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return { filename: `kompas-${booking.id}.ics`, content: `${lines.join('\r\n')}\r\n` };
};
