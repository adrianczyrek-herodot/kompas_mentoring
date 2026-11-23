import fc from 'fast-check';
import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import type { AvailabilityException, AvailabilityRule, Weekday } from '../availability.entity.ts';
import { BOOKING_HORIZON } from './config.ts';
import { availabilityWindows, type Interval, slotsFor } from './slots-for.policy.ts';

// Property 7 and the DST examples of the F3 spec "Silnik slotów": the transition Sundays of the
// four zones, the two Europe/Warsaw examples and the same instants seen from another zone.
// Helpers are per file on purpose: `domain/` may not import fast-check or vitest from a shared
// module (spec §2.4 rule 1).

/** Zones of property 7 — two EU, one US and one that never changes its clocks. */
const ZONES = ['Europe/Warsaw', 'Europe/London', 'America/New_York', 'Asia/Kolkata'] as const;

const instant = (value: string): Temporal.Instant => Temporal.Instant.from(value);
const minutes = (value: number): Temporal.Duration => Temporal.Duration.from({ minutes: value });
const time = (hour: number, minute = 0): Temporal.PlainTime =>
  Temporal.PlainTime.from({ hour, minute });

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

describe('slotsFor — property 7: a rule offers its real length divided by 30 min', () => {
  /** Last Sunday of the month — the transition day of the EU zones. */
  const lastSunday = (year: number, month: number): Temporal.PlainDate => {
    let date = Temporal.PlainDate.from({ year, month, day: 31 });
    while (date.dayOfWeek !== 7) date = date.subtract({ days: 1 });
    return date;
  };

  /** One rule on one local day: the slots it offers and the real window it came from. */
  const onDay = (timeZone: string, date: Temporal.PlainDate, rule: AvailabilityRule) => {
    const range = {
      from: date.toZonedDateTime({ timeZone }).startOfDay().toInstant(),
      to: date.add({ days: 1 }).toZonedDateTime({ timeZone }).startOfDay().toInstant(),
    };
    const onThisWeekday = { ...rule, weekday: date.dayOfWeek as AvailabilityRule['weekday'] };
    const windows = availabilityWindows({
      rules: [onThisWeekday],
      exceptions: [],
      timeZone,
      range,
    });
    const slots = slotsFor({
      ...baseInput,
      rules: [onThisWeekday],
      timeZone,
      range,
      now: range.from.subtract({ hours: 24 * 30 }),
      horizon: Temporal.Duration.from({ hours: 24 * 365 }),
    });
    return { slots, window: windows[0] };
  };

  it('matches the real length of the window on the DST Sundays of the four zones', () => {
    const days = [
      lastSunday(2026, 3),
      lastSunday(2026, 10),
      Temporal.PlainDate.from('2026-03-08'), // US spring forward
      Temporal.PlainDate.from('2026-11-01'), // US fall back
      Temporal.PlainDate.from('2026-11-02'), // an ordinary Monday
    ];
    const templates = [
      { weekday: 7 as const, startLocal: time(0, 0), endLocal: time(4, 0) },
      { weekday: 7 as const, startLocal: time(1, 30), endLocal: time(3, 30) },
      { weekday: 7 as const, startLocal: time(22, 0), endLocal: time(23, 30) },
    ];
    for (const timeZone of ZONES) {
      for (const date of days) {
        for (const template of templates) {
          const { slots, window } = onDay(timeZone, date, template);
          if (window === undefined) {
            expect(slots).toEqual([]);
            continue;
          }
          const realMinutes = window.end.since(window.start).total({ unit: 'minute' });
          expect(slots).toHaveLength(Math.floor(realMinutes / 30));
        }
      }
    }
  });

  it('holds for arbitrary zones, rules and moments (fast-check)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ZONES),
        fc.integer({ min: 2026, max: 2027 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }),
        anAvailabilityRule(),
        (timeZone, year, month, day, rule) => {
          const date = Temporal.PlainDate.from({ year, month, day });
          const { slots, window } = onDay(timeZone, date, rule);
          const realMinutes =
            window === undefined ? 0 : window.end.since(window.start).total({ unit: 'minute' });
          expect(slots).toHaveLength(Math.floor(realMinutes / 30));
        },
      ),
    );
  });
});

// Examples of the F3 spec "Silnik slotów": the two DST Sundays of Europe/Warsaw, the same instants
// seen from another zone, and the exceptions, buffer, notice and horizon rules.

const sundayRule = (start: Temporal.PlainTime, end: Temporal.PlainTime): AvailabilityRule => ({
  weekday: 7,
  startLocal: start,
  endLocal: end,
});

/** The whole local day of `date` in Europe/Warsaw, as instants. */
const warsawDay = (date: string) => {
  const plainDate = Temporal.PlainDate.from(date);
  return {
    from: plainDate.toZonedDateTime({ timeZone: 'Europe/Warsaw' }).startOfDay().toInstant(),
    to: plainDate
      .add({ days: 1 })
      .toZonedDateTime({ timeZone: 'Europe/Warsaw' })
      .startOfDay()
      .toInstant(),
  };
};

const localTimes = (slots: readonly Temporal.Instant[], timeZone: string): string[] =>
  slots.map((slot) =>
    slot.toZonedDateTimeISO(timeZone).toPlainTime().toString({ smallestUnit: 'minute' }),
  );

describe('slotsFor — DST examples of the spec', () => {
  it('offers 2 slots for 01:30–03:30 on 29.03.2026 in Europe/Warsaw (one real hour)', () => {
    const range = warsawDay('2026-03-29');
    const slots = slotsFor({
      ...baseInput,
      rules: [sundayRule(time(1, 30), time(3, 30))],
      timeZone: 'Europe/Warsaw',
      range,
      now: range.from,
    });
    expect(slots.map((slot) => slot.toString())).toEqual([
      '2026-03-29T00:30:00Z',
      '2026-03-29T01:00:00Z',
    ]);
  });

  it('offers 6 slots for 01:30–03:30 on 25.10.2026 in Europe/Warsaw (three real hours)', () => {
    const range = warsawDay('2026-10-25');
    const slots = slotsFor({
      ...baseInput,
      rules: [sundayRule(time(1, 30), time(3, 30))],
      timeZone: 'Europe/Warsaw',
      range,
      now: range.from,
    });
    expect(slots).toHaveLength(6);
    expect(slots[0]?.toString()).toBe('2026-10-24T23:30:00Z');
    expect(slots[5]?.toString()).toBe('2026-10-25T02:00:00Z');
  });

  it('gives a student in America/New_York the same instants at other wall-clock hours', () => {
    const range = warsawDay('2026-10-25');
    const slots = slotsFor({
      ...baseInput,
      rules: [sundayRule(time(1, 30), time(3, 30))],
      timeZone: 'Europe/Warsaw',
      range,
      now: range.from,
    });
    // The same six instants: the mentor sees the hour repeat, the student six distinct hours.
    expect(new Set(localTimes(slots, 'Europe/Warsaw'))).toEqual(
      new Set(['01:30', '02:00', '02:30', '03:00']),
    );
    expect(new Set(localTimes(slots, 'America/New_York'))).toEqual(
      new Set(['19:30', '20:00', '20:30', '21:00', '21:30', '22:00']),
    );
  });

  it('keeps the grid anchored to the window start on a spring-forward day', () => {
    const range = warsawDay('2026-03-29');
    const slots = slotsFor({
      ...baseInput,
      rules: [sundayRule(time(0, 15), time(4, 0))],
      timeZone: 'Europe/Warsaw',
      range,
      now: range.from,
    });
    // 00:15 CET is 23:15Z; 30-min steps stay on the instant axis, so the hour gap shows up as a
    // missing wall-clock hour, never as a shorter slot.
    expect(slots[0]?.toString()).toBe('2026-03-28T23:15:00Z');
    expect(localTimes(slots, 'Europe/Warsaw')).toContain('03:15');
  });

  it('drops the slots an `off` exception covers and adds the ones an `extra` exception opens', () => {
    const slots = slotsFor({
      ...baseInput,
      rules: [{ weekday: 7, startLocal: time(9, 0), endLocal: time(11, 0) }],
      exceptions: [
        off(instant('2026-11-01T09:00:00Z'), instant('2026-11-01T10:00:00Z')),
        off(instant('2026-11-01T18:00:00Z'), instant('2026-11-01T19:00:00Z'), 'extra'),
      ],
      timeZone: 'Europe/Warsaw',
      range: { from: instant('2026-11-01T00:00:00Z'), to: instant('2026-11-01T21:00:00Z') },
      now: instant('2026-10-31T00:00:00Z'),
    });
    // 09:00–11:00 CET is 08:00Z–10:00Z; the `off` hour removes the first two slots.
    expect(slots.map((slot) => slot.toString())).toEqual([
      '2026-11-01T08:00:00Z',
      '2026-11-01T08:30:00Z',
      '2026-11-01T18:00:00Z',
      '2026-11-01T18:30:00Z',
    ]);
  });

  it('keeps the buffer clear of busy time and honours notice and horizon', () => {
    const slots = slotsFor({
      ...baseInput,
      rules: [{ weekday: 7, startLocal: time(9, 0), endLocal: time(12, 0) }],
      busy: [{ start: instant('2026-11-01T09:30:00Z'), end: instant('2026-11-01T10:00:00Z') }],
      timeZone: 'Europe/Warsaw',
      range: { from: instant('2026-11-01T00:00:00Z'), to: instant('2026-11-01T23:00:00Z') },
      now: instant('2026-11-01T08:10:00Z'),
      settings: { minNotice: minutes(60), buffer: minutes(30) },
    });
    // 09:00–12:00 CET is 08:00Z–11:00Z. The 60-min notice drops 08:00Z–09:00Z, 09:30Z is busy and
    // its buffer also takes 09:00Z — 10:00Z and 10:30Z stay bookable.
    expect(slots.map((slot) => slot.toString())).toEqual([
      '2026-11-01T10:00:00Z',
      '2026-11-01T10:30:00Z',
    ]);
  });

  it('offers nothing for an empty template or an inverted range', () => {
    const rule = { weekday: 7 as Weekday, startLocal: time(9, 0), endLocal: time(12, 0) };
    const day = {
      from: instant('2026-11-01T00:00:00Z'),
      to: instant('2026-11-02T00:00:00Z'),
    };
    expect(
      slotsFor({ ...baseInput, rules: [], timeZone: 'Europe/Warsaw', range: day, now: day.from }),
    ).toEqual([]);
    expect(
      slotsFor({
        ...baseInput,
        rules: [rule],
        timeZone: 'Europe/Warsaw',
        range: { from: day.to, to: day.from },
        now: day.from,
      }),
    ).toEqual([]);
  });
});
