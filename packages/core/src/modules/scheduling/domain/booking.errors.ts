import type { DomainError } from '../../../shared/domain/index.ts';
import type { InvalidBookingTransition } from './booking.state.ts';

/** Every expected scheduling failure; mapped to RFC 9457 problems at the API edge (spec §4.9). */
export type BookingError =
  | InvalidBookingTransition
  | InvalidAvailability
  | AvailabilityConflicts
  | SchedulingNotFound
  | MentorUnavailable
  | SchedulingForbidden
  | VersionConflict;

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

/** Optimistic lock: the availability changed in another tab (→ 409 "odśwież"). */
export interface VersionConflict extends DomainError<'scheduling.version_conflict'> {
  readonly expected: number;
  readonly actual: number;
}

