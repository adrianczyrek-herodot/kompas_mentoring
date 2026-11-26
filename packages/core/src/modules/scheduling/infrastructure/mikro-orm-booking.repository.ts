import type { EntityManager } from '@mikro-orm/postgresql';
import type { Temporal } from 'temporal-polyfill';
import type { BookingId, MentorId, StudentId } from '../../../shared/domain/index.ts';
import type { Env } from '../../../shared/infrastructure/env.ts';
import type { EventPublisher } from '../../../shared/infrastructure/events/outbox.ts';
import type {
  BookingRepository,
  CheckoutOutcome,
  CheckoutTransition,
  CreditReservation,
  InsertOutcome,
  NewBooking,
} from '../application/ports.ts';
import type { Booking } from '../domain/booking.entity.ts';
import {
  type BookingEvent,
  type BookingStatus,
  sourcesOf,
  transitionAll,
} from '../domain/booking.state.ts';
import {
  bookingConfirmedEvent,
  bookingExpiredEvent,
  bookingRequestedEvent,
} from './booking.events.ts';
import { toBooking, toDate } from './booking.mapper.ts';
import { BookingRecord } from './scheduling.records.ts';

const INSERT_BOOKING = `insert into "scheduling"."booking"
  ("id", "mentor_id", "student_id", "type", "status", "starts_at", "ends_at", "buffer_minutes",
   "during", "hold_expires_at", "goal", "price_amount", "currency", "payment_mode",
   "accept_deadline_at", "created_at", "updated_at", "reschedule_count", "version")
  values (?, ?, ?, ?, ?, ?, ?, ?, tstzrange(?, ?, '[)'), ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)`;

/**
 * Q2: statuses of a trial that was `scheduled` and went on from there. F3 leaves a past session in
 * `scheduled` (Q4), so the end time decides whether it already took place.
 */
const TRIAL_TAKEN_PLACE: readonly BookingStatus[] = [
  'scheduled',
  'in_progress',
  'completed',
  'settled',
  'disputed',
];

/** The Postgres constraint names of §4.4 map to the domain reasons of `createHold`. */
const CONSTRAINT_OUTCOMES: Record<string, InsertOutcome['kind']> = {
  booking_mentor_no_overlap: 'slot_taken',
  booking_student_no_overlap: 'student_busy',
  booking_one_trial_per_pair: 'trial_already_used',
  // Q18 backstop: the per-student lock already serialises holds, so only a writer bypassing
  // `createHold` can hit it — the student is busy with another hold.
  booking_one_hold_per_student: 'student_busy',
};

/**
 * Statuses of the state machine as an SQL list. They come from the typed transition table, never
 * from input, so inlining them is safe (and avoids driver-specific array binding).
 */
const sqlList = (statuses: readonly BookingStatus[]): string =>
  statuses.map((status) => `'${status}'`).join(', ');

/** Walks MikroORM's error chain to the driver error, which carries `constraint`. */
const constraintOf = (error: unknown): string | undefined => {
  let current: unknown = error;
  for (let depth = 0; depth < 8 && current != null; depth += 1) {
    const candidate = current as {
      constraint?: unknown;
      cause?: unknown;
      getPreviousError?: () => unknown;
    };
    if (typeof candidate.constraint === 'string') return candidate.constraint;
    current =
      typeof candidate.getPreviousError === 'function'
        ? candidate.getPreviousError()
        : candidate.cause;
  }
  return undefined;
};

/** One row an expiry moved, with the status it had before the update (`booking_expired`). */
interface ExpiredRow {
  readonly booking: Booking;
  readonly fromStatus: BookingStatus;
}

/**
 * Adapter: `scheduling.booking` (spec §4.4). Writes go through raw SQL — `during` is a range — but
 * every status change follows the transition table of `domain/booking.state.ts`: the target and
 * the allowed source statuses are taken from it, never hard-coded here.
 */
export class MikroOrmBookingRepository implements BookingRepository {
  readonly #em: EntityManager;
  readonly #eventPublisher: EventPublisher;
  readonly #creditReservation: CreditReservation;
  readonly #paymentMode: Env['BOOKING_PAYMENT_MODE'];

  constructor({
    em,
    eventPublisher,
    creditReservation,
    env,
  }: {
    em: EntityManager;
    eventPublisher: EventPublisher;
    creditReservation: CreditReservation;
    env: Env;
  }) {
    this.#em = em;
    this.#eventPublisher = eventPublisher;
    this.#creditReservation = creditReservation;
    this.#paymentMode = env.BOOKING_PAYMENT_MODE;
  }

  async findById(id: BookingId): Promise<Booking | null> {
    return this.#read(this.#em, id);
  }

  async findActiveHold(studentId: StudentId, now: Temporal.Instant): Promise<Booking | null> {
    const row = await this.#em.findOne(
      BookingRecord,
      { studentId, status: 'hold', holdExpiresAt: { $gt: toDate(now) } },
      { disableIdentityMap: true, orderBy: { createdAt: 'desc' } },
    );
    return row === null ? null : toBooking(row);
  }

  async countHoldsSince(studentId: StudentId, since: Temporal.Instant): Promise<number> {
    const rows = await this.#em.getConnection().execute<{ count: string }[]>(
      `select count(*)::text as "count" from "scheduling"."booking"
        where "student_id" = ? and "created_at" >= ?`,
      [studentId, toDate(since)],
      'all',
    );
    return Number(rows[0]?.count ?? '0');
  }

  async hasTrialTakenPlace(
    studentId: StudentId,
    mentorId: MentorId,
    now: Temporal.Instant,
  ): Promise<boolean> {
    const rows = await this.#em.getConnection().execute<{ count: string }[]>(
      `select count(*)::text as "count" from "scheduling"."booking"
        where "student_id" = ? and "mentor_id" = ? and "type" = 'trial'
          and "status" in (${sqlList(TRIAL_TAKEN_PLACE)}) and "ends_at" <= ?`,
      [studentId, mentorId, toDate(now)],
      'all',
    );
    return Number(rows[0]?.count ?? '0') > 0;
  }

  async createHold(booking: NewBooking): Promise<InsertOutcome> {
    return this.#em.transactional(async (em) => {
      // Q18: one transaction per student at a time. Without it two parallel requests both find
      // no previous hold to release and both insert; the partial unique index
      // `booking_one_hold_per_student` stays the backstop.
      await this.#sql(em, `select pg_advisory_xact_lock(hashtextextended(?, 0))`, [
        `scheduling.hold:${booking.studentId}`,
      ]);
      // The savepoint keeps release/expire/insert atomic: a constraint violation rolls all three
      // back, so a rejected hold never costs the student their previous one.
      await this.#sql(em, 'savepoint booking_claim');
      let expired: ExpiredRow[];
      try {
        expired = await this.#makeRoom(em, booking);
        await this.#sql(em, INSERT_BOOKING, this.#insertParams(booking));
      } catch (error) {
        await this.#sql(em, 'rollback to savepoint booking_claim');
        const outcome = CONSTRAINT_OUTCOMES[constraintOf(error) ?? ''];
        if (outcome !== undefined && outcome !== 'created') return { kind: outcome };
        throw error;
      }
      await this.#sql(em, 'release savepoint booking_claim');
      await this.#publishExpired(em, expired, booking.now);
      const created = await this.#read(em, booking.id);
      if (created === null) throw new Error(`Booking ${booking.id} vanished right after insert`);
      return { kind: 'created', booking: created };
    });
  }

  /**
   * §4.4: the new hold releases the student's previous one (Q18), and stale overlapping holds
   * expire here, because the exclusion predicate cannot use now().
   */
  async #makeRoom(em: EntityManager, booking: NewBooking): Promise<ExpiredRow[]> {
    const released = await this.#expire(em, 'hold_released', booking.now, {
      where: `"student_id" = ?`,
      params: [booking.studentId],
    });
    const stale = await this.#expire(em, 'hold_expired', booking.now, {
      where: `"hold_expires_at" <= ? and "during" && tstzrange(?, ?, '[)')`,
      params: [
        toDate(booking.now),
        toDate(booking.startsAt),
        toDate(booking.endsAt.add({ minutes: booking.bufferMinutes })),
      ],
    });
    return [...released, ...stale];
  }

  #insertParams(booking: NewBooking): unknown[] {
    return [
      booking.id,
      booking.mentorId,
      booking.studentId,
      booking.type,
      booking.status,
      toDate(booking.startsAt),
      toDate(booking.endsAt),
      booking.bufferMinutes,
      toDate(booking.startsAt),
      toDate(booking.endsAt.add({ minutes: booking.bufferMinutes })),
      booking.holdExpiresAt === null ? null : toDate(booking.holdExpiresAt),
      booking.goal,
      booking.price?.amount ?? null,
      booking.price?.currency ?? null,
      this.#paymentMode,
      booking.acceptDeadlineAt === null ? null : toDate(booking.acceptDeadlineAt),
      toDate(booking.now),
      toDate(booking.now),
    ];
  }

  async releaseHold(
    studentId: StudentId,
    holdId: BookingId,
    now: Temporal.Instant,
  ): Promise<Booking | null> {
    return this.#em.transactional(async (em) => {
      const [released] = await this.#expire(em, 'hold_released', now, {
        where: `"id" = ? and "student_id" = ?`,
        params: [holdId, studentId],
      });
      await this.#publishExpired(em, released === undefined ? [] : [released], now);
      return released?.booking ?? null;
    });
  }

  async expireHoldById(id: BookingId, now: Temporal.Instant): Promise<Booking | null> {
    return this.#em.transactional(async (em) => {
      const [expired] = await this.#expire(em, 'hold_expired', now, {
        where: `"id" = ?`,
        params: [id],
      });
      await this.#publishExpired(em, expired === undefined ? [] : [expired], now);
      return expired?.booking ?? null;
    });
  }

  async expireStaleHolds(now: Temporal.Instant): Promise<Booking[]> {
    return this.#em.transactional(async (em) => {
      const expired = await this.#expire(em, 'hold_expired', now, {
        where: `"hold_expires_at" <= ?`,
        params: [toDate(now)],
      });
      // The job is the F3 trigger of `booking_expired`; F4 billing listens for the refund.
      await this.#publishExpired(em, expired, now);
      return expired.map((row) => row.booking);
    });
  }

  async completeCheckout(input: CheckoutTransition): Promise<CheckoutOutcome> {
    // The state machine decides the target; a sequence the table forbids is a programming error.
    const to = transitionAll('hold', input.events);
    if (to.isErr()) {
      throw new Error(`Checkout events ${input.events.join(' → ')} are not valid from hold`);
    }
    return this.#em.transactional(async (em) => {
      const hold = await this.#lockActiveHold(em, input);
      if (hold.kind !== 'locked') return hold;
      if (input.reserveCredit) {
        // F4: the ledger entry joins this transaction, so it commits or rolls back with the state.
        const reservation = await this.#creditReservation.reserve(hold.booking, em);
        if (reservation.kind === 'insufficient_credit') return { kind: 'insufficient_credit' };
      }
      await this.#sql(
        em,
        `update "scheduling"."booking"
          set "status" = ?, "goal" = ?, "accept_deadline_at" = ?, "hold_expires_at" = null,
              "version" = "version" + 1, "updated_at" = ?
          where "id" = ?`,
        [
          to.value,
          input.goal,
          input.acceptDeadlineAt === null ? null : toDate(input.acceptDeadlineAt),
          toDate(input.now),
          input.bookingId,
        ],
      );
      const booking = await this.#read(em, input.bookingId);
      if (booking === null) return { kind: 'not_found' };
      // State and outbox job share the transaction: a rollback publishes nothing (spec §4.6).
      await this.#eventPublisher.publish(em, [
        input.acceptDeadlineAt === null
          ? bookingConfirmedEvent(booking, 'credit', input.now)
          : bookingRequestedEvent(booking, input.acceptDeadlineAt, input.now),
      ]);
      return { kind: 'confirmed', booking };
    });
  }

  /**
   * Locks the student's still-active hold (`for update`) for checkout. A hold that passed its
   * deadline meanwhile is expired here (with its event) and reported as such.
   */
  async #lockActiveHold(
    em: EntityManager,
    input: CheckoutTransition,
  ): Promise<
    { readonly kind: 'locked'; readonly booking: Booking } | { readonly kind: 'expired' | 'not_found' }
  > {
    const locked = await this.#sql<{ id: string }>(
      em,
      `select "id" from "scheduling"."booking"
        where "id" = ? and "student_id" = ? and "status" = 'hold' and "hold_expires_at" > ?
        for update`,
      [input.bookingId, input.studentId, toDate(input.now)],
    );
    const existing = await this.#read(em, input.bookingId);
    if (existing === null) return { kind: 'not_found' };
    if (existing.studentId !== input.studentId) return { kind: 'not_found' };
    if (locked.length > 0) return { kind: 'locked', booking: existing };
    if (existing.status === 'hold') {
      const expired = await this.#expire(em, 'hold_expired', input.now, {
        where: `"id" = ?`,
        params: [input.bookingId],
      });
      await this.#publishExpired(em, expired, input.now);
    }
    return { kind: 'expired' };
  }

  /** Raw SQL inside the transaction of `em` (savepoints and `for update` need the same connection). */
  async #sql<T = unknown>(em: EntityManager, sql: string, params: readonly unknown[] = []) {
    return em
      .getConnection()
      .execute<T[]>(sql, [...params], 'all', em.getTransactionContext());
  }

  /**
   * Applies `event` (`hold_released` / `hold_expired`) to every row matching `where` whose status
   * allows it in the transition table, returning each row with its status from before the update.
   */
  async #expire(
    em: EntityManager,
    event: Extract<BookingEvent, 'hold_released' | 'hold_expired'>,
    now: Temporal.Instant,
    filter: { where: string; params: readonly unknown[] },
  ): Promise<ExpiredRow[]> {
    const { from, to } = sourcesOf(event);
    const rows = await this.#sql<{ id: string; fromStatus: BookingStatus }>(
      em,
      `with "target" as (
         select "id", "status" from "scheduling"."booking"
          where "status" in (${sqlList(from)}) and ${filter.where}
          for update
       ), "updated" as (
         update "scheduling"."booking" as "b"
            set "status" = ?, "version" = "b"."version" + 1, "updated_at" = ?
           from "target" where "b"."id" = "target"."id"
         returning "b"."id", "target"."status" as "from_status"
       )
       select "id", "from_status" as "fromStatus" from "updated"`,
      [...filter.params, to, toDate(now)],
    );
    const bookings = await this.#readMany(
      em,
      rows.map((row) => row.id),
    );
    const fromById = new Map(rows.map((row) => [row.id, row.fromStatus]));
    return bookings.map((booking) => ({
      booking,
      fromStatus: fromById.get(booking.id) ?? 'hold',
    }));
  }

  /** `booking_expired` for every expired row, in the transaction of the change (spec §4.6). */
  async #publishExpired(
    em: EntityManager,
    expired: readonly ExpiredRow[],
    now: Temporal.Instant,
  ): Promise<void> {
    if (expired.length === 0) return;
    await this.#eventPublisher.publish(
      em,
      expired.map(({ booking, fromStatus }) => bookingExpiredEvent(booking, fromStatus, now)),
    );
  }

  async #readMany(em: EntityManager, ids: readonly string[]): Promise<Booking[]> {
    if (ids.length === 0) return [];
    const found = await em.find(BookingRecord, { id: { $in: ids } }, { disableIdentityMap: true });
    return found.map(toBooking);
  }

  async #read(em: EntityManager, id: BookingId): Promise<Booking | null> {
    const row = await em.findOne(BookingRecord, { id }, { disableIdentityMap: true });
    return row === null ? null : toBooking(row);
  }
}
