import type { Temporal } from 'temporal-polyfill';
import { err, ok, type Result } from '../../../../shared/domain/index.ts';
import type { AvailabilityRule, Weekday } from '../availability.entity.ts';
import type {
  AvailabilityIssue,
  AvailabilityProblem,
  InvalidAvailability,
} from '../booking.errors.ts';
import { AVAILABILITY } from './config.ts';

const { minRuleMinutes, gridMinutes } = AVAILABILITY;

/** Minutes since midnight; the grid rule keeps every boundary at a whole 30-min step. */
export const minutesOfDay = (time: Temporal.PlainTime): number => time.hour * 60 + time.minute;

const isOnGrid = (time: Temporal.PlainTime): boolean =>
  minutesOfDay(time) % gridMinutes === 0 &&
  time.second === 0 &&
  time.millisecond === 0 &&
  time.microsecond === 0 &&
  time.nanosecond === 0;

const issue = (field: string, problem: AvailabilityProblem): AvailabilityIssue => ({
  field,
  problem,
});

/**
 * M3 template rules (spec "Dostępność"): intervals of one weekday may not overlap, each lasts
 * at least 30 min, every boundary sits on the 30-min grid, `end > start` (a midnight interval is
 * entered as two rules). An interval with an unknown/missing value is `too_short`/`reversed`.
 */
export const validateTemplate = (
  rules: readonly AvailabilityRule[],
): Result<void, InvalidAvailability> => {
  const issues = [...rules.flatMap(ruleIssues), ...overlapIssues(rules)];
  return issues.length === 0
    ? ok(undefined)
    : err({ code: 'scheduling.invalid_availability', issues });
};

/** Rules of a single interval: `end > start`, at least 30 min, both ends on the 30-min grid. */
const ruleIssues = (rule: AvailabilityRule, index: number): AvailabilityIssue[] => {
  const field = `rules.${index}`;
  const start = minutesOfDay(rule.startLocal);
  const end = minutesOfDay(rule.endLocal);
  if (end <= start) return [issue(`${field}.endLocal`, 'reversed')];
  // A short interval is reported as such, not as a grid miss on top of it.
  if (end - start < minRuleMinutes) return [issue(`${field}.endLocal`, 'too_short')];
  const issues: AvailabilityIssue[] = [];
  if (!isOnGrid(rule.startLocal)) issues.push(issue(`${field}.startLocal`, 'not_on_grid'));
  if (!isOnGrid(rule.endLocal)) issues.push(issue(`${field}.endLocal`, 'not_on_grid'));
  return issues;
};

/** Overlap is a property of a whole weekday: sort its intervals and compare neighbours. */
const overlapIssues = (rules: readonly AvailabilityRule[]): AvailabilityIssue[] => {
  const byWeekday = new Map<Weekday, { start: number; end: number; index: number }[]>();
  for (const [index, rule] of rules.entries()) {
    const start = minutesOfDay(rule.startLocal);
    const end = minutesOfDay(rule.endLocal);
    if (end <= start) continue; // already reported as `reversed`
    const list = byWeekday.get(rule.weekday) ?? [];
    list.push({ start, end, index });
    byWeekday.set(rule.weekday, list);
  }
  const issues: AvailabilityIssue[] = [];
  for (const list of byWeekday.values()) {
    const sorted = [...list].sort((a, b) => a.start - b.start);
    for (let i = 1; i < sorted.length; i += 1) {
      const previous = sorted[i - 1];
      const current = sorted[i];
      if (previous !== undefined && current !== undefined && current.start < previous.end) {
        issues.push(issue(`rules.${current.index}`, 'overlap'));
      }
    }
  }
  return issues;
};

/** M1/F2 rule: the weekly template must offer at least 3 h to submit the application. */
export const weeklyAvailabilityMinutes = (rules: readonly AvailabilityRule[]): number =>
  rules.reduce((total, rule) => {
    const span = minutesOfDay(rule.endLocal) - minutesOfDay(rule.startLocal);
    return total + (span > 0 ? span : 0);
  }, 0);

/** True once the template reaches the 3 h needed by the M1 application (F2 requirement 2). */
export const hasMinimumWeeklyAvailability = (rules: readonly AvailabilityRule[]): boolean =>
  weeklyAvailabilityMinutes(rules) >= AVAILABILITY.weeklyMinimumMinutes;

/** Turns a template into the plain shape the calendar query and the contract share. */
export const sortTemplate = (rules: readonly AvailabilityRule[]): AvailabilityRule[] =>
  [...rules].sort(
    (a, b) => a.weekday - b.weekday || minutesOfDay(a.startLocal) - minutesOfDay(b.startLocal),
  );
