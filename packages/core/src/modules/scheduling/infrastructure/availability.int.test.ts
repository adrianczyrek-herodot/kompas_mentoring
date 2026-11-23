import { FakeClock } from '@kompas/testing';
import { asValue } from 'awilix';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AppContainer } from '../../../container.ts';
import {
  dockerAvailable,
  integrationSuite,
} from '../../../shared/infrastructure/db/test-database.ts';
import type { BusyRepository } from '../application/ports.ts';
import type { Interval } from '../domain/policies/slots-for.policy.ts';
import {
  type AvailabilityEnv,
  addException,
  bookableMentor,
  instant,
  NOW,
  readAvailability,
  saveTemplate,
  setSettings,
  startAvailabilityEnv,
  startsAtOf,
} from './availability.int-support.ts';

// E3-S3 step 8 (E3-S3 T2/T3): the public availability of a mentor on PostgreSQL — the weekly
// template in their zone, `off`/`extra` exceptions, the buffer, DST and „następny wolny termin".
// The trial rules and the 404 live in `availability-trial.int.test.ts`.
describe.skipIf(!dockerAvailable)(
  integrationSuite('scheduling: public mentor availability on PostgreSQL'),
  () => {
    let env: AvailabilityEnv;

    beforeAll(async () => {
      env = await startAvailabilityEnv(new FakeClock(NOW));
    });

    afterAll(async () => {
      await env.close();
    });

    it('turns the weekly template into slots in the mentor zone (Q9/Q12)', async () => {
      const { mentor, profileId } = await bookableMentor(env.container);
      // Monday 09:00–10:00 Europe/Warsaw = 08:00Z–09:00Z in March (CET).
      await saveTemplate(env.container, mentor, [{ weekday: 1, start: '09:00', end: '10:00' }]);

      const week = await readAvailability(env.container, {
        mentorProfileId: profileId,
        range: { from: instant('2026-03-01T00:00:00Z'), to: instant('2026-03-08T00:00:00Z') },
        durationMinutes: 30,
        kind: 'plan',
      });

      expect(week.mentorTimeZone).toBe('Europe/Warsaw');
      expect(startsAtOf(week)).toEqual(['2026-03-02T08:00:00Z', '2026-03-02T08:30:00Z']);
      expect(week.nextAvailableAt).toBeNull();
    });

    it('honours `off` and `extra` exceptions', async () => {
      const { mentor, profileId } = await bookableMentor(env.container);
      // Monday 09:00–11:00 CET is 08:00Z–10:00Z.
      await saveTemplate(env.container, mentor, [{ weekday: 1, start: '09:00', end: '11:00' }]);
      await addException(env.container, mentor, {
        startsAt: instant('2026-03-02T08:00:00Z'),
        endsAt: instant('2026-03-02T09:00:00Z'),
        kind: 'off',
      });
      await addException(env.container, mentor, {
        startsAt: instant('2026-03-03T18:00:00Z'),
        endsAt: instant('2026-03-03T19:00:00Z'),
        kind: 'extra',
      });

      const week = await readAvailability(env.container, {
        mentorProfileId: profileId,
        range: { from: instant('2026-03-01T00:00:00Z'), to: instant('2026-03-08T00:00:00Z') },
        durationMinutes: 30,
        kind: 'plan',
      });

      expect(startsAtOf(week)).toEqual([
        '2026-03-02T09:00:00Z',
        '2026-03-02T09:30:00Z',
        '2026-03-03T18:00:00Z',
        '2026-03-03T18:30:00Z',
      ]);
    });

    it('keeps the mentor buffer around busy time (M3 buffer, Q11)', async () => {
      const { mentor, profileId } = await bookableMentor(env.container);
      // Monday 09:00–12:00 CET is 08:00Z–11:00Z.
      await saveTemplate(env.container, mentor, [{ weekday: 1, start: '09:00', end: '12:00' }]);
      await setSettings(env.container, mentor, {
        timeZone: 'Europe/Warsaw',
        minNoticeMinutes: 120,
        bufferMinutes: 30,
      });
      // Busy time stands in for the `booking` table of step 10 / Google time of E3-S10.
      const busy: Interval[] = [
        { start: instant('2026-03-02T09:00:00Z'), end: instant('2026-03-02T09:30:00Z') },
      ];
      const busyRepository: BusyRepository = { listBusy: () => Promise.resolve(busy) };
      const withBusy: AppContainer = env.containerAt(new FakeClock(NOW));
      withBusy.register({ busyRepository: asValue(busyRepository) });

      const week = await readAvailability(withBusy, {
        mentorProfileId: profileId,
        range: { from: instant('2026-03-01T00:00:00Z'), to: instant('2026-03-08T00:00:00Z') },
        durationMinutes: 30,
        kind: 'plan',
      });

      // 08:00Z ends exactly when the busy time starts, so it stays; 08:30Z and 09:00Z would run into
      // it (with a 30-min buffer the session must end by 09:00Z), and 09:30Z may start when the busy
      // time ends — the buffer follows a session, it does not precede it.
      expect(startsAtOf(week)).toEqual([
        '2026-03-02T08:00:00Z',
        '2026-03-02T09:30:00Z',
        '2026-03-02T10:00:00Z',
        '2026-03-02T10:30:00Z',
      ]);
    });

    it('survives the DST Sundays of March and October (29.03.2026 / 25.10.2026)', async () => {
      const { mentor, profileId } = await bookableMentor(env.container);
      await saveTemplate(env.container, mentor, [{ weekday: 7, start: '01:30', end: '03:30' }]);

      const march = await readAvailability(env.container, {
        mentorProfileId: profileId,
        range: { from: instant('2026-03-29T00:00:00Z'), to: instant('2026-03-30T00:00:00Z') },
        durationMinutes: 30,
        kind: 'plan',
      });
      // The spring-forward gap costs an hour of real time: 01:30–03:30 lasts 1 h.
      expect(startsAtOf(march)).toEqual(['2026-03-29T00:30:00Z', '2026-03-29T01:00:00Z']);

      // October is past March's 8-week horizon, so it gets its own clock (same database).
      const autumn = env.containerAt(new FakeClock(instant('2026-09-01T00:00:00Z')));
      const october = await readAvailability(autumn, {
        mentorProfileId: profileId,
        range: { from: instant('2026-10-24T00:00:00Z'), to: instant('2026-10-26T00:00:00Z') },
        durationMinutes: 30,
        kind: 'plan',
      });
      // The autumn overlap adds an hour: 01:30–03:30 lasts 3 h, and every slot is still 30 min.
      expect(october.slots).toHaveLength(6);
      for (const slot of october.slots) {
        expect(slot.endsAt.epochMilliseconds - slot.startsAt.epochMilliseconds).toBe(30 * 60_000);
      }
    });

    it('answers with the next free slot when the requested week is empty (U1 state E)', async () => {
      const { mentor, profileId } = await bookableMentor(env.container);
      await saveTemplate(env.container, mentor, [{ weekday: 1, start: '09:00', end: '10:00' }]);

      // Tuesday to Sunday — no Monday, so the requested window is empty.
      const emptyWeek = await readAvailability(env.container, {
        mentorProfileId: profileId,
        range: { from: instant('2026-03-03T00:00:00Z'), to: instant('2026-03-08T00:00:00Z') },
        durationMinutes: 30,
        kind: 'plan',
      });

      expect(emptyWeek.slots).toEqual([]);
      expect(emptyWeek.nextAvailableAt?.toString()).toBe('2026-03-09T08:00:00Z');
    });
  },
);
