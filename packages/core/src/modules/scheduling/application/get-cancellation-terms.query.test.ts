import { FakeClock } from '@kompas/testing';
import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { makeGetCancellationTerms } from './get-cancellation-terms.query.ts';

describe('getCancellationTerms', () => {
  it('uses the injected clock instead of the system time', () => {
    const clock = new FakeClock();
    const getCancellationTerms = makeGetCancellationTerms({ clock });
    const booking = { startsAt: clock.now().add({ hours: 13 }) };

    expect(getCancellationTerms(booking).isFree).toBe(true);
    clock.advance(Temporal.Duration.from({ hours: 2 }));
    expect(getCancellationTerms(booking)).toEqual({
      isFree: false,
      freeUntil: booking.startsAt.subtract({ hours: 12 }),
    });
  });
});
