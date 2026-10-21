import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { FakeClock, MOCKUP_NOW } from './fake-clock.ts';

describe('FakeClock', () => {
  it('starts on Tuesday 2026-10-20 14:00 Europe/Warsaw', () => {
    const local = new FakeClock().now().toZonedDateTimeISO('Europe/Warsaw');
    expect(local.dayOfWeek).toBe(2);
    expect(local.toPlainDateTime().toString()).toBe('2026-10-20T14:00:00');
  });

  it('moves only when told to', () => {
    const clock = new FakeClock();
    clock.advance({ minutes: 90 });
    expect(clock.now()).toEqual(MOCKUP_NOW.add({ minutes: 90 }));
    clock.set(Temporal.Instant.from('2026-01-01T00:00:00Z'));
    expect(clock.now().toString()).toBe('2026-01-01T00:00:00Z');
  });
});
