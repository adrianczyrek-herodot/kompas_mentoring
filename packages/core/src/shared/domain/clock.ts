import type { Temporal } from 'temporal-polyfill';

/**
 * Source of the current time. Domain code never reads the system clock (spec §4.10):
 * policies take `now: Temporal.Instant`, application services get a Clock from the container.
 */
export interface Clock {
  now(): Temporal.Instant;
}
