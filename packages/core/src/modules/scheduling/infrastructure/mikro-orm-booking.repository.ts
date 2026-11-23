import type { EntityManager } from '@mikro-orm/postgresql';
import type { Temporal } from 'temporal-polyfill';
import type { BookingId, StudentId } from '../../../shared/domain/index.ts';
import type { BookingRepository, InsertOutcome, NewBooking } from '../application/ports.ts';
import type { Booking } from '../domain/booking.entity.ts';
import type { BookingStatus } from '../domain/booking.state.ts';
import { toBooking, toDate } from './booking.mapper.ts';
import { BookingRecord } from './scheduling.records.ts';

/** §4.4: `createHold` expires the student's previous hold before taking the new one (Q18). */
const RELEASE_PREVIOUS_HOLD = `update "scheduling"."booking"
  set "status" = 'expired', "version" = "version" + 1, "updated_at" = ?
  where "student_id" = ? and "status" = 'hold'`;

/** §4.4: the exclusion predicate cannot use `now()`, so stale overlapping holds are expired here. */
const EXPIRE_OVERLAPPING_HOLDS = `update "scheduling"."booking"
  set "status" = 'expired', "version" = "version" + 1, "updated_at" = ?
  where "status" = 'hold' and "hold_expires_at" <= ?
    and "during" && tstzrange(?, ?, '[)')`;

const INSERT_BOOKING = `insert into "scheduling"."booking"
  ("id", "mentor_id", "student_id", "type", "status", "starts_at", "ends_at", "buffer_minutes",
   "during", "hold_expires_at", "goal", "price_amount", "currency", "payment_mode",
   "accept_deadline_at", "created_at", "updated_at", "reschedule_count", "version")
  values (?, ?, ?, ?, ?, ?, ?, ?, tstzrange(?, ?, '[)'), ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)`;

/** The Postgres error codes of the §4.4 constraints: 23P01 = exclusion, 23505 = unique. */
const CONSTRAINT_OUTCOMES: Record<string, InsertOutcome['kind']> = {
  booking_mentor_no_overlap: 'slot_taken',
  booking_student_no_overlap: 'student_busy',
  booking_one_trial_per_pair: 'trial_already_used',
};

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

/** Adapter: `scheduling.booking` (spec §4.4). Writes go through raw SQL — `during` is generated. */
export class MikroOrmBookingRepository implements BookingRepository {
  readonly #em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.#em = em;
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

  async createHold(booking: NewBooking): Promise<InsertOutcome> {
    try {
      return await this.#em.transactional((em) =>
        // A savepoint keeps the release/expire work atomic with the insert: if the insert violates a
        // constraint, the whole claim rolls back and the student keeps their previous hold.
        em.transactional(async (tem) => {
          const context = tem.getTransactionContext();
          const connection = tem.getConnection();
          await connection.execute(
            RELEASE_PREVIOUS_HOLD,
            [toDate(booking.now), booking.studentId],
            'all',
            context,
          );
          await connection.execute(
            EXPIRE_OVERLAPPING_HOLDS,
            [
              toDate(booking.now),
              toDate(booking.now),
              toDate(booking.startsAt),
              toDate(booking.endsAt.add({ minutes: booking.bufferMinutes })),
            ],
            'all',
            context,
          );
          await connection.execute(
            INSERT_BOOKING,
            [
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
              booking.paymentMode,
              booking.acceptDeadlineAt === null ? null : toDate(booking.acceptDeadlineAt),
              toDate(booking.now),
              toDate(booking.now),
            ],
            'all',
            context,
          );
          const created = await this.#read(tem, booking.id);
          if (created === null) throw new Error(`Booking ${booking.id} vanished right after insert`);
          return { kind: 'created', booking: created } satisfies InsertOutcome;
        }),
      );
    } catch (error) {
      const outcome = CONSTRAINT_OUTCOMES[constraintOf(error) ?? ''];
      if (outcome !== undefined && outcome !== 'created') return { kind: outcome };
      throw error;
    }
  }

  async releaseHold(
    studentId: StudentId,
    holdId: BookingId,
    now: Temporal.Instant,
  ): Promise<Booking | null> {
    return this.#expireHold(holdId, now, { studentId });
  }

  async expireHoldById(id: BookingId, now: Temporal.Instant): Promise<Booking | null> {
    return this.#expireHold(id, now, {});
  }

  async expireStaleHolds(now: Temporal.Instant): Promise<Booking[]> {
    return this.#em.transactional(async (em) => {
      const rows = await em.getConnection().execute<{ id: string }[]>(
        `update "scheduling"."booking"
          set "status" = 'expired', "version" = "version" + 1, "updated_at" = ?
          where "status" = 'hold' and "hold_expires_at" <= ?
          returning "id"`,
        [toDate(now), toDate(now)],
        'all',
        em.getTransactionContext(),
      );
      const ids = rows.map((row) => row.id);
      if (ids.length === 0) return [];
      const found = await em.find(
        BookingRecord,
        { id: { $in: ids } },
        { disableIdentityMap: true },
      );
      return found.map(toBooking);
    });
  }

  async transition(input: {
    id: BookingId;
    expected: readonly BookingStatus[];
    to: BookingStatus;
    acceptDeadlineAt?: Temporal.Instant;
    now: Temporal.Instant;
  }): Promise<Booking | null> {
    return this.#em.transactional(async (em) => {
      const row = await this.#read(em, input.id);
      if (row === null || !input.expected.includes(row.status)) return null;
      await em.nativeUpdate(
        BookingRecord,
        { id: input.id, status: row.status },
        {
          status: input.to,
          version: row.version + 1,
          updatedAt: toDate(input.now),
          ...(input.acceptDeadlineAt === undefined
            ? {}
            : { acceptDeadlineAt: toDate(input.acceptDeadlineAt) }),
        },
      );
      return this.#read(em, input.id);
    });
  }

  async #expireHold(
    id: BookingId,
    now: Temporal.Instant,
    scope: { studentId?: StudentId },
  ): Promise<Booking | null> {
    return this.#em.transactional(async (em) => {
      const row = await em.findOne(
        BookingRecord,
        { id, status: 'hold', ...scope },
        { disableIdentityMap: true },
      );
      if (row === null) return null;
      await em.nativeUpdate(
        BookingRecord,
        { id, status: 'hold' },
        { status: 'expired', version: row.version + 1, updatedAt: toDate(now) },
      );
      return this.#read(em, id);
    });
  }

  async #read(em: EntityManager, id: BookingId): Promise<Booking | null> {
    const row = await em.findOne(BookingRecord, { id }, { disableIdentityMap: true });
    return row === null ? null : toBooking(row);
  }
}
