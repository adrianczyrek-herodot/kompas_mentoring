import { FakeClock } from '@kompas/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createRequestScope } from '../../../container.ts';
import { MentorId } from '../../../shared/domain/index.ts';
import {
  dockerAvailable,
  integrationSuite,
} from '../../../shared/infrastructure/db/test-database.ts';
import {
  type AvailabilityEnv,
  bookableMentor,
  instant,
  NOW,
  readAvailability,
  saveTemplate,
  setSettings,
  startAvailabilityEnv,
} from './availability.int-support.ts';

// E3-S3 step 8: what differs between a trial and a later session (Q2/Q9) and the one 404 a caller
// gets for a mentor they may not book (Q5/Q13). The rest lives in `availability.int.test.ts`.
describe.skipIf(!dockerAvailable)(
  integrationSuite('scheduling: trial rules and unavailable mentors on PostgreSQL'),
  () => {
    let env: AvailabilityEnv;

    beforeAll(async () => {
      env = await startAvailabilityEnv(new FakeClock(NOW));
    });

    afterAll(async () => {
      await env.close();
    });

    it('treats a trial as a 30-minute session with the 6 h notice floor (Q2/Q9)', async () => {
      const { mentor, profileId } = await bookableMentor(env.container);
      // Sunday 13:00–18:00 CET is 12:00Z–17:00Z; the mentor accepts a 2 h notice.
      await saveTemplate(env.container, mentor, [{ weekday: 7, start: '13:00', end: '18:00' }]);
      await setSettings(env.container, mentor, {
        timeZone: 'Europe/Warsaw',
        minNoticeMinutes: 120,
        bufferMinutes: 0,
      });
      const today = {
        range: { from: instant('2026-03-01T09:00:00Z'), to: instant('2026-03-01T20:00:00Z') },
      };

      const trial = await readAvailability(env.container, {
        mentorProfileId: profileId,
        ...today,
        durationMinutes: 60,
        kind: 'trial',
      });
      // A trial is always 30 min and never sooner than 6 h from `now` (15:00Z).
      expect(trial.durationMinutes).toBe(30);
      expect(trial.slots[0]?.startsAt.toString()).toBe('2026-03-01T15:00:00Z');

      const plan = await readAvailability(env.container, {
        mentorProfileId: profileId,
        ...today,
        durationMinutes: 60,
        kind: 'plan',
      });
      // A later session follows the mentor's own 2 h notice and may take 60 min.
      expect(plan.durationMinutes).toBe(60);
      expect(plan.slots[0]?.startsAt.toString()).toBe('2026-03-01T12:00:00Z');
    });

    it('refuses a mentor the projection does not know or cannot book (Q5, 404)', async () => {
      const scope = createRequestScope(env.container, { requestId: 'int-availability-trial-1' });
      const unknown = await scope.cradle.getMentorAvailability({
        mentorProfileId: '0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d30',
        range: { from: NOW, to: NOW.add({ hours: 24 }) },
        durationMinutes: 30,
        kind: 'plan',
      });
      expect(unknown._unsafeUnwrapErr()).toEqual({ code: 'scheduling.mentor_unavailable' });

      const { mentor, profileId } = await bookableMentor(env.container);
      await scope.cradle.mentorBookabilityRepository.upsert({
        mentorId: MentorId.parse(mentor.id),
        mentorProfileId: profileId,
        bookable: false,
        acceptingNew: false,
        rate60: null,
        updatedAt: NOW,
      });
      const suspended = await scope.cradle.getMentorAvailability({
        mentorProfileId: profileId,
        range: { from: NOW, to: NOW.add({ hours: 24 }) },
        durationMinutes: 30,
        kind: 'plan',
      });
      expect(suspended._unsafeUnwrapErr()).toEqual({ code: 'scheduling.mentor_unavailable' });
    });
  },
);
