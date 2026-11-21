/**
 * What the current account can book with a mentor (brief rules 1–2): a trial (max one per pair),
 * a session from the plan balance, or nothing until a plan is bought. Mentors and admins do not book.
 */
import type { Account, Booking } from '../data/accounts';
import type { Mentor } from '../data/mentors';
import { hadTrialWith } from './booking-rules';

export type BookingIntent =
  | { kind: 'trial' }
  | { kind: 'plan'; balance: number }
  | { kind: 'needs-plan' }
  | { kind: 'paused' }
  | { kind: 'not-student' };

export function bookingIntent(
  account: Account,
  mentor: Mentor,
  myBookings: readonly Booking[],
  balance: number,
): BookingIntent {
  if (account.role === 'mentor' || account.role === 'admin') return { kind: 'not-student' };
  if (balance > 0) return { kind: 'plan', balance };
  if (!mentor.acceptingNew) return { kind: 'paused' };
  if (hadTrialWith(myBookings, mentor.id)) return { kind: 'needs-plan' };
  return { kind: 'trial' };
}
