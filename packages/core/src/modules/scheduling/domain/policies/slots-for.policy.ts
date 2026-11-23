import { Temporal } from 'temporal-polyfill';
import type { AvailabilityException, AvailabilityRule } from '../availability.entity.ts';
import { AVAILABILITY } from './config.ts';

/** Half-open interval of real time: `[start, end)`. */
export interface Interval {
  readonly start: Temporal.Instant;
  readonly end: Temporal.Instant;
}

/** Everything the slot engine needs; it is pure, so no clock, repository or logger enters. */
export interface SlotsForInput {
  readonly rules: readonly AvailabilityRule[];
  readonly exceptions: readonly AvailabilityException[];
  /** Time that cannot be booked: sessions (with their buffer snapshot) and external busy time. */
  readonly busy: readonly Interval[];
  /** IANA zone of the mentor — the weekly template is wall-clock time in this zone. */
  readonly timeZone: string;
  /** Q9 notice and M3 buffer, both resolved by the caller. */
  readonly settings: {
    readonly minNotice: Temporal.Duration;
    readonly buffer: Temporal.Duration;
  };
  /** Session length: 30 or 60 min (Q2). */
  readonly duration: Temporal.Duration;
  /** Window of the answer: a slot starts at or after `from` and ends at or before `to`. */
  readonly range: {
    readonly from: Temporal.Instant;
    readonly to: Temporal.Instant;
  };
  /** Q10: the last bookable instant is `now + horizon`. */
  readonly horizon: Temporal.Duration;
  readonly now: Temporal.Instant;
}

/** Windows of real time the mentor is available in, after the `off`/`extra` exceptions. */
export type AvailabilityWindowsInput = Pick<
  SlotsForInput,
  'rules' | 'exceptions' | 'timeZone' | 'range'
>;

const SLOT_STEP = { minutes: AVAILABILITY.gridMinutes };

const isBefore = (a: Temporal.Instant, b: Temporal.Instant): boolean =>
  Temporal.Instant.compare(a, b) < 0;
const isAfter = (a: Temporal.Instant, b: Temporal.Instant): boolean =>
  Temporal.Instant.compare(a, b) > 0;
const isAtOrAfter = (a: Temporal.Instant, b: Temporal.Instant): boolean =>
  Temporal.Instant.compare(a, b) >= 0;
const isAtOrBefore = (a: Temporal.Instant, b: Temporal.Instant): boolean =>
  Temporal.Instant.compare(a, b) <= 0;

/**
 * One rule of the template on one local date, as instants. `PlainDate.toZonedDateTime` resolves
 * wall-clock times with the "compatible" disambiguation (spec "Silnik slotów"): a spring-forward gap
 * moves later, an autumn overlap takes the earlier occurrence — so a rule always maps onto real
 * time. (`PlainTime.toZonedDateTime` is not implemented by `temporal-polyfill` 1.x.)
 */
const ruleWindow = (
  rule: AvailabilityRule,
  date: Temporal.PlainDate,
  timeZone: string,
): Interval | null => {
  const at = (plainTime: Temporal.PlainTime): Temporal.Instant =>
    date.toZonedDateTime({ timeZone, plainTime }).toInstant();
  const start = at(rule.startLocal);
  const end = at(rule.endLocal);
  return isBefore(start, end) ? { start, end } : null;
};

/** Local dates the range touches, widened by one day so a rule never loses its evening edge. */
const localDates = (
  range: AvailabilityWindowsInput['range'],
  timeZone: string,
): Temporal.PlainDate[] => {
  const first = range.from.toZonedDateTimeISO(timeZone).toPlainDate().subtract({ days: 1 });
  const last = range.to.toZonedDateTimeISO(timeZone).toPlainDate().add({ days: 1 });
  const dates: Temporal.PlainDate[] = [];
  for (let date = first; isAtOrBeforeDate(date, last); date = date.add({ days: 1 })) {
    dates.push(date);
  }
  return dates;
};

const isAtOrBeforeDate = (a: Temporal.PlainDate, b: Temporal.PlainDate): boolean =>
  Temporal.PlainDate.compare(a, b) <= 0;

/** Sorted, coalesced intervals — overlapping windows become one, so slots are never duplicated. */
const mergeIntervals = (intervals: readonly Interval[]): Interval[] => {
  const sorted = [...intervals].sort((a, b) => Temporal.Instant.compare(a.start, b.start));
  const merged: Interval[] = [];
  for (const interval of sorted) {
    const last = merged.at(-1);
    if (last !== undefined && isAtOrBefore(interval.start, last.end)) {
      if (isAfter(interval.end, last.end))
        merged[merged.length - 1] = { start: last.start, end: interval.end };
    } else {
      merged.push(interval);
    }
  }
  return merged;
};

/** `window` minus `blocker`, as zero, one or two remaining intervals. */
const subtractInterval = (window: Interval, blocker: Interval): Interval[] => {
  if (isAtOrBefore(blocker.end, window.start) || isAtOrAfter(blocker.start, window.end)) {
    return [window];
  }
  const parts: Interval[] = [];
  if (isBefore(window.start, blocker.start))
    parts.push({ start: window.start, end: blocker.start });
  if (isBefore(blocker.end, window.end)) parts.push({ start: blocker.end, end: window.end });
  return parts;
};

/**
 * Availability of the mentor in real time: the weekly template resolved in the mentor's zone (one
 * window per matching weekday), plus `extra` exceptions, minus `off` exceptions. DST is handled by
 * the zone, never by adding 24 h — a spring-forward day simply has one hour less to offer.
 */
export const availabilityWindows = (input: AvailabilityWindowsInput): Interval[] => {
  const windows: Interval[] = [];
  for (const date of localDates(input.range, input.timeZone)) {
    for (const rule of input.rules) {
      if (rule.weekday !== date.dayOfWeek) continue;
      const window = ruleWindow(rule, date, input.timeZone);
      if (window !== null) windows.push(window);
    }
  }
  const extra = input.exceptions.filter((exception) => exception.kind === 'extra');
  for (const exception of extra) {
    if (isBefore(exception.startsAt, exception.endsAt)) {
      windows.push({ start: exception.startsAt, end: exception.endsAt });
    }
  }
  const off = mergeIntervals(
    input.exceptions
      .filter((exception) => exception.kind === 'off')
      .map((exception) => ({ start: exception.startsAt, end: exception.endsAt }))
      .filter((interval) => isBefore(interval.start, interval.end)),
  );
  const available = mergeIntervals(windows);
  return off.reduce(
    (remaining, blocker) => remaining.flatMap((window) => subtractInterval(window, blocker)),
    available,
  );
};

/** A session of `duration` plus the mentor's buffer must not touch busy time (M3, Q11). */
const blockedByBusy = (
  start: Temporal.Instant,
  end: Temporal.Instant,
  buffer: Temporal.Duration,
  busy: readonly Interval[],
): boolean => {
  const protectedEnd = end.add(buffer);
  return busy.some(
    (interval) => isBefore(start, interval.end) && isBefore(interval.start, protectedEnd),
  );
};

/**
 * Bookable session starts (spec §4.1, §4.10; `slotsFor` in the F3 spec "Silnik slotów").
 *
 * Pure: the viewing time zone never enters here — the answer is instants and the UI formats them.
 * Slots advance by 30 min **on the instant axis** from the start of each availability window, so a
 * DST change never shifts the grid. A slot is dropped when it does not fit in the window, when it
 * ends outside `range`, when it starts before `now + minNotice` or after `now + horizon`, or when
 * it (plus the buffer) overlaps `busy`.
 */
export const slotsFor = (input: SlotsForInput): Temporal.Instant[] => {
  if (!isBefore(input.range.from, input.range.to)) return [];
  const windows = availabilityWindows(input);
  const earliest = input.now.add(input.settings.minNotice);
  const latest = input.now.add(input.horizon);
  const found: Temporal.Instant[] = [];
  for (const window of windows) {
    for (let start = window.start; ; start = start.add(SLOT_STEP)) {
      const end = start.add(input.duration);
      if (isAfter(end, window.end)) break;
      const bookable =
        isAtOrAfter(start, input.range.from) &&
        isAtOrBefore(end, input.range.to) &&
        isAtOrAfter(start, earliest) &&
        isAtOrBefore(start, latest) &&
        !blockedByBusy(start, end, input.settings.buffer, input.busy);
      if (bookable) found.push(start);
    }
  }
  // Windows are sorted, yet exceptions may interleave them — sort and drop duplicates for good.
  return [...new Set(found)].sort((a, b) => Temporal.Instant.compare(a, b));
};
