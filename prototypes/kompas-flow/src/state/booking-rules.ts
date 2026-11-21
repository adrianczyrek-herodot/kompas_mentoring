/**
 * Booking rules from the brief (§4) and KONCEPCJA, computed from the demo clock. In the app these
 * decisions come from the domain (`canCancelFree`, `joinOpen`), never from the UI.
 */
import type { BookingStatus, PolicyState, SessionSummary } from '@kompas/ui';
import type { Booking } from '../data/accounts';
import { mentorById } from '../data/mentors';
import { addMinutes, minutesBetween, toMs } from '../lib/clock';

const FREE_CHANGE_MINUTES = 12 * 60;
const ROOM_OPENS_BEFORE = 10;
const DISPUTE_WINDOW_MINUTES = 72 * 60;

export function policyOf(booking: Booking, now: string): PolicyState {
  const minutesLeft = minutesBetween(now, booking.startsAt);
  if (minutesLeft <= 0) return 'started';
  return minutesLeft >= FREE_CHANGE_MINUTES ? 'free' : 'late';
}

export function freeUntil(booking: Booking): string {
  return addMinutes(booking.startsAt, -FREE_CHANGE_MINUTES);
}

export function joinFrom(booking: Booking): string {
  return addMinutes(booking.startsAt, -ROOM_OPENS_BEFORE);
}

function endsAt(booking: Booking): string {
  return addMinutes(booking.startsAt, booking.durationMin);
}

/** Room open from start − 10 min until the end (KONCEPCJA §U4, §U6). */
export function joinOpen(booking: Booking, now: string): boolean {
  return (
    booking.status === 'scheduled' &&
    toMs(now) >= toMs(joinFrom(booking)) &&
    toMs(now) < toMs(endsAt(booking))
  );
}

/** Status shown to the user: a scheduled session whose time has come is „W trakcie”. */
export function displayStatus(booking: Booking, now: string): BookingStatus {
  if (booking.status !== 'scheduled') return booking.status;
  if (toMs(now) >= toMs(booking.startsAt) && toMs(now) < toMs(endsAt(booking))) return 'in_progress';
  return booking.status;
}

export function isUpcoming(booking: Booking, now: string): boolean {
  return (
    (booking.status === 'scheduled' || booking.status === 'requested') &&
    toMs(endsAt(booking)) > toMs(now)
  );
}

/** Problem report up to 72 h after the session (KONCEPCJA §U5 „Walidacje”). */
export function canReportProblem(booking: Booking, now: string): boolean {
  const sinceEnd = minutesBetween(endsAt(booking), now);
  return booking.status === 'completed' && sinceEnd >= 0 && sinceEnd <= DISPUTE_WINDOW_MINUTES;
}

/** Max one trial per student–mentor pair (brief rule 1); cancelled trials do not count. */
export function hadTrialWith(bookings: readonly Booking[], mentorId: string): boolean {
  return bookings.some(
    (b) => b.mentorId === mentorId && b.type === 'trial' && b.status !== 'cancelled',
  );
}

export function toSummary(booking: Booking, now: string, withName?: string): SessionSummary {
  return {
    id: booking.id,
    startsAt: booking.startsAt,
    durationMin: booking.durationMin,
    type: booking.type,
    status: displayStatus(booking, now),
    withName: withName ?? mentorById(booking.mentorId)?.name ?? 'Mentor',
    goal: booking.goal,
  };
}
