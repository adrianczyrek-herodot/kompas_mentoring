import { FakeClock } from '@kompas/testing';
import { Temporal } from 'temporal-polyfill';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequestScope } from '../../../container.ts';
import { BookingId, MentorId, newId, StudentId, UserId } from '../../../shared/domain/index.ts';
import { dockerAvailable, integrationSuite } from '../../../shared/infrastructure/db/test-database.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { GetMentorAvailabilityInput } from '../application/get-mentor-availability.query.ts';
import {
  bookableMentor,
  readAvailability,
  startsAtOf,
  studentUser,
} from './availability.int-support.ts';
import {
  BOOKING_NOW,
  type BookingEnv,
  mondayMentor,
  pastTrial,
  SLOT_0900,
  SLOT_0930,
  SLOT_1000,
  startBookingEnv,
  TRIAL_NOW,
} from './booking.int-support.ts';

const GOAL = 'Chcę przygotować się do rozmowy rekrutacyjnej na stanowisko senior.';

describe.skipIf(!dockerAvailable)(
  integrationSuite('scheduling: holds and the booking table (spec §4.4)'),
  () => {
    let env: BookingEnv;
    const clock = new FakeClock(BOOKING_NOW);
    let counter = 0;

    const scope = () => {
      counter += 1;
      return createRequestScope(env.container, { requestId: `int-booking-${counter}` });
    };

    const input = (mentorProfileId: string): GetMentorAvailabilityInput => ({
      mentorProfileId,
      range: { from: BOOKING_NOW, to: BOOKING_NOW.add({ hours: 24 * 7 }) },
      durationMinutes: 60,
      kind: 'plan',
    });

    const hold = (
      actor: CurrentUser,
      mentorProfileId: string,
      startsAt: Temporal.Instant,
      options: { type?: 'trial' | 'plan'; goal?: string | null; durationMinutes?: 30 | 60 } = {},
    ) =>
      scope().cradle.createHold(actor, {
        mentorProfileId,
        startsAt,
        durationMinutes: options.durationMinutes ?? 60,
        type: options.type ?? 'plan',
        goal: options.goal ?? null,
      });

    const readyMentor = () => mondayMentor(env.container);

    /** A student who already had a trial with the mentor, so later sessions are allowed (Q2). */
    const returningStudent = async (mentor: CurrentUser) => {
      const student = await studentUser(env.container);
      await pastTrial(env.container, { mentorId: mentor.id, studentId: student.id });
      return student;
    };

    const row = <T>(sql: string, params: unknown[] = []) =>
      env.container.cradle.orm.em.getConnection().execute<T[]>(sql, params);

    beforeAll(async () => {
      env = await startBookingEnv(clock);
    });

    beforeEach(() => {
      clock.set(BOOKING_NOW);
    });

    afterAll(async () => {
      await env.close();
    });

    it('a hold blocks the mentor slot and frees the slots that do not overlap it', async () => {
      const { mentor, profileId } = await readyMentor();
      const student = await returningStudent(mentor);
      expect(startsAtOf(await readAvailability(env.container, input(profileId)))).toContain(
        SLOT_0900.toString(),
      );

      const created = (await hold(student, profileId, SLOT_0900))._unsafeUnwrap();
      expect(created.status).toBe('hold');
      // No mentor rate yet: a later session has no price snapshot (Q3).
      expect(created.price).toBeNull();

      const after = startsAtOf(await readAvailability(env.container, input(profileId)));
      expect(after).not.toContain(SLOT_0900.toString());
      expect(after).toContain(SLOT_1000.toString());
    });

    it('lets exactly one of N concurrent holds on the same slot win (23P01 → slot_taken)', async () => {
      const { mentor, profileId } = await readyMentor();
      const students = await Promise.all(
        Array.from({ length: 5 }, () => returningStudent(mentor)),
      );
      const results = await Promise.all(students.map((s) => hold(s, profileId, SLOT_0900)));
      expect(results.filter((r) => r.isOk())).toHaveLength(1);
      expect(
        results.filter((r) => r.isErr()).map((r) => r._unsafeUnwrapErr().code),
      ).toEqual(Array.from({ length: 4 }, () => 'scheduling.slot_taken'));
      const holds = await row<{ count: string }>(
        `select count(*)::text as "count" from "scheduling"."booking"
          where "status" = 'hold' and "mentor_id" = ?`,
        [mentor.id],
      );
      expect(holds[0]?.count).toBe('1');
    });

    it('keeps one active hold per student under N concurrent holds on different slots (Q18)', async () => {
      const { mentor, profileId } = await readyMentor();
      const student = await returningStudent(mentor);
      const starts = [0, 30, 60, 90, 120].map((minutes) => SLOT_0900.add({ minutes }));
      const results = await Promise.all(
        starts.map((startsAt) => hold(student, profileId, startsAt, { durationMinutes: 30 })),
      );
      // Serialised per student: every request wins in turn and releases the one before it.
      expect(results.every((r) => r.isOk())).toBe(true);
      const active = await scope().cradle.bookingRepository.findActiveHold(
        StudentId.parse(student.id),
        BOOKING_NOW,
      );
      expect(active).not.toBeNull();
      const holds = await row<{ id: string }>(
        `select "id" from "scheduling"."booking" where "status" = 'hold' and "student_id" = ?`,
        [student.id],
      );
      expect(holds.map((h) => h.id)).toEqual([active?.id]);
    });

    it('rejects a second hold row for the student at the database (booking_one_hold_per_student)', async () => {
      const { mentor, profileId } = await readyMentor();
      const student = await returningStudent(mentor);
      const first = (await hold(student, profileId, SLOT_0900))._unsafeUnwrap();
      expect((await hold(student, profileId, SLOT_1000.add({ minutes: 60 }))).isOk()).toBe(true);
      await expect(
        row(`update "scheduling"."booking" set "status" = 'hold' where "id" = ?`, [first.id]),
      ).rejects.toThrow(/booking_one_hold_per_student/);
    });

    it.each([
      ['before the notice of a trial (Q9: 6 h)', SLOT_0900, 'trial' as const],
      ['outside the template', Temporal.Instant.from('2027-01-04T13:00:00Z'), 'plan' as const],
      ['off the 30-min grid', SLOT_0900.add({ minutes: 15 }), 'plan' as const],
      ['in the past', SLOT_0900.subtract({ hours: 7 * 24 }), 'plan' as const],
      ['beyond the 8-week horizon (Q10)', SLOT_0900.add({ hours: 9 * 7 * 24 }), 'plan' as const],
    ])('refuses a start %s with slot_unavailable', async (_case, startsAt, type) => {
      const { mentor, profileId } = await readyMentor();
      const student =
        type === 'plan' ? await returningStudent(mentor) : await studentUser(env.container);
      const result = await hold(student, profileId, startsAt, {
        type,
        durationMinutes: type === 'trial' ? 30 : 60,
      });
      expect(result._unsafeUnwrapErr()).toEqual({ code: 'scheduling.slot_unavailable' });
    });

    it('allows a later session only after the pair’s trial was scheduled and took place (Q2)', async () => {
      const { mentor, profileId } = await readyMentor();
      const newcomer = await studentUser(env.container);
      expect((await hold(newcomer, profileId, SLOT_0900))._unsafeUnwrapErr()).toEqual({
        code: 'scheduling.trial_required',
      });

      // A trial that is scheduled but still ahead does not count yet.
      const waiting = await studentUser(env.container);
      await scope().cradle.bookingRepository.createHold({
        id: newId(BookingId),
        mentorId: MentorId.parse(mentor.id),
        studentId: StudentId.parse(waiting.id),
        type: 'trial',
        status: 'scheduled',
        startsAt: SLOT_1000.add({ hours: 7 * 24 }),
        endsAt: SLOT_1000.add({ hours: 7 * 24, minutes: 30 }),
        bufferMinutes: 0,
        holdExpiresAt: null,
        goal: GOAL,
        price: null,
        acceptDeadlineAt: null,
        now: BOOKING_NOW,
      });
      expect((await hold(waiting, profileId, SLOT_0900))._unsafeUnwrapErr().code).toBe(
        'scheduling.trial_required',
      );

      const returning = await returningStudent(mentor);
      expect((await hold(returning, profileId, SLOT_0900)).isOk()).toBe(true);
    });

    it('refuses a hold that overlaps the student’s scheduled session (student_busy)', async () => {
      const { mentor: ready, profileId } = await readyMentor();
      // The existing session is with ANOTHER mentor, so only the student constraint can fire.
      const { mentor } = await bookableMentor(env.container);
      const student = await returningStudent(ready);
      await scope().cradle.bookingRepository.createHold({
        id: newId(BookingId),
        mentorId: MentorId.parse(mentor.id),
        studentId: StudentId.parse(student.id),
        type: 'plan',
        status: 'scheduled',
        startsAt: SLOT_0930,
        endsAt: SLOT_0930.add({ hours: 1 }),
        bufferMinutes: 0,
        holdExpiresAt: null,
        goal: null,
        price: null,
        acceptDeadlineAt: null,
        now: BOOKING_NOW,
      });
      const result = await hold(student, profileId, SLOT_0900);
      expect(result._unsafeUnwrapErr()).toEqual({ code: 'scheduling.student_busy' });
    });

    it('refuses a second trial and allows it again once the first is cancelled (23505)', async () => {
      clock.set(TRIAL_NOW);
      const { mentor, profileId } = await readyMentor();
      const student = await studentUser(env.container);
      const trialId = newId(BookingId);
      await scope().cradle.bookingRepository.createHold({
        id: trialId,
        mentorId: MentorId.parse(mentor.id),
        studentId: StudentId.parse(student.id),
        type: 'trial',
        status: 'requested',
        startsAt: SLOT_0900,
        endsAt: SLOT_0900.add({ minutes: 30 }),
        bufferMinutes: 0,
        holdExpiresAt: null,
        goal: GOAL,
        price: null,
        acceptDeadlineAt: null,
        now: TRIAL_NOW,
      });
      const used = await hold(student, profileId, SLOT_1000, { type: 'trial', goal: GOAL });
      expect(used._unsafeUnwrapErr()).toEqual({ code: 'scheduling.trial_already_used' });

      // The mentor declines (M2, E3-S7 — not written yet), so the fixture moves the row itself.
      await row(`update "scheduling"."booking" set "status" = 'cancelled' where "id" = ?`, [
        trialId,
      ]);
      expect((await hold(student, profileId, SLOT_1000, { type: 'trial', goal: GOAL })).isOk()).toBe(
        true,
      );
    });

    it('expires a stale overlapping hold before inserting and does not block the slot', async () => {
      const { mentor, profileId } = await readyMentor();
      const first = await returningStudent(mentor);
      const stale = (await hold(first, profileId, SLOT_0900))._unsafeUnwrap();
      clock.advance({ minutes: 11 });

      const second = await returningStudent(mentor);
      expect((await hold(second, profileId, SLOT_0900)).isOk()).toBe(true);
      expect(
        (await scope().cradle.bookingRepository.findById(stale.id))?.status,
      ).toBe('expired');
    });

    it('releases the student’s own hold and leaves another student’s hold untouched', async () => {
      const { mentor, profileId } = await readyMentor();
      const student = await returningStudent(mentor);
      const created = (await hold(student, profileId, SLOT_0900))._unsafeUnwrap();

      const released = (await scope().cradle.releaseHold(student, created.id))._unsafeUnwrap();
      expect(released.status).toBe('expired');
      expect(startsAtOf(await readAvailability(env.container, input(profileId)))).toContain(
        SLOT_0900.toString(),
      );

      const other = await studentUser(env.container);
      expect(
        (await scope().cradle.releaseHold(other, created.id))._unsafeUnwrapErr().code,
      ).toBe('scheduling.not_found');
    });

    it('frees the previous hold when the student takes a new one (Q18)', async () => {
      const { mentor, profileId } = await readyMentor();
      const student = await returningStudent(mentor);
      const first = (await hold(student, profileId, SLOT_0900))._unsafeUnwrap();
      expect((await hold(student, profileId, SLOT_1000)).isOk()).toBe(true);
      expect((await scope().cradle.bookingRepository.findById(first.id))?.status).toBe('expired');
      const active = await row<{ count: string }>(
        `select count(*)::text as "count" from "scheduling"."booking" where "status" = 'hold' and "student_id" = ?`,
        [student.id],
      );
      expect(active[0]?.count).toBe('1');
    });

    it('blocks a trial when the mentor pauses new students but allows a later session', async () => {
      const { mentor, profileId } = await readyMentor();
      await scope().cradle.mentorBookabilityRepository.upsert({
        mentorId: MentorId.parse(mentor.id),
        mentorProfileId: profileId,
        bookable: true,
        acceptingNew: false,
        rate60: null,
        updatedAt: BOOKING_NOW,
      });
      const student = await returningStudent(mentor);
      expect(
        (await hold(student, profileId, SLOT_0900, { type: 'trial', goal: GOAL }))._unsafeUnwrapErr()
          .code,
      ).toBe('scheduling.not_accepting_new');
      expect((await hold(student, profileId, SLOT_1000)).isOk()).toBe(true);
    });

    it('refuses a booking from an unverified student (requirement 14)', async () => {
      const { profileId } = await readyMentor();
      const unverified: CurrentUser = {
        id: newId(UserId),
        name: 'Ola',
        email: 'unverified@example.com',
        emailVerified: false,
        twoFactorEnabled: false,
        roles: ['student'],
        timeZone: null,
      };
      expect((await hold(unverified, profileId, SLOT_0900))._unsafeUnwrapErr()).toEqual({
        code: 'scheduling.email_not_verified',
      });
    });
  },
);
