import { FakeClock } from '@kompas/testing';
import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import type { Clock } from '../domain/clock.ts';
import { SystemClock } from './system-clock.ts';

describe('Clock', () => {
  it('SystemClock returns the current instant', () => {
    const clock: Clock = new SystemClock();
    const before = Temporal.Now.instant();
    expect(Temporal.Instant.compare(clock.now(), before)).toBeGreaterThanOrEqual(0);
  });

  it('FakeClock satisfies the Clock port and defaults to the mockup "now"', () => {
    const clock: Clock = new FakeClock();
    expect(clock.now().toZonedDateTimeISO('Europe/Warsaw').toString()).toBe(
      '2026-10-20T14:00:00+02:00[Europe/Warsaw]',
    );
  });
});
