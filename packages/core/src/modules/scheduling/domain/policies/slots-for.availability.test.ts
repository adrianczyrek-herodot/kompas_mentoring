import fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import type { AvailabilityException, AvailabilityRule, Weekday } from '../availability.entity.ts';
import { BOOKING_HORIZON } from './config.ts';
import { availabilityWindows, type Interval, slotsFor } from './slots-for.policy.ts';

// Spec "Silnik slotów": properties 1, 3, 4 and 8 — the availability, buffer, notice and horizon
// edges of the answer. Properties 2, 5 and 6 live in `slots-for.results.test.ts`; property 7 and
// the DST examples in `slots-for.dst.test.ts`. Helpers are per file on purpose: `domain/` may not
// import fast-check or vitest from a shared module (spec §2.4 rule 1).

const instant = (value: string): Temporal.Instant => Temporal.Instant.from(value);
const minutes = (value: number): Temporal.Duration => Temporal.Duration.from({ minutes: value });
const time = (hour: number, minute = 0): Temporal.PlainTime =>
  Temporal.PlainTime.from({ hour, minute });

const isBefore = (a: Temporal.Instant, b: Temporal.Instant): boolean =>
  Temporal.Instant.compare(a, b) < 0;
const isAtOrAfter = (a: Temporal.Instant, b: Temporal.Instant): boolean =>
  Temporal.Instant.compare(a, b) >= 0;
const isAtOrBefore = (a: Temporal.Instant, b: Temporal.Instant): boolean =>
  Temporal.Instant.compare(a, b) <= 0;

/** Half-open overlap of `[start, end)` intervals, the same convention as the engine. */
const overlaps = (a: Interval, b: Interval): boolean =>
  isBefore(a.start, b.end) && isBefore(b.start, a.end);

const slotInterval = (start: Temporal.Instant, duration: Temporal.Duration): Interval => ({
  start,
  end: start.add(duration),
});

const off = (
  startsAt: Temporal.Instant,
  endsAt: Temporal.Instant,
  kind: 'off' | 'extra' = 'off',
): AvailabilityException => ({
  id: `exception-${startsAt.toString()}-${kind}`,
  startsAt,
  endsAt,
  kind,
  note: null,
});

/** Neutral input: no rules, no exceptions, no busy time, open notice and no buffer. */
const baseInput = {
  rules: [] as readonly AvailabilityRule[],
  exceptions: [] as readonly AvailabilityException[],
  busy: [] as readonly Interval[],
  settings: { minNotice: minutes(0), buffer: minutes(0) },
  duration: minutes(30),
  horizon: BOOKING_HORIZON,
  now: instant('2026-01-01T00:00:00Z'),
};

/** Two weeks from `now` — the window the properties look at. */
const twoWeeksFrom = (now: Temporal.Instant) => ({
  from: now,
  to: now.add({ hours: 14 * 24 }),
});

/** Zones of property 7 — two EU, one US and one that never changes its clocks. */
const ZONES = ['Europe/Warsaw', 'Europe/London', 'America/New_York', 'Asia/Kolkata'] as const;

/** A rule on the 30-min grid, never crossing midnight (M3: overnight = two rules). */
const anAvailabilityRule = (): fc.Arbitrary<AvailabilityRule> =>
  fc
    .tuple(
      fc.integer({ min: 0, max: 44 }), // start on the 30-min grid, at the latest 22:00
      fc.integer({ min: 1, max: 6 }), // 30–180 min long, cut at midnight below
      fc.integer({ min: 1, max: 7 }),
    )
    .map(([startStep, steps, weekday]) => {
      const length = Math.min(steps, 48 - startStep);
      const toTime = (value: number) => time(Math.floor(value / 2), (value % 2) * 30);
      return {
        weekday: weekday as Weekday,
        startLocal: toTime(startStep),
        endLocal: toTime(startStep + length),
      };
    });

/** `now` sits on and around the March and October transitions of the zones of the spec. */
const aMomentNow = (): fc.Arbitrary<Temporal.Instant> =>
  fc.oneof(
    fc
      .constantFrom(
        '2026-03-28T12:00:00Z',
        '2026-03-29T00:00:00Z',
        '2026-03-29T00:30:00Z',
        '2026-03-29T01:00:00Z',
        '2026-03-08T06:30:00Z',
        '2026-10-24T12:00:00Z',
        '2026-10-25T00:00:00Z',
        '2026-10-25T00:30:00Z',
        '2026-10-25T01:00:00Z',
        '2026-11-01T05:30:00Z',
      )
      .map(instant),
    fc
      .integer({
        min: Date.parse('2026-01-01T00:00:00Z'),
        max: Date.parse('2027-01-01T00:00:00Z'),
      })
      .map((milliseconds) => Temporal.Instant.fromEpochMilliseconds(milliseconds)),
  );

const aDuration = (): fc.Arbitrary<Temporal.Duration> => fc.constantFrom(minutes(30), minutes(60));

const aBuffer = (): fc.Arbitrary<Temporal.Duration> =>
  fc.constantFrom(minutes(0), minutes(15), minutes(30));

const aMinNotice = (): fc.Arbitrary<Temporal.Duration> =>
  fc.constantFrom(minutes(0), minutes(120), minutes(360), minutes(2880));

/** Blocked time as offsets from `now`, in 30-min steps inside the two weeks the properties look at. */
const aBusySpan = (): fc.Arbitrary<readonly [number, number]> =>
  fc.tuple(fc.integer({ min: 0, max: 14 * 48 - 1 }), fc.integer({ min: 1, max: 8 }));

const busyFrom = (
  spans: readonly (readonly [number, number])[],
  now: Temporal.Instant,
): Interval[] =>
  spans.map(([step, steps]) => {
    const start = now.add({ minutes: step * 30 });
    return { start, end: start.add({ minutes: steps * 30 }) };
  });

/** Every slot must sit wholly inside an availability window and clear of each `off` exception. */
const expectInsideAvailability = (input: {
  rules: readonly AvailabilityRule[];
  exceptions: readonly AvailabilityException[];
  timeZone: string;
  range: { from: Temporal.Instant; to: Temporal.Instant };
  slots: readonly Temporal.Instant[];
  duration: Temporal.Duration;
}): void => {
  const windows = availabilityWindows(input);
  for (const slot of input.slots) {
    const candidate = slotInterval(slot, input.duration);
    const inside = windows.some(
      (window) =>
        isAtOrAfter(candidate.start, window.start) && isAtOrBefore(candidate.end, window.end),
    );
    expect(inside).toBe(true);
    for (const exception of input.exceptions.filter((e) => e.kind === 'off')) {
      expect(overlaps(candidate, { start: exception.startsAt, end: exception.endsAt })).toBe(false);
    }
  }
};

describe('slotsFor — property 1: slots stay inside the availability that is left', () => {
  it('keeps every slot wholly inside an availability window and clear of every `off` exception', () => {
    fc.assert(
      fc.property(
        aMomentNow(),
        fc.constantFrom(...ZONES),
        fc.array(anAvailabilityRule(), { minLength: 1, maxLength: 4 }),
        fc.array(fc.tuple(aMomentNow(), fc.integer({ min: 1, max: 8 })), { maxLength: 3 }),
        fc.array(fc.tuple(aMomentNow(), fc.integer({ min: 1, max: 8 })), { maxLength: 2 }),
        (now, timeZone, rules, offSpans, extraSpans) => {
          const range = twoWeeksFrom(now);
          const exceptions = [
            ...offSpans.map(([start, steps]) =>
              off(start, start.add({ minutes: steps * 30 }), 'off'),
            ),
            ...extraSpans.map(([start, steps]) =>
              off(start, start.add({ minutes: steps * 30 }), 'extra'),
            ),
          ];
          const slots = slotsFor({ ...baseInput, rules, exceptions, timeZone, range, now });
          expectInsideAvailability({
            rules,
            exceptions,
            timeZone,
            range,
            slots,
            duration: baseInput.duration,
          });
        },
      ),
    );
  });
});

describe('slotsFor — property 3: no slot plus its buffer overlaps busy time', () => {
  it('keeps every slot clear of busy time plus the mentor buffer', () => {
    fc.assert(
      fc.property(
        aMomentNow(),
        fc.constantFrom(...ZONES),
        fc.array(anAvailabilityRule(), { minLength: 1, maxLength: 3 }),
        fc.array(aBusySpan(), { maxLength: 6 }),
        aDuration(),
        aBuffer(),
        (now, timeZone, rules, spans, duration, buffer) => {
          const busy = busyFrom(spans, now);
          const slots = slotsFor({
            ...baseInput,
            rules,
            timeZone,
            range: twoWeeksFrom(now),
            now,
            duration,
            busy,
            settings: { minNotice: minutes(0), buffer },
          });
          for (const slot of slots) {
            const protectedSlot = { start: slot, end: slot.add(duration).add(buffer) };
            for (const blocked of busy) expect(overlaps(protectedSlot, blocked)).toBe(false);
          }
        },
      ),
    );
  });
});

describe('slotsFor — property 4: slots live between notice and horizon', () => {
  it('never offers a slot before `now + minNotice` or after `now + horizon`', () => {
    fc.assert(
      fc.property(
        aMomentNow(),
        fc.constantFrom(...ZONES),
        fc.array(anAvailabilityRule(), { minLength: 1, maxLength: 4 }),
        aMinNotice(),
        aDuration(),
        (now, timeZone, rules, minNotice, duration) => {
          const slots = slotsFor({
            ...baseInput,
            rules,
            timeZone,
            range: { from: now, to: now.add({ hours: 70 * 24 }) },
            now,
            duration,
            settings: { minNotice, buffer: minutes(0) },
          });
          const earliest = now.add(minNotice);
          const latest = now.add(BOOKING_HORIZON);
          for (const slot of slots) {
            expect(isAtOrAfter(slot, earliest)).toBe(true);
            expect(isAtOrBefore(slot, latest)).toBe(true);
          }
        },
      ),
    );
  });
});

describe('slotsFor — property 8: moving `now` by a millisecond never breaks the notice', () => {
  it('never adds a slot before `now + minNotice` when `now` moves 1 ms', () => {
    fc.assert(
      fc.property(
        aMomentNow(),
        fc.constantFrom(...ZONES),
        fc.array(anAvailabilityRule(), { minLength: 1, maxLength: 3 }),
        aMinNotice(),
        aDuration(),
        (now, timeZone, rules, minNotice, duration) => {
          const input = {
            ...baseInput,
            rules,
            timeZone,
            range: twoWeeksFrom(now),
            duration,
            settings: { minNotice, buffer: minutes(0) },
          };
          const shifted = now.add({ milliseconds: 1 });
          const left = slotsFor({ ...input, now });
          const right = slotsFor({ ...input, now: shifted });
          for (const slot of left) expect(isAtOrAfter(slot, now.add(minNotice))).toBe(true);
          for (const slot of right) {
            expect(isAtOrAfter(slot, shifted.add(minNotice))).toBe(true);
            expect(isAtOrAfter(slot, now.add(minNotice))).toBe(true);
          }
        },
      ),
    );
  });
});
