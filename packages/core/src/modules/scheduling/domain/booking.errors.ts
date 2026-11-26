import type { DomainError } from '../../../shared/domain/index.ts';
import type { InvalidBookingTransition } from './booking.state.ts';

/** Every expected scheduling failure; mapped to RFC 9457 problems at the API edge (spec §4.9). */
export type BookingError =
  | InvalidBookingTransition
  | InvalidAvailability
  | InvalidGoal
  | AvailabilityConflicts
  | SchedulingNotFound
  | MentorUnavailable
  | SchedulingForbidden
  | VersionConflict
  | SlotTaken
  | SlotUnavailable
  | TrialRequired
  | StudentBusy
  | TrialAlreadyUsed
  | HoldExpired
  | EmailNotVerified
  | NotAcceptingNew
  | HoldRateLimited
  | InsufficientCredit;

/**
 * Why an availability payload is rejected (M3 acceptance: 29/30 min, overlap, grid,
 * notice 1 h 59 min / 2 h / 48 h / 48 h 1 min, buffer 0/30/31 min, a midnight interval).
 */
export type AvailabilityProblem =
  | 'too_short'
  | 'too_long'
  | 'not_on_grid'
  | 'overlap'
  | 'reversed'
  | 'in_the_past'
  | 'out_of_range'
  | 'invalid';

export interface AvailabilityIssue {
  /** Field path of the offending value, e.g. `rules.0.startLocal`, `minNoticeMinutes`. */
  readonly field: string;
  readonly problem: AvailabilityProblem;
}

/** Values that break the availability policies (→ 422 with one issue per field). */
export interface InvalidAvailability extends DomainError<'scheduling.invalid_availability'> {
  readonly issues: readonly AvailabilityIssue[];
}

/**
 * Q11: saving availability that overlaps `requested`/`scheduled` sessions returns the list of
 * those sessions; a second save with `acknowledgeConflicts: true` keeps them (→ 409).
 */
interface AvailabilityConflicts extends DomainError<'scheduling.availability_conflicts'> {
  readonly bookingIds: readonly string[];
}

/** Someone else's resource, or none at all — indistinguishable on purpose (→ 404, spec §8). */
type SchedulingNotFound = DomainError<'scheduling.not_found'>;

/**
 * The mentor cannot be booked at all: no profile, not `approved` or `suspended` (Q5, Q13). One
 * answer for every reason, so a public caller cannot tell a draft from a suspension (→ 404).
 */
type MentorUnavailable = DomainError<'scheduling.mentor_unavailable'>;

/** The actor lacks the permission (→ 403). */
export type SchedulingForbidden = DomainError<'scheduling.forbidden'>;

/** Q1: the e-mail must be verified before the first booking (requirement 14, → 403). */
export type EmailNotVerified = DomainError<'scheduling.email_not_verified'>;

/** Q2/U1: someone took the mentor's slot between rendering and `createHold` (→ 409). */
export type SlotTaken = DomainError<'scheduling.slot_taken'>;

/**
 * U1: the chosen start is not a slot `slotsFor` offers — outside the mentor's availability, too
 * soon (Q9 notice), beyond the 8-week horizon (Q10), in the past or off the grid (→ 409).
 */
type SlotUnavailable = DomainError<'scheduling.slot_unavailable'>;

/** Q2: a later session needs a trial of the pair that was `scheduled` and already took place (→ 409). */
type TrialRequired = DomainError<'scheduling.trial_required'>;

/** C3/U1: the student already has a session at that time, with any mentor (→ 409). */
export type StudentBusy = DomainError<'scheduling.student_busy'>;

/** Q2/Q6: one trial per student–mentor pair; a live trial already occupies it (→ 409). */
export type TrialAlreadyUsed = DomainError<'scheduling.trial_already_used'>;

/** U2: the 10-minute hold expired before checkout (→ 409). */
export type HoldExpired = DomainError<'scheduling.hold_expired'>;

/** Q13: the mentor paused new trial students — a trial is refused, a later session is not (→ 409). */
export type NotAcceptingNew = DomainError<'scheduling.not_accepting_new'>;

/** Q18: at most 20 holds per hour per student (→ 429 + `Retry-After`). */
export interface HoldRateLimited extends DomainError<'scheduling.hold_rate_limited'> {
  readonly retryAfterSeconds: number;
}

/** F4 keeps the balance: the credit of a later session could not be reserved (→ 409). */
export type InsufficientCredit = DomainError<'scheduling.insufficient_credit'>;

/** The case of the goal field of a trial is outside 20–500 characters (→ 422). */
export interface InvalidGoal extends DomainError<'scheduling.invalid_goal'> {
  readonly issue: 'too_short' | 'too_long';
}

/** Optimistic lock: the availability changed in another tab (→ 409 "odśwież"). */
export interface VersionConflict extends DomainError<'scheduling.version_conflict'> {
  readonly expected: number;
  readonly actual: number;
}

