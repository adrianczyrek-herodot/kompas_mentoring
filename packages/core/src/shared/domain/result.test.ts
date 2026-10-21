import { describe, expect, it } from 'vitest';
import { type DomainError, err, ok, type Result } from './result.ts';

type DivisionError = DomainError<'math.division_by_zero'>;

const divide = (a: number, b: number): Result<number, DivisionError> =>
  b === 0 ? err({ code: 'math.division_by_zero' }) : ok(a / b);

describe('Result', () => {
  it('carries expected failures as values with a code', () => {
    expect(divide(6, 3)._unsafeUnwrap()).toBe(2);
    expect(divide(1, 0)._unsafeUnwrapErr()).toEqual({ code: 'math.division_by_zero' });
  });

  it('composes with map and match', () => {
    const label = divide(10, 4)
      .map((value) => value * 2)
      .match(
        (value) => `ok:${value}`,
        (error) => `err:${error.code}`,
      );
    expect(label).toBe('ok:5');
  });
});
