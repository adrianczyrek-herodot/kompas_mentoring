import type { Temporal } from 'temporal-polyfill';

/** One bookable session start, as a pair of instants (the UI formats them in its own zone). */
export interface AvailableSlot {
  readonly startsAt: Temporal.Instant;
  readonly endsAt: Temporal.Instant;
}

/**
 * Answer of the public availability query (requirement 20, U1): the requested window, the first
 * bookable start after it („następny wolny termin", U1 state E) and the mentor's own zone, so the
 * client can label the grid.
 */
export interface MentorAvailabilitySlots {
  /** Q12: the mentor's zone — the template is wall-clock time in it. */
  readonly mentorTimeZone: string;
  readonly durationMinutes: number;
  readonly slots: readonly AvailableSlot[];
  /** First bookable start after `to`, inside the horizon; `null` when there is none (U1). */
  readonly nextAvailableAt: Temporal.Instant | null;
}
