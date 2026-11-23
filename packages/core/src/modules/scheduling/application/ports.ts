import type { Temporal } from 'temporal-polyfill';
import type { BookingId, MentorId, Money, StudentId } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import { type CurrentUser, hasPermission, type Permission } from '../../identity/index.ts';
import type {
  AvailabilityException,
  AvailabilityRule,
  MentorSchedule,
} from '../domain/availability.entity.ts';
import type { Booking, BookingType } from '../domain/booking.entity.ts';
import type { SchedulingForbidden } from '../domain/booking.errors.ts';
import type { BookingStatus } from '../domain/booking.state.ts';
import type { Interval } from '../domain/policies/slots-for.policy.ts';

/** Port: mentor availability (MikroORM adapter in `infrastructure/`). */
export interface AvailabilityRepository {
  findSchedule(mentorId: MentorId): Promise<MentorSchedule | null>;
  listRules(mentorId: MentorId): Promise<AvailabilityRule[]>;
  listExceptions(mentorId: MentorId): Promise<AvailabilityException[]>;
  findException(mentorId: MentorId, id: string): Promise<AvailabilityException | null>;
  /**
   * Replaces the whole weekly template if the stored version still equals `expectedVersion`
   * (`0` until the first save), bumping it. A fresh row is created with version 0 first, so the
   * two concurrent first saves cannot both win.
   */
  saveTemplate(
    mentorId: MentorId,
    rules: readonly AvailabilityRule[],
    expectedVersion: number,
    now: Temporal.Instant,
  ): Promise<'saved' | 'version_conflict'>;
  saveSettings(
    settings: Pick<MentorSchedule, 'timeZone' | 'minNoticeMinutes' | 'bufferMinutes'>,
    mentorId: MentorId,
    expectedVersion: number,
    now: Temporal.Instant,
  ): Promise<'saved' | 'version_conflict'>;
  insertException(
    mentorId: MentorId,
    exception: AvailabilityException,
    now: Temporal.Instant,
  ): Promise<void>;
  /** Deletes only the mentor's own exception; false when it does not exist or belongs to someone else. */
  deleteException(mentorId: MentorId, id: string): Promise<boolean>;
  /**
   * Ids of the mentor's `requested`/`scheduled` bookings that the template would no longer cover
   * (Q11). The adapter resolves the weekly rules against the schedule's time zone and the booking
   * horizon; the `booking` table arrives in step 10, so this is empty in E3-S2.
   */
  listConflictingBookingIds(
    mentorId: MentorId,
    rules: readonly AvailabilityRule[],
  ): Promise<string[]>;
}

/**
 * One mentor as `scheduling` knows them without asking `catalog` (spec "Projekcja
 * mentor_bookability"): mirrored from `catalog.mentor_bookability_changed.v1`, refreshed in the
 * consumer's transaction (spec §4.6).
 */
export interface MentorBookability {
  readonly mentorId: MentorId;
  readonly mentorProfileId: string;
  /** Q5/Q13: an approved profile; a suspended one is still mirrored but cannot be booked. */
  readonly bookable: boolean;
  readonly acceptingNew: boolean;
  /** Q3/F2: the 60-minute rate the booking snapshots; `null` until the mentor sets it. */
  readonly rate60: Money | null;
  readonly updatedAt: Temporal.Instant;
}

/** Port: the `catalog` projection (MikroORM adapter in `infrastructure/`). */
export interface MentorBookabilityRepository {
  /** Public availability: a profile id the projection does not know is unavailable (404). */
  findByProfileId(mentorProfileId: string): Promise<MentorBookability | null>;
  /** Consumer side: stores the newest state; the inbox already deduped the event itself. */
  upsert(bookability: MentorBookability): Promise<void>;
}

/**
 * Port: time that cannot be booked although the template is open (Q17). Bookings join in step 10
 * and Google Calendar in E3-S10; until then the adapter answers with an empty list, so the query,
 * the engine and the API are already complete.
 */
export interface BusyRepository {
  listBusy(
    mentorId: MentorId,
    range: { from: Temporal.Instant; to: Temporal.Instant },
  ): Promise<Interval[]>;
}

/** A booking row about to be inserted (the `hold` command builds it; step 11 reuses it). */
export interface NewBooking {
  readonly id: BookingId;
  readonly mentorId: MentorId;
  readonly studentId: StudentId;
  readonly type: BookingType;
  readonly status: BookingStatus;
  readonly startsAt: Temporal.Instant;
  readonly endsAt: Temporal.Instant;
  readonly bufferMinutes: number;
  readonly holdExpiresAt: Temporal.Instant | null;
  readonly goal: string | null;
  readonly price: Money | null;
  readonly acceptDeadlineAt: Temporal.Instant | null;
  readonly now: Temporal.Instant;
}

/** Why a hold could not be stored; the constraint names of §4.4 decide (23P01/23505). */
export type InsertOutcome =
  | { readonly kind: 'created'; readonly booking: Booking }
  | { readonly kind: 'slot_taken' }
  | { readonly kind: 'student_busy' }
  | { readonly kind: 'trial_already_used' };

/** Port: the `scheduling.booking` table (MikroORM adapter in `infrastructure/`). */
export interface BookingRepository {
  findById(id: BookingId): Promise<Booking | null>;
  /** The student's single active hold (Q18); `null` when there is none. */
  findActiveHold(studentId: StudentId, now: Temporal.Instant): Promise<Booking | null>;
  /** Holds the student took since `since` — the hourly cap of Q18 counts these. */
  countHoldsSince(studentId: StudentId, since: Temporal.Instant): Promise<number>;
  /**
   * One transaction: releases the student's current hold, expires stale overlapping holds and
   * inserts the new one; the exclusion/unique constraints map to `InsertOutcome`. Nothing is
   * committed when the insert fails, so a rejected hold never costs the student their old one.
   */
  createHold(booking: NewBooking): Promise<InsertOutcome>;
  /** The student's own active hold → `expired` via `hold_released`; `null` when not found. */
  releaseHold(
    studentId: StudentId,
    holdId: BookingId,
    now: Temporal.Instant,
  ): Promise<Booking | null>;
  /** A hold past its deadline → `expired` via `hold_expired`; `null` when it is gone. */
  expireHoldById(id: BookingId, now: Temporal.Instant): Promise<Booking | null>;
  /** Job: every hold past `hold_expires_at` → `expired`; returns the affected rows. */
  expireStaleHolds(now: Temporal.Instant): Promise<Booking[]>;
  /**
   * Applies one transition inside a transaction and returns the updated row; `null` when the row is
   * not in any of `expected` (a racing command won). Used by checkout in step 11.
   */
  transition(input: {
    readonly id: BookingId;
    readonly expected: readonly BookingStatus[];
    readonly to: BookingStatus;
    /** Q14: set `accept_deadline_at` when a trial becomes `requested`. */
    readonly acceptDeadlineAt?: Temporal.Instant;
    readonly now: Temporal.Instant;
  }): Promise<Booking | null>;
  /**
   * `checkout` in one transaction: flips the hold (only while it is still `hold` and unexpired),
   * stores the goal and the deadline and publishes the booking events atomically (§4.6).
   */
  completeCheckout(input: CheckoutTransition): Promise<CheckoutOutcome>;
}

/** Q1: what `PaymentGate.start` decided about the money of a booking. */
export type PaymentStart =
  | { readonly kind: 'paid' }
  | { readonly kind: 'pending'; readonly clientSecret: string };

/** Port: the money step of `checkout` (spec "Booking — dane"). F3 adapter pays immediately. */
export interface PaymentGate {
  start(booking: Booking): Promise<PaymentStart>;
}

/** F4: whether the ledger could reserve the credit of a later session (no balance in F3). */
export type CreditReservationOutcome =
  | { readonly kind: 'ok' }
  | { readonly kind: 'insufficient_credit' };

/** Port: reservation of credit for a later session. F3 adapter is unmetered (no balance yet). */
export interface CreditReservation {
  reserve(booking: Booking): Promise<CreditReservationOutcome>;
}

/** Result of the single `checkout` transaction (§4.4). */
export type CheckoutOutcome =
  | { readonly kind: 'confirmed'; readonly booking: Booking }
  | { readonly kind: 'expired' }
  | { readonly kind: 'not_found' };

/** Input of `BookingRepository.completeCheckout`: final state plus the events of the transaction. */
export interface CheckoutTransition {
  readonly bookingId: BookingId;
  readonly studentId: StudentId;
  /** `requested` for a paid trial, `scheduled` for a later session (Q-B2). */
  readonly to: BookingStatus;
  /** U2: the goal the student typed; required for a trial. */
  readonly goal: string | null;
  readonly acceptDeadlineAt: Temporal.Instant | null;
  readonly now: Temporal.Instant;
}

/** Every command and query starts here (spec §8: checked server-side, not in the UI). */
export const requirePermission = (
  actor: CurrentUser,
  permission: Permission,
): Result<void, SchedulingForbidden> =>
  hasPermission(actor.roles, permission) ? ok(undefined) : err({ code: 'scheduling.forbidden' });
