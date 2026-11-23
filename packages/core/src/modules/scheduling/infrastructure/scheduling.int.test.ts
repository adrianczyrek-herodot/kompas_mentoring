import { FakeClock } from '@kompas/testing';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Temporal } from 'temporal-polyfill';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type AppContainer, createAppContainer, createRequestScope } from '../../../container.ts';
import { MentorId, UserId } from '../../../shared/domain/index.ts';
import { migrateUp } from '../../../shared/infrastructure/db/orm.ts';
import {
  dockerAvailable,
  integrationSuite,
  POSTGRES_IMAGE,
} from '../../../shared/infrastructure/db/test-database.ts';
import { parseEnv } from '../../../shared/infrastructure/env.ts';
import { createLogger } from '../../../shared/infrastructure/logger.ts';
import type { CurrentUser, Role } from '../../identity/index.ts';

const PASSWORD = 'correct-horse-battery';
const time = (value: string) => Temporal.PlainTime.from(value);
const NOW = Temporal.Instant.from('2026-11-23T10:00:00Z');

describe.skipIf(!dockerAvailable)(
  integrationSuite('scheduling: mentor availability on PostgreSQL'),
  () => {
    let database: StartedPostgreSqlContainer;
    let container: AppContainer;
    let counter = 0;

    const scope = () => {
      counter += 1;
      return createRequestScope(container, { requestId: `int-scheduling-${counter}` });
    };

    const userWith = async (role: Role): Promise<CurrentUser> => {
      const email = `scheduling-${crypto.randomUUID()}@example.com`;
      const body = {
        name: 'Marta',
        email,
        password: PASSWORD,
        terms: true,
        privacy: true,
        as: role,
      };
      const { user } = await container.cradle.auth.api.signUpEmail({ body });
      return {
        id: UserId.parse(user.id),
        name: user.name,
        email,
        emailVerified: true,
        twoFactorEnabled: false,
        timeZone: null,
        roles: [role],
      };
    };

    const template = [
      { weekday: 1 as const, startLocal: time('09:00'), endLocal: time('12:00') },
      { weekday: 1 as const, startLocal: time('13:00'), endLocal: time('15:30') },
      { weekday: 3 as const, startLocal: time('18:00'), endLocal: time('20:00') },
    ];

    const rows = <T>(sql: string, params: unknown[] = []) =>
      container.cradle.orm.em.getConnection().execute<T[]>(sql, params);

    beforeAll(async () => {
      database = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
      container = createAppContainer({
        env: parseEnv({ DATABASE_URL: database.getConnectionUri() }),
        logger: createLogger({ level: 'silent' }),
        clock: new FakeClock(NOW),
      });
      await migrateUp(container.cradle.orm);
    });

    afterAll(async () => {
      await container.cradle.orm.close();
      await database.stop();
    });

    it('reads an empty calendar as defaults with version 0 (Q9/Q12)', async () => {
      const mentor = await userWith('mentor');
      const calendar = (await scope().cradle.getMentorCalendar(mentor))._unsafeUnwrap();
      expect(calendar.rules).toEqual([]);
      expect(calendar.exceptions).toEqual([]);
      expect(calendar.schedule).toMatchObject({
        timeZone: 'Europe/Warsaw',
        minNoticeMinutes: 360,
        bufferMinutes: 0,
        version: 0,
      });
    });

    it('saves the whole weekly template and bumps the version', async () => {
      const mentor = await userWith('mentor');
      const saved = (
        await scope().cradle.saveAvailabilityTemplate(mentor, {
          rules: template,
          expectedVersion: 0,
          acknowledgeConflicts: false,
        })
      )._unsafeUnwrap();
      expect(saved.schedule.version).toBe(1);
      expect(saved.rules).toEqual(template);
      const reread = (await scope().cradle.getMentorCalendar(mentor))._unsafeUnwrap();
      expect(reread.rules).toEqual(template);
      expect(reread.schedule.version).toBe(1);
    });

    it('answers a stale version with a conflict and keeps the first template (409)', async () => {
      const mentor = await userWith('mentor');
      await scope().cradle.saveAvailabilityTemplate(mentor, {
        rules: template,
        expectedVersion: 0,
        acknowledgeConflicts: false,
      });
      const stale = await scope().cradle.saveAvailabilityTemplate(mentor, {
        rules: [{ weekday: 2, startLocal: time('10:00'), endLocal: time('11:00') }],
        expectedVersion: 0,
        acknowledgeConflicts: false,
      });
      expect(stale._unsafeUnwrapErr()).toEqual({
        code: 'scheduling.version_conflict',
        expected: 0,
        actual: 1,
      });
      const stored = (await scope().cradle.getMentorCalendar(mentor))._unsafeUnwrap();
      expect(stored.rules).toEqual(template);
    });

    it('rejects a template with overlapping intervals (422)', async () => {
      const mentor = await userWith('mentor');
      const result = await scope().cradle.saveAvailabilityTemplate(mentor, {
        rules: [
          { weekday: 1, startLocal: time('09:00'), endLocal: time('12:00') },
          { weekday: 1, startLocal: time('11:30'), endLocal: time('13:00') },
        ],
        expectedVersion: 0,
        acknowledgeConflicts: false,
      });
      expect(result._unsafeUnwrapErr()).toEqual({
        code: 'scheduling.invalid_availability',
        issues: [{ field: 'rules.1', problem: 'overlap' }],
      });
    });

    it('exposes the weekly template in minutes for catalog (requirement 2)', async () => {
      const mentor = await userWith('mentor');
      await scope().cradle.saveAvailabilityTemplate(mentor, {
        rules: template,
        expectedVersion: 0,
        acknowledgeConflicts: false,
      });
      // 180 + 150 + 120 minutes.
      expect(await scope().cradle.getWeeklyAvailabilityMinutes(MentorId.parse(mentor.id))).toBe(
        450,
      );
    });

    it('updates settings and keeps one version per mentor', async () => {
      const mentor = await userWith('mentor');
      const updated = (
        await scope().cradle.updateMentorSettings(mentor, {
          timeZone: 'Europe/London',
          minNoticeMinutes: 120,
          bufferMinutes: 30,
          expectedVersion: 0,
        })
      )._unsafeUnwrap();
      expect(updated).toMatchObject({
        timeZone: 'Europe/London',
        minNoticeMinutes: 120,
        bufferMinutes: 30,
        version: 1,
      });
      const stale = await scope().cradle.updateMentorSettings(mentor, {
        timeZone: 'Europe/Warsaw',
        minNoticeMinutes: 360,
        bufferMinutes: 0,
        expectedVersion: 0,
      });
      expect(stale._unsafeUnwrapErr()).toEqual({
        code: 'scheduling.version_conflict',
        expected: 0,
        actual: 1,
      });
    });

    it('adds and removes exceptions, rejecting overlaps of the same kind (Q10)', async () => {
      const mentor = await userWith('mentor');
      const holiday = {
        startsAt: NOW.add({ hours: 48 }),
        endsAt: NOW.add({ hours: 72 }),
        kind: 'off' as const,
        note: 'Urlop',
      };
      const added = (
        await scope().cradle.addAvailabilityException(mentor, holiday)
      )._unsafeUnwrap();
      expect(added.kind).toBe('off');

      const overlap = await scope().cradle.addAvailabilityException(mentor, {
        startsAt: NOW.add({ hours: 60 }),
        endsAt: NOW.add({ hours: 66 }),
        kind: 'off',
        note: null,
      });
      expect(overlap.isErr()).toBe(true);

      // `extra` may overlap `off` (extra hours carved out of a day off).
      (
        await scope().cradle.addAvailabilityException(mentor, {
          startsAt: NOW.add({ hours: 60 }),
          endsAt: NOW.add({ hours: 62 }),
          kind: 'extra',
          note: null,
        })
      )._unsafeUnwrap();

      const removed = (
        await scope().cradle.deleteAvailabilityException(mentor, added.id)
      )._unsafeUnwrap();
      expect(removed.id).toBe(added.id);
      expect(
        (await scope().cradle.deleteAvailabilityException(mentor, added.id))._unsafeUnwrapErr(),
      ).toEqual({ code: 'scheduling.not_found' });
    });

    it('keeps every mentor on their own schedule and exceptions (404, A01)', async () => {
      const owner = await userWith('mentor');
      const other = await userWith('mentor');
      const exception = (
        await scope().cradle.addAvailabilityException(owner, {
          startsAt: NOW.add({ hours: 24 }),
          endsAt: NOW.add({ hours: 26 }),
          kind: 'off',
          note: null,
        })
      )._unsafeUnwrap();

      expect(
        (await scope().cradle.deleteAvailabilityException(other, exception.id))._unsafeUnwrapErr(),
      ).toEqual({ code: 'scheduling.not_found' });
      const own = (await scope().cradle.getMentorCalendar(owner))._unsafeUnwrap();
      expect(own.exceptions.map((e) => e.id)).toEqual([exception.id]);
      expect((await scope().cradle.getMentorCalendar(other))._unsafeUnwrap().exceptions).toEqual(
        [],
      );

      const stored = await rows<{ n: string }>(
        'select count(*) as n from "scheduling"."availability_exception" where "mentor_id" = ?',
        [owner.id],
      );
      expect(Number(stored[0]?.n)).toBe(1);
    });

    it('refuses every non-mentor (403)', async () => {
      const student = await userWith('student');
      expect((await scope().cradle.getMentorCalendar(student))._unsafeUnwrapErr()).toEqual({
        code: 'scheduling.forbidden',
      });
      expect(
        (
          await scope().cradle.saveAvailabilityTemplate(student, {
            rules: template,
            expectedVersion: 0,
            acknowledgeConflicts: false,
          })
        )._unsafeUnwrapErr(),
      ).toEqual({ code: 'scheduling.forbidden' });
    });
  },
);
