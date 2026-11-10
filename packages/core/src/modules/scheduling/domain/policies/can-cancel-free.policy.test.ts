import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { canCancelFree, freeCancellationDeadline } from './can-cancel-free.policy.ts';

const warsaw = (local: string): Temporal.Instant =>
  Temporal.ZonedDateTime.from(`${local}[Europe/Warsaw]`).toInstant();

// Mockup "now": Tuesday 2026-10-20 14:00 Europe/Warsaw.
const now = warsaw('2026-10-20T14:00');

describe('canCancelFree (Z4: free until 12 h before start)', () => {
  it.each([
    ['13 h before start', '2026-10-21T03:00', true],
    ['exactly 12 h before start', '2026-10-21T02:00', true],
    ['11 h 59 min before start', '2026-10-21T01:59', false],
    ['after the start', '2026-10-20T13:00', false],
  ])('%s → %s', (_label, startsAt, expected) => {
    expect(canCancelFree({ startsAt: warsaw(startsAt) }, now)).toBe(expected);
  });

  it('counts real hours across the DST change (25 Oct 2026, 03:00 → 02:00)', () => {
    const booking = { startsAt: warsaw('2026-10-25T10:00') }; // 09:00 UTC, after the change
    // 12 real hours earlier is 21:00 UTC = 23:00 CEST on Saturday, not 22:00 wall-clock.
    expect(freeCancellationDeadline(booking).toString()).toBe('2026-10-24T21:00:00Z');
    expect(canCancelFree(booking, warsaw('2026-10-24T22:30'))).toBe(true);
    expect(canCancelFree(booking, warsaw('2026-10-24T23:30'))).toBe(false);
  });
});
