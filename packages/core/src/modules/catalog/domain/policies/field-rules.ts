import type { FieldIssue, FieldProblem } from '../catalog.errors.ts';

/**
 * `draft`: a step save — empty fields are fine, invalid ones are not (spec: partial schema).
 * `complete`: the step counts as done — every required field is present and lists reach their minimum.
 */
export type StepMode = 'draft' | 'complete';

/** Collects field issues while a step is checked, so the mentor sees every problem at once. */
export class IssueCollector {
  readonly issues: FieldIssue[] = [];

  add(field: string, problem: FieldProblem): void {
    this.issues.push({ field, problem });
  }

  get isEmpty(): boolean {
    return this.issues.length === 0;
  }
}

interface Range {
  readonly min: number;
  readonly max: number;
}

/** Trims and collapses inner spaces of single-line text; `null` for empty input. */
export const cleanLine = (value: string | null | undefined): string | null => {
  const cleaned = (value ?? '').replace(/\s+/g, ' ').trim();
  return cleaned === '' ? null : cleaned;
};

/** Trims multi-line text (paragraphs stay) and normalises line endings; `null` for empty input. */
export const cleanText = (value: string | null | undefined): string | null => {
  const cleaned = (value ?? '').replace(/\r\n?/g, '\n').trim();
  return cleaned === '' ? null : cleaned;
};

/** Length in code points, so Polish letters and emoji count once (UTF-16 `length` would not). */
export const charLength = (value: string): number => Array.from(value).length;

/** Checks text length in characters (code points, so emoji and Polish letters count once). */
export const checkText = (
  issues: IssueCollector,
  field: string,
  value: string | null,
  range: Range,
  mode: StepMode,
): string | null => {
  if (value === null) {
    if (mode === 'complete') issues.add(field, 'required');
    return null;
  }
  const length = charLength(value);
  if (length < range.min) issues.add(field, 'too_short');
  else if (length > range.max) issues.add(field, 'too_long');
  return value;
};

/** Upper bounds always apply; lower bounds only when the step must be complete. */
export const checkCount = (
  issues: IssueCollector,
  field: string,
  count: number,
  range: { readonly min?: number; readonly max: number },
  mode: StepMode,
): void => {
  if (count > range.max) {
    issues.add(field, 'too_many');
    return;
  }
  const min = range.min ?? 0;
  if (mode === 'complete' && count < min) issues.add(field, count === 0 ? 'required' : 'too_few');
};

/** Whole number within the range; `null` is allowed in drafts and required in complete steps. */
export const checkWholeNumber = (
  issues: IssueCollector,
  field: string,
  value: number | null,
  range: Range,
  mode: StepMode,
): number | null => {
  if (value === null) {
    if (mode === 'complete') issues.add(field, 'required');
    return null;
  }
  if (!Number.isInteger(value) || value < range.min || value > range.max) {
    issues.add(field, 'out_of_range');
  }
  return value;
};

/** Drops repeats while keeping the first occurrence (order matters for display). */
export const uniqueBy = <T>(values: readonly T[], key: (value: T) => string): T[] => {
  const seen = new Set<string>();
  return values.filter((value) => {
    const k = key(value);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/** Every value must come from the closed list; unknown values are reported once per field. */
export const checkOptions = (
  issues: IssueCollector,
  field: string,
  values: readonly string[],
  allowed: readonly string[],
): void => {
  if (values.some((value) => !allowed.includes(value))) issues.add(field, 'unknown_option');
};
