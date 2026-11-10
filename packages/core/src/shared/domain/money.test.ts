import { describe, expect, it } from 'vitest';
import { add, allocate, equals, isNegative, of, subtract, toMinorUnits, zero } from './money.ts';

describe('Money', () => {
  it('adds and subtracts in grosze', () => {
    expect(add(of(14_900n), of(100n))).toEqual(of(15_000n));
    expect(subtract(of(100n), of(250n))).toEqual(of(-150n));
    expect(isNegative(subtract(of(100n), of(250n)))).toBe(true);
    expect(equals(zero(), of(0n))).toBe(true);
  });

  it('allocates without losing a grosz', () => {
    // 100.01 zł split 15% commission / 85% mentor share.
    const parts = allocate(of(10_001n), [15n, 85n]);
    expect(parts).toEqual([of(1_500n), of(8_501n)]);
    expect(parts.reduce(add, zero())).toEqual(of(10_001n));
  });

  it('converts to a safe integer for the API contract', () => {
    expect(toMinorUnits(of(14_900n))).toBe(14_900);
    expect(() => toMinorUnits(of(2n ** 60n))).toThrow(RangeError);
  });
});
