import { Temporal } from 'temporal-polyfill';
import type { AppContainer } from '../../../container.ts';
import type { Clock } from '../../../shared/domain/index.ts';
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
