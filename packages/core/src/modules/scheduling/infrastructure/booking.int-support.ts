import { FakeClock } from '@kompas/testing';
import { Temporal } from 'temporal-polyfill';
import { startAvailabilityEnv, type AvailabilityEnv } from './availability.int-support.ts';

/** Monday 2027-01-04 07:00 Warsaw — two hours before the 09:00 slot with a 2 h notice. */
export const BOOKING_NOW: Temporal.Instant = Temporal.ZonedDateTime.from(
  '2027-01-04T07:00[Europe/Warsaw]',
).toInstant();

/** 09:00 Warsaw = 08:00Z; 10:00 Warsaw = 09:00Z (winter, UTC+1). */
export const SLOT_0900 = Temporal.Instant.from('2027-01-04T08:00:00Z');
export const SLOT_1000 = Temporal.Instant.from('2027-01-04T09:00:00Z');
export const SLOT_0930 = Temporal.Instant.from('2027-01-04T08:30:00Z');

const MONDAY_TEMPLATE = [{ weekday: 1 as const, start: '09:00', end: '12:00' }];

export interface BookingEnv extends AvailabilityEnv {
  readonly clock: FakeClock;
}

/** Fixtures of the booking integration suite (step 10): a mutable clock on the shared database. */
export const startBookingEnv = async (): Promise<BookingEnv> => {
  const clock = new FakeClock(BOOKING_NOW);
  const env = await startAvailabilityEnv(clock);
  return { ...env, clock };
};

export { MONDAY_TEMPLATE };
