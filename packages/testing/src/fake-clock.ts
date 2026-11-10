import { Temporal } from 'temporal-polyfill';

/** Mockup "now" (spec §4.10): Tuesday 2026-10-20 14:00 Europe/Warsaw. */
export const MOCKUP_NOW: Temporal.Instant = Temporal.ZonedDateTime.from(
  '2026-10-20T14:00[Europe/Warsaw]',
).toInstant();

/**
 * Deterministic Clock for tests. Structurally implements the `Clock` port of
 * `@kompas/core` (no import, to keep the package graph acyclic).
 */
export class FakeClock {
  #now: Temporal.Instant;

  constructor(start: Temporal.Instant = MOCKUP_NOW) {
    this.#now = start;
  }

  now(): Temporal.Instant {
    return this.#now;
  }

  set(instant: Temporal.Instant): void {
    this.#now = instant;
  }

  advance(duration: Temporal.Duration | Temporal.DurationLike): void {
    this.#now = this.#now.add(duration);
  }
}
