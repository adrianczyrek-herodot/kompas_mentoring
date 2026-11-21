/**
 * Free slots of a mentor, generated from the weekly availability of the grey mockups. Weeks start
 * on Monday; week 0 is the week of the demo „now” (19–25 October 2026). Slots earlier than 6 h
 * from now (KONCEPCJA §U1 „minimalne wyprzedzenie”) and slots taken by bookings are left out.
 */
import type { DaySlots } from '@kompas/ui';
import type { Booking } from './accounts';
import type { Mentor } from './mentors';
import { addMinutes, toMs, warsawIso } from '../lib/clock';

const MIN_NOTICE_MINUTES = 6 * 60;
/** Bookings at most 14 days ahead (KONCEPCJA §P3 „brak slotów w 14 dni”) → three calendar weeks. */
const BOOKING_HORIZON_MINUTES = 14 * 24 * 60;
export const WEEKS_AHEAD = 3;

const FIRST_MONDAY = { year: 2026, month: 10, day: 19 };
const DAYS_IN_OCTOBER = 31;

function dateOf(offsetDays: number) {
  const day = FIRST_MONDAY.day + offsetDays;
  return day > DAYS_IN_OCTOBER
    ? { year: 2026, month: 11, day: day - DAYS_IN_OCTOBER }
    : { year: 2026, month: 10, day };
}

export function slotId(mentorId: string, startsAt: string): string {
  return `${mentorId}@${startsAt}`;
}

export function weekDays(
  mentor: Mentor,
  week: number,
  now: string,
  bookings: readonly Booking[],
  takenSlots: readonly string[] = [],
): DaySlots[] {
  const earliest = toMs(addMinutes(now, MIN_NOTICE_MINUTES));
  const latest = toMs(addMinutes(now, BOOKING_HORIZON_MINUTES));
  const taken = new Set(
    bookings
      .filter((b) => b.mentorId === mentor.id && b.status !== 'cancelled')
      .map((b) => toMs(b.startsAt)),
  );
  return Array.from({ length: 7 }, (_, weekday) => {
    const { year, month, day } = dateOf(week * 7 + weekday);
    const hours = mentor.availability[weekday] ?? [];
    const slots = hours
      .map((hour) => warsawIso(year, month, day, hour))
      .filter((iso) => toMs(iso) >= earliest && toMs(iso) <= latest && !taken.has(toMs(iso)))
      .map((iso) => ({ id: slotId(mentor.id, iso), startsAt: iso }))
      .filter((slot) => !takenSlots.includes(slot.id));
    return { date: warsawIso(year, month, day, 12), slots };
  });
}

const monthDay = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long' });

export function weekLabel(week: number): string {
  const first = dateOf(week * 7);
  const last = dateOf(week * 7 + 6);
  const start = new Date(warsawIso(first.year, first.month, first.day, 12));
  const end = new Date(warsawIso(last.year, last.month, last.day, 12));
  const startText = first.month === last.month ? String(first.day) : monthDay.format(start);
  return `${startText}–${monthDay.format(end)} ${String(last.year)}`;
}

/** First free slot after the given week, for the „Następny wolny termin” jump (KONCEPCJA §U1 E). */
export function nextAvailableAfter(
  mentor: Mentor,
  week: number,
  now: string,
  bookings: readonly Booking[],
  takenSlots: readonly string[] = [],
): { week: number; startsAt: string } | undefined {
  for (let next = week + 1; next < WEEKS_AHEAD; next += 1) {
    const slot = weekDays(mentor, next, now, bookings, takenSlots).flatMap((day) => day.slots)[0];
    if (slot) return { week: next, startsAt: slot.startsAt };
  }
  return undefined;
}

export function hasSlotsIn14Days(mentor: Mentor, now: string, bookings: readonly Booking[]) {
  return Array.from({ length: WEEKS_AHEAD }, (_, week) => week).some((week) =>
    weekDays(mentor, week, now, bookings).some((day) => day.slots.length > 0),
  );
}
