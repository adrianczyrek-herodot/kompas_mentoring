import { Temporal } from 'temporal-polyfill';
import { err, ok, type Result } from '../../../../shared/domain/index.ts';
import type { AvailabilityException, AvailabilityExceptionKind } from '../availability.entity.ts';
import type { AvailabilityIssue, InvalidAvailability } from '../booking.errors.ts';
import { AVAILABILITY } from './config.ts';

export interface ExceptionInput {
  readonly startsAt: Temporal.Instant;
  readonly endsAt: Temporal.Instant;
  readonly kind: AvailabilityExceptionKind;
}

export interface InstantRange {
  readonly startsAt: Temporal.Instant;
  readonly endsAt: Temporal.Instant;
}

/** Half-open overlap: `[a.start, a.end)` vs `[b.start, b.end)`. */
export const overlapsInstantRange = (a: InstantRange, b: InstantRange): boolean =>
  Temporal.Instant.compare(a.startsAt, b.endsAt) < 0 &&
  Temporal.Instant.compare(b.startsAt, a.endsAt) < 0;

const exceptionMinutes = (input: InstantRange): number =>
  input.startsAt.until(input.endsAt).total({ unit: 'minute' });

/**
 * M3 exceptions (spec "Dostępność"): at least 30 min, in the future, inside the booking horizon
 * (Q10), and no two exceptions of the same kind overlap. `off` and `extra` may overlap each other
 * (extra hours carved out of a day off).
 */
export const validateException = (
  input: ExceptionInput,
  context: {
    readonly now: Temporal.Instant;
    readonly horizonEnd: Temporal.Instant;
    readonly existing: readonly AvailabilityException[];
  },
): Result<void, InvalidAvailability> => {
  const issues: AvailabilityIssue[] = [];
  if (Temporal.Instant.compare(input.endsAt, input.startsAt) <= 0) {
    issues.push({ field: 'endsAt', problem: 'reversed' });
  } else {
    if (exceptionMinutes(input) < AVAILABILITY.exceptionMinMinutes) {
      issues.push({ field: 'endsAt', problem: 'too_short' });
    }
    if (Temporal.Instant.compare(input.startsAt, context.now) < 0) {
      issues.push({ field: 'startsAt', problem: 'in_the_past' });
    }
    if (Temporal.Instant.compare(input.endsAt, context.horizonEnd) > 0) {
      issues.push({ field: 'endsAt', problem: 'out_of_range' });
    }
    const clash = context.existing.some(
      (exception) => exception.kind === input.kind && overlapsInstantRange(input, exception),
    );
    if (clash) issues.push({ field: 'startsAt', problem: 'overlap' });
  }
  return issues.length === 0
    ? ok(undefined)
    : err({ code: 'scheduling.invalid_availability', issues });
};
