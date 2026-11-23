import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import type { AvailabilityException, AvailabilityRule } from '../availability.entity.ts';
import { validateException } from './availability-exception.policy.ts';
import {
  hasMinimumWeeklyAvailability,
  minutesOfDay,
  sortTemplate,
  validateTemplate,
  weeklyAvailabilityMinutes,
} from './availability-template.policy.ts';
import { validateMentorSettings } from './mentor-schedule.policy.ts';

const time = (value: string): Temporal.PlainTime => Temporal.PlainTime.from(value);
const instant = (value: string): Temporal.Instant => Temporal.Instant.from(value);
const rule = (
  weekday: AvailabilityRule['weekday'],
  start: string,
  end: string,
): AvailabilityRule => ({
  weekday,
  startLocal: time(start),
  endLocal: time(end),
});

const problems = (input: readonly AvailabilityRule[]): string[] => {
  const result = validateTemplate(input);
  return result.isErr()
    ? result.error.issues.map((issue) => `${issue.field}:${issue.problem}`)
    : [];
};

describe('availability template policy (M3)', () => {
  it('accepts a clean grid template', () => {
    expect(validateTemplate([rule(1, '09:00', '12:00'), rule(1, '13:00', '15:30')]).isOk()).toBe(
      true,
    );
  });

  it('rejects intervals shorter than 30 min, accepts exactly 30', () => {
    expect(problems([rule(2, '18:00', '18:29')])).toEqual(['rules.0.endLocal:too_short']);
    expect(validateTemplate([rule(2, '18:00', '18:30')]).isOk()).toBe(true);
  });

  it('rejects boundaries off the 30-min grid', () => {
    expect(problems([rule(2, '18:15', '19:00')])).toEqual(['rules.0.startLocal:not_on_grid']);
    expect(problems([rule(2, '18:00', '19:15')])).toEqual(['rules.0.endLocal:not_on_grid']);
  });

  it('rejects overlapping intervals of the same weekday, allows touching ones', () => {
    expect(problems([rule(1, '09:00', '12:00'), rule(1, '11:30', '13:00')])).toEqual([
      'rules.1:overlap',
    ]);
    expect(validateTemplate([rule(1, '09:00', '12:00'), rule(1, '12:00', '13:00')]).isOk()).toBe(
      true,
    );
  });

  it('allows the same hours on different weekdays', () => {
    expect(validateTemplate([rule(1, '09:00', '12:00'), rule(3, '09:00', '12:00')]).isOk()).toBe(
      true,
    );
  });

  it('rejects a midnight interval with a reversible hint (two rules instead)', () => {
    expect(problems([rule(5, '23:00', '01:00')])).toEqual(['rules.0.endLocal:reversed']);
  });

  it('sums the weekly template', () => {
    expect(weeklyAvailabilityMinutes([rule(1, '09:00', '12:00'), rule(2, '18:00', '20:00')])).toBe(
      300,
    );
  });

  it('requires 3 h to submit M1 (2 h 59 min / 3 h boundary)', () => {
    const short = [rule(1, '09:00', '11:59')];
    const enough = [rule(1, '09:00', '12:00')];
    expect(weeklyAvailabilityMinutes(short)).toBe(179);
    expect(hasMinimumWeeklyAvailability(short)).toBe(false);
    expect(weeklyAvailabilityMinutes(enough)).toBe(180);
    expect(hasMinimumWeeklyAvailability(enough)).toBe(true);
  });

  it('sorts the template by weekday then start', () => {
    expect(
      sortTemplate([
        rule(3, '10:00', '11:00'),
        rule(1, '14:00', '15:00'),
        rule(1, '09:00', '10:00'),
      ]),
    ).toEqual([rule(1, '09:00', '10:00'), rule(1, '14:00', '15:00'), rule(3, '10:00', '11:00')]);
  });

  it('counts minutes from midnight', () => {
    expect(minutesOfDay(time('18:30'))).toBe(1_110);
  });
});

describe('mentor settings policy (M3, Q9)', () => {
  const settings = (minNoticeMinutes: number, bufferMinutes: number) => ({
    timeZone: 'Europe/Warsaw',
    minNoticeMinutes,
    bufferMinutes,
  });

  it.each([
    [119, false],
    [120, true],
    [2_880, true],
    [2_881, false],
    [360, true],
  ])('notice %i min → accepted %s', (minutes, accepted) => {
    expect(validateMentorSettings(settings(minutes, 0)).isOk()).toBe(accepted);
  });

  it.each([
    [0, true],
    [30, true],
    [31, false],
  ])('buffer %i min → accepted %s', (minutes, accepted) => {
    expect(validateMentorSettings(settings(360, minutes)).isOk()).toBe(accepted);
  });

  it('rejects a notice or buffer value off the step', () => {
    expect(validateMentorSettings(settings(361, 0)).isOk()).toBe(false);
    expect(validateMentorSettings(settings(360, 7)).isOk()).toBe(false);
  });

  it('rejects an unknown IANA time zone', () => {
    expect(validateMentorSettings({ ...settings(360, 0), timeZone: 'Mars/Olympus' }).isOk()).toBe(
      false,
    );
  });
});

describe('availability exception policy (M3, Q10)', () => {
  const now = instant('2026-11-23T10:00:00Z');
  const horizonEnd = now.add({ hours: 56 * 24 });
  const existing: AvailabilityException[] = [
    {
      id: 'e1',
      startsAt: instant('2026-12-24T00:00:00Z'),
      endsAt: instant('2026-12-25T00:00:00Z'),
      kind: 'off',
      note: null,
    },
  ];

  const check = (
    startsAt: string,
    endsAt: string,
    kind: AvailabilityException['kind'],
    list: readonly AvailabilityException[] = existing,
  ) =>
    validateException(
      { startsAt: instant(startsAt), endsAt: instant(endsAt), kind },
      { now, horizonEnd, existing: list },
    );

  it('accepts a valid off exception and an extra overlapping it', () => {
    expect(check('2026-12-26T00:00:00Z', '2026-12-26T06:00:00Z', 'off').isOk()).toBe(true);
    expect(check('2026-12-24T06:00:00Z', '2026-12-24T08:00:00Z', 'extra').isOk()).toBe(true);
  });

  it('rejects an exception shorter than 30 min or reversed', () => {
    expect(check('2026-12-26T00:00:00Z', '2026-12-26T00:20:00Z', 'off').isOk()).toBe(false);
    expect(check('2026-12-26T06:00:00Z', '2026-12-26T00:00:00Z', 'off').isOk()).toBe(false);
  });

  it('rejects an exception in the past', () => {
    expect(check('2026-11-20T00:00:00Z', '2026-11-20T06:00:00Z', 'off').isOk()).toBe(false);
  });

  it('rejects an exception beyond the 8-week horizon', () => {
    expect(check('2027-02-01T00:00:00Z', '2027-02-01T06:00:00Z', 'off').isOk()).toBe(false);
  });

  it('rejects two overlapping exceptions of the same kind', () => {
    expect(check('2026-12-24T12:00:00Z', '2026-12-24T14:00:00Z', 'off').isOk()).toBe(false);
  });
});
