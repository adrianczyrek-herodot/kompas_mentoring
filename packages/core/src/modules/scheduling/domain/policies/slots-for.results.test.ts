import fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import type { AvailabilityException, AvailabilityRule, Weekday } from '../availability.entity.ts';
import { BOOKING_HORIZON } from './config.ts';
import { type Interval, slotsFor } from './slots-for.policy.ts';

// Spec "Silnik slotów": properties 2, 5 and 6 — the shape of the returned list and the effect of a
// booking on it. Helpers are per file on purpose: `domain/` may not import fast-check or vitest
// from a shared module (spec §2.4 rule 1).

const instant = (value: string): Temporal.Instant => Temporal.Instant.from(value);
const minutes = (value: number): Temporal.Duration => Temporal.Duration.from({ minutes: value });
const time = (hour: number, minute = 0): Temporal.PlainTime =>
  Temporal.PlainTime.from({ hour, minute });

const isBefore = (a: Temporal.Instant, b: Temporal.Instant): boolean =>
  Temporal.Instant.compare(a, b) < 0;

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

/** A slot lasts `duration` of real time, whatever happens to the clock on that day. */
const expectRealDuration = (
  slots: readonly Temporal.Instant[],
  duration: Temporal.Duration,
): void => {
  for (const slot of slots) {
    expect(slot.add(duration).epochMilliseconds - slot.epochMilliseconds).toBe(
      duration.total({ unit: 'millisecond' }),
    );
  }
};

describe('slotsFor — property 2: a slot lasts exactly `duration` of real time', () => {
  it('never stretches or shrinks a slot across a DST change', () => {
    fc.assert(
      fc.property(
        aMomentNow(),
        fc.constantFrom(...ZONES),
        fc.array(anAvailabilityRule(), { minLength: 1, maxLength: 3 }),
        aDuration(),
        (now, timeZone, rules, duration) => {
          const slots = slotsFor({
            ...baseInput,
            rules,
            timeZone,
            range: twoWeeksFrom(now),
            now,
            duration,
          });
          expectRealDuration(slots, duration);
        },
      ),
    );
  });
});

describe('slotsFor — property 5: the answer is a sorted, duplicate-free list', () => {
  it('returns ascending instants without repeats', () => {
    fc.assert(
      fc.property(
        aMomentNow(),
        fc.constantFrom(...ZONES),
        fc.array(anAvailabilityRule(), { minLength: 1, maxLength: 6 }),
        fc.array(fc.tuple(aMomentNow(), fc.integer({ min: 1, max: 8 })), { maxLength: 3 }),
        aDuration(),
        (now, timeZone, rules, extraSpans, duration) => {
          const exceptions = extraSpans.map(([start, steps]) =>
            off(start, start.add({ minutes: steps * 30 }), 'extra'),
          );
          const slots = slotsFor({
            ...baseInput,
            rules,
            exceptions,
            timeZone,
            range: twoWeeksFrom(now),
            now,
            duration,
          });
          let previous: Temporal.Instant | undefined;
          for (const slot of slots) {
            if (previous !== undefined) expect(isBefore(previous, slot)).toBe(true);
            previous = slot;
          }
        },
      ),
    );
  });
});

describe('slotsFor — property 6: busy time removes its slot and only colliding slots', () => {
  it('removes the booked slot and leaves every slot that stays clear of it', () => {
    fc.assert(
      fc.property(
        aMomentNow(),
        fc.constantFrom(...ZONES),
        fc.array(anAvailabilityRule(), { minLength: 1, maxLength: 3 }),
        aDuration(),
        aBuffer(),
        (now, timeZone, rules, duration, buffer) => {
          const input = {
            ...baseInput,
            rules,
            timeZone,
            range: twoWeeksFrom(now),
            now,
            duration,
            settings: { minNotice: minutes(0), buffer },
          };
          const before = slotsFor(input);
          fc.pre(before.length > 0);
          const [booked] = before;
          if (booked === undefined) return;
          const booking = slotInterval(booked, duration);
          const after = slotsFor({ ...input, busy: [booking] });
          expect(after.some((slot) => slot.equals(booked))).toBe(false);
          // Instants are compared by value, not by object identity.
          const kept = new Set(after.map((slot) => slot.epochMilliseconds));
          const protectedBooking = { start: booking.start, end: booking.end.add(buffer) };
          for (const slot of before) {
            if (kept.has(slot.epochMilliseconds)) continue;
            // Only slots that collide with the booking (or its buffer) may disappear.
            expect(
              overlaps({ start: slot, end: slot.add(duration).add(buffer) }, protectedBooking),
            ).toBe(true);
          }
        },
      ),
    );
  });
});
