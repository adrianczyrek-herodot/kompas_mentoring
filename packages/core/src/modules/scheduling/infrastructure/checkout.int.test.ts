import { FakeClock } from '@kompas/testing';
import { PgBoss } from 'pg-boss';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequestScope } from '../../../container.ts';
import { asValue } from 'awilix';
import { BookingId, MentorId, newId, StudentId } from '../../../shared/domain/index.ts';
import type { OutboxEvent } from '../../../shared/infrastructure/events/outbox.ts';
import { queueFor } from '../../../shared/infrastructure/events/subscriptions.ts';
import { dockerAvailable, integrationSuite } from '../../../shared/infrastructure/db/test-database.ts';
import { studentUser } from './availability.int-support.ts';
import {
  BOOKING_NOW,
  type BookingEnv,
  mondayMentor,
  pastTrial,
  SLOT_0900,
  SLOT_1000,
  startBookingEnv,
  TRIAL_NOW,
} from './booking.int-support.ts';

const GOAL = 'Chcę przygotować się do rozmowy rekrutacyjnej na stanowisko senior.';
const EVENTS = [
  'scheduling.booking_requested.v1',
  'scheduling.booking_confirmed.v1',
  'scheduling.booking_expired.v1',
] as const;

describe.skipIf(!dockerAvailable)(
  integrationSuite('scheduling: checkout and its events (spec §4.4, §4.6)'),
  () => {
    let env: BookingEnv;
    let worker: PgBoss;
    const clock = new FakeClock(BOOKING_NOW);
    let counter = 0;

    const scope = () => {
      counter += 1;
      return createRequestScope(env.container, { requestId: `int-checkout-${counter}` });
    };

    const queueOf = (event: string) => queueFor({ consumer: 'notifications', event });
    const jobs = async (event: string) => worker.findJobs<OutboxEvent>(queueOf(event));
    // Each test starts from a clean slate: earlier tests share the queues, so only the jobs that
    // arrive after the baseline count (spec §4.6 tests are about the delta).
    let baseline: Record<string, number> = {};
    const newJobs = async (event: string) =>
      (await jobs(event)).slice(baseline[event] ?? 0);

    const hold = async (
      actor: Awaited<ReturnType<typeof studentUser>>,
      mentorProfileId: string,
      options: { type?: 'trial' | 'plan'; durationMinutes?: 30 | 60 } = {},
    ) =>
      scope().cradle.createHold(actor, {
        mentorProfileId,
        startsAt: SLOT_0900,
        durationMinutes: options.durationMinutes ?? 60,
        type: options.type ?? 'plan',
        goal: null,
      });

    beforeAll(async () => {
      env = await startBookingEnv(clock);
      worker = new PgBoss({
        connectionString: env.database.getConnectionUri(),
        migrate: true,
        supervise: false,
        schedule: false,
      });
      await worker.start();
      // The outbox delivers to a subscribed queue; without notifications (F3), the test subscribes.
      for (const event of EVENTS) {
        await worker.createQueue(queueOf(event));
        await worker.subscribe(event, queueOf(event));
      }
    });

    beforeEach(async () => {
      // A day ahead of the Monday slots: a trial clears its 6 h notice (Q9).
      clock.set(TRIAL_NOW);
      baseline = {};
      for (const event of EVENTS) baseline[event] = (await jobs(event)).length;
    });

    afterAll(async () => {
      await worker.stop({ graceful: false });
      await env.close();
    });

    it('confirms a trial in one transaction and publishes booking_requested', async () => {
      const { profileId } = await mondayMentor(env.container);
      const student = await studentUser(env.container);
      const created = (await hold(student, profileId, { type: 'trial' }))._unsafeUnwrap();

      const result = (await scope().cradle.checkout(student, { holdId: created.id, goal: GOAL }))._unsafeUnwrap();
      expect(result.kind).toBe('confirmed');
      if (result.kind !== 'confirmed') throw new Error('unreachable');
      expect(result.booking.status).toBe('requested');
      expect(result.booking.goal).toBe(GOAL);
      expect(result.booking.acceptDeadlineAt).not.toBeNull();

      const requested = await newJobs('scheduling.booking_requested.v1');
      expect(requested).toHaveLength(1);
      expect(requested[0]?.data.payload).toMatchObject({
        bookingId: created.id,
        startsAt: SLOT_0900.toString(),
      });
      expect(await newJobs('scheduling.booking_confirmed.v1')).toHaveLength(0);
    });

    it('schedules a later session with the credit path and publishes booking_confirmed', async () => {
      const { mentor, profileId } = await mondayMentor(env.container);
      await scope().cradle.mentorBookabilityRepository.upsert({
        mentorId: MentorId.parse(mentor.id),
        mentorProfileId: profileId,
        bookable: true,
        acceptingNew: true,
        rate60: { amount: 12_000n, currency: 'PLN' },
        updatedAt: BOOKING_NOW,
      });
      const student = await studentUser(env.container);
      await pastTrial(env.container, { mentorId: mentor.id, studentId: student.id });
      const created = (await hold(student, profileId))._unsafeUnwrap();

      const result = (await scope().cradle.checkout(student, { holdId: created.id, goal: null }))._unsafeUnwrap();
      if (result.kind !== 'confirmed') throw new Error('unreachable');
      expect(result.booking.status).toBe('scheduled');
      expect(result.booking.price?.amount).toBe(12_000n);
      // A confirmed booking is no longer a hold: its deadline is cleared.
      expect(result.booking.holdExpiresAt).toBeNull();

      const confirmed = await newJobs('scheduling.booking_confirmed.v1');
      expect(confirmed).toHaveLength(1);
      expect(confirmed[0]?.data.payload).toMatchObject({
        bookingId: created.id,
        confirmedBy: 'credit',
        price: { amountMinorUnits: 12_000, currency: 'PLN' },
      });
    });

    it('rejects an expired hold, expires it and publishes only booking_expired', async () => {
      const { profileId } = await mondayMentor(env.container);
      const student = await studentUser(env.container);
      const created = (await hold(student, profileId, { type: 'trial' }))._unsafeUnwrap();
      clock.advance({ minutes: 11 });

      const result = await scope().cradle.checkout(student, { holdId: created.id, goal: GOAL });
      expect(result._unsafeUnwrapErr()).toEqual({ code: 'scheduling.hold_expired' });
      expect((await scope().cradle.bookingRepository.findById(created.id))?.status).toBe('expired');
      expect(await newJobs('scheduling.booking_requested.v1')).toHaveLength(0);
      const expired = await newJobs('scheduling.booking_expired.v1');
      expect(expired).toHaveLength(1);
      // The status before the change, not the `expired` it became (F4 refunds by it).
      expect(expired[0]?.data.payload).toEqual({ bookingId: created.id, fromStatus: 'hold' });
    });

    it('publishes booking_expired for the hold a new hold releases (Q18)', async () => {
      const { profileId } = await mondayMentor(env.container);
      const student = await studentUser(env.container);
      const first = (await hold(student, profileId, { type: 'trial' }))._unsafeUnwrap();
      expect(
        (
          await scope().cradle.createHold(student, {
            mentorProfileId: profileId,
            startsAt: SLOT_1000,
            durationMinutes: 30,
            type: 'trial',
            goal: null,
          })
        ).isOk(),
      ).toBe(true);
      expect(
        (await newJobs('scheduling.booking_expired.v1')).map((job) => job.data.payload),
      ).toEqual([{ bookingId: first.id, fromStatus: 'hold' }]);
    });

    it('expires a stale pending_payment with fromStatus pending_payment (job)', async () => {
      const { mentor } = await mondayMentor(env.container);
      const student = await studentUser(env.container);
      const id = newId(BookingId);
      await scope().cradle.bookingRepository.createHold({
        id,
        mentorId: MentorId.parse(mentor.id),
        studentId: StudentId.parse(student.id),
        type: 'trial',
        status: 'pending_payment',
        startsAt: SLOT_0900,
        endsAt: SLOT_0900.add({ minutes: 30 }),
        bufferMinutes: 0,
        holdExpiresAt: TRIAL_NOW.add({ minutes: 10 }),
        goal: GOAL,
        price: null,
        acceptDeadlineAt: null,
        now: TRIAL_NOW,
      });
      clock.advance({ minutes: 11 });
      await scope().cradle.expireHolds();
      expect((await scope().cradle.bookingRepository.findById(id))?.status).toBe('expired');
      // The job also sweeps holds earlier tests left behind; only this booking matters here.
      expect(
        (await newJobs('scheduling.booking_expired.v1'))
          .map((job) => job.data.payload)
          .filter((payload) => (payload as { bookingId: string }).bookingId === id),
      ).toEqual([{ bookingId: id, fromStatus: 'pending_payment' }]);
    });

    it('reserves the credit inside the checkout transaction and rolls back on insufficient credit', async () => {
      const { mentor, profileId } = await mondayMentor(env.container);
      const student = await studentUser(env.container);
      await pastTrial(env.container, { mentorId: mentor.id, studentId: student.id });
      const created = (await hold(student, profileId))._unsafeUnwrap();

      const calls: { bookingId: string; inTransaction: boolean }[] = [];
      const checkoutScope = scope();
      checkoutScope.register({
        creditReservation: asValue({
          reserve: (booking: { id: string }, em: { isInTransaction(): boolean }) => {
            calls.push({ bookingId: booking.id, inTransaction: em.isInTransaction() });
            return Promise.resolve({ kind: 'insufficient_credit' as const });
          },
        }),
      });
      const result = await checkoutScope.cradle.checkout(student, { holdId: created.id, goal: null });
      expect(result._unsafeUnwrapErr()).toEqual({ code: 'scheduling.insufficient_credit' });
      expect(calls).toEqual([{ bookingId: created.id, inTransaction: true }]);
      expect((await scope().cradle.bookingRepository.findById(created.id))?.status).toBe('hold');
      expect(await newJobs('scheduling.booking_confirmed.v1')).toHaveLength(0);
    });

    it('rejects a goal outside 20–500 characters and a foreign hold without publishing', async () => {
      const { profileId } = await mondayMentor(env.container);
      const student = await studentUser(env.container);
      const created = (await hold(student, profileId, { type: 'trial' }))._unsafeUnwrap();
      expect(
        (await scope().cradle.checkout(student, { holdId: created.id, goal: 'za krótko' }))
          ._unsafeUnwrapErr().code,
      ).toBe('scheduling.invalid_goal');

      const stranger = await studentUser(env.container);
      expect(
        (await scope().cradle.checkout(stranger, { holdId: created.id, goal: GOAL }))
          ._unsafeUnwrapErr().code,
      ).toBe('scheduling.not_found');
      expect(await newJobs('scheduling.booking_requested.v1')).toHaveLength(0);
    });

    it('reads a booking for a participant and hides it from everyone else', async () => {
      const { mentor, profileId } = await mondayMentor(env.container);
      const student = await studentUser(env.container);
      const created = (await hold(student, profileId, { type: 'trial' }))._unsafeUnwrap();
      await scope().cradle.checkout(student, { holdId: created.id, goal: GOAL });

      expect((await scope().cradle.getBooking(student, created.id))._unsafeUnwrap().status).toBe(
        'requested',
      );
      expect((await scope().cradle.getBooking(mentor, created.id)).isOk()).toBe(true);
      const stranger = await studentUser(env.container);
      expect(
        (await scope().cradle.getBooking(stranger, created.id))._unsafeUnwrapErr().code,
      ).toBe('scheduling.not_found');
    });
  },
);
