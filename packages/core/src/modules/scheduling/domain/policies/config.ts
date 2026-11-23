import { Temporal } from 'temporal-polyfill';
import { money } from '../../../../shared/domain/index.ts';

// Business constants of the scheduling module, each linked to its decision (spec §4.1).

/** Z4: a student may cancel or reschedule for free up to 12 h before the session starts. */
export const FREE_CANCELLATION_NOTICE = Temporal.Duration.from({ hours: 12 });

/**
 * Q9/Q10/M3: the weekly template, mentor settings and the booking horizon.
 * The contract limits in `packages/contracts/scheduling` mirror these numbers
 * (`contracts-parity` keeps both in step).
 */
export const AVAILABILITY = {
  /** Every template interval lasts at least 30 min (M3). */
  minRuleMinutes: 30,
  /** Interval boundaries sit on the 30-min grid (M3) and slots advance by the same step. */
  gridMinutes: 30,
  /** Q10: a mentor may only set exceptions inside the 8-week booking horizon. */
  exceptionMinMinutes: 30,
  /** Weekly template below this is not enough to submit the M1 application (F2 requirement). */
  weeklyMinimumMinutes: 180,
  /** Q9: booking notice — mentor editable between 2 h and 48 h, default 6 h. */
  notice: { minMinutes: 120, maxMinutes: 2_880, defaultMinutes: 360, stepMinutes: 60 },
  /** M3: buffer after a session — 0–30 min every 5 min, default 0. */
  buffer: { minMinutes: 0, maxMinutes: 30, defaultMinutes: 0, stepMinutes: 5 },
  /** Q12: time zone used until the mentor's browser reports its own. */
  defaultTimeZone: 'Europe/Warsaw',
} as const;

/** Q10: bookings (and availability exceptions) live inside an 8-week horizon (56 days, as hours:
 * `Temporal.Instant` only accepts time units, never days or weeks). */
export const BOOKING_HORIZON = Temporal.Duration.from({ hours: 56 * 24 });

/** Q9: a trial booking always respects at least 6 h of notice so the mentor can answer. */
export const TRIAL_MIN_NOTICE = Temporal.Duration.from({ hours: 6 });

/** Q18: one active hold per student, 10 minutes long, at most 20 holds per hour per student. */
export const HOLD = {
  durationMinutes: 10,
  maxPerHour: 20,
  windowMinutes: 60,
} as const;

/** U2/U3: „Z czym przychodzisz?” — required for a trial, 20–500 characters. */
export const GOAL = { minLength: 20, maxLength: 500 } as const;

/** Q3: one platform-wide trial price until F4; a later session snapshots the mentor's rate. */
export const TRIAL_PRICE = money.of(4_900n);
