import { Temporal } from 'temporal-polyfill';
import { type AppContainer, createRequestScope } from '../../../container.ts';
import {
  BookingId,
  type Clock,
  MentorId,
  newId,
  StudentId,
} from '../../../shared/domain/index.ts';
import { createBoss } from '../../../shared/infrastructure/jobs/boss.ts';
import {
  bookableMentor,
  saveTemplate,
  setSettings,
  startAvailabilityEnv,
  type AvailabilityEnv,
} from './availability.int-support.ts';

/** Monday 2027-01-04 07:00 Warsaw — two hours before the 09:00 slot with a 2 h notice. */
export const BOOKING_NOW: Temporal.Instant = Temporal.ZonedDateTime.from(
  '2027-01-04T07:00[Europe/Warsaw]',
).toInstant();

/**
 * Sunday 2027-01-03 07:00 Warsaw — 26 h before the Monday 09:00 slot, so a trial clears its 6 h
 * notice (Q9); at `BOOKING_NOW` the same slot is too soon for a trial.
 */
export const TRIAL_NOW: Temporal.Instant = BOOKING_NOW.subtract({ hours: 24 });

/** 09:00 Warsaw = 08:00Z; 10:00 Warsaw = 09:00Z (winter, UTC+1). */
export const SLOT_0900 = Temporal.Instant.from('2027-01-04T08:00:00Z');
export const SLOT_1000 = Temporal.Instant.from('2027-01-04T09:00:00Z');
export const SLOT_0930 = Temporal.Instant.from('2027-01-04T08:30:00Z');

const MONDAY_TEMPLATE = [{ weekday: 1 as const, start: '09:00', end: '12:00' }];

export type BookingEnv = AvailabilityEnv;

/** Fixtures of the booking integration suites (step 10–11): one database, one clock from the test. */
export const startBookingEnv = async (clock: Clock): Promise<BookingEnv> => {
  const env = await startAvailabilityEnv(clock);
  // The outbox publishes jobs; the pg-boss schema is normally installed by the worker start
  // (lesson backend 2026-11-23), so the database-less suite installs it once here.
  const installer = createBoss('worker', env.database.getConnectionUri());
  await installer.start();
  await installer.stop({ graceful: false });
  return env;
};

/**
 * Q2: a later session needs a trial of the pair that was `scheduled` and already ended — this one
 * took place a week before `BOOKING_NOW`. Written straight through the repository, like a seed.
 */
export const pastTrial = async (
  container: AppContainer,
  pair: { mentorId: string; studentId: string },
): Promise<void> => {
  const startsAt = BOOKING_NOW.subtract({ hours: 7 * 24 });
  const scope = createRequestScope(container, { requestId: `past-trial-${pair.studentId}` });
  const outcome = await scope.cradle.bookingRepository.createHold({
    id: newId(BookingId),
    mentorId: MentorId.parse(pair.mentorId),
    studentId: StudentId.parse(pair.studentId),
    type: 'trial',
    status: 'scheduled',
    startsAt,
    endsAt: startsAt.add({ minutes: 30 }),
    bufferMinutes: 0,
    holdExpiresAt: null,
    goal: 'Chcę przygotować się do rozmowy rekrutacyjnej na stanowisko senior.',
    price: null,
    acceptDeadlineAt: null,
    now: startsAt.subtract({ hours: 48 }),
  });
  if (outcome.kind !== 'created') throw new Error(`pastTrial fixture failed: ${outcome.kind}`);
};

/** A bookable mentor with a Monday 09:00–12:00 template, a 2 h notice and no buffer (U1 fixture). */
export const mondayMentor = async (container: AppContainer) => {
  const { mentor, profileId } = await bookableMentor(container);
  await saveTemplate(container, mentor, MONDAY_TEMPLATE);
  await setSettings(container, mentor, {
    timeZone: 'Europe/Warsaw',
    minNoticeMinutes: 120,
    bufferMinutes: 0,
  });
  return { mentor, profileId };
};
