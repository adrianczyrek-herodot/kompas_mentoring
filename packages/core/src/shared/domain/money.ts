import { dinero, allocate as dineroAllocate, PLN, toSnapshot } from 'dinero.js/bigint';

export type Currency = 'PLN';

/** Money in minor units (grosze) as bigint — never floats (spec §3, §6.3). */
export type Money = Readonly<{ amount: bigint; currency: Currency }>;

const CURRENCIES = { PLN } as const;

export const of = (amount: bigint, currency: Currency = 'PLN'): Money => ({ amount, currency });

export const zero = (currency: Currency = 'PLN'): Money => of(0n, currency);

// MVP has a single currency, so the `Currency` type already guarantees matching currencies.
// Add a runtime currency check here when `Currency` gets a second member.
export const add = (a: Money, b: Money): Money => of(a.amount + b.amount, a.currency);

export const subtract = (a: Money, b: Money): Money => of(a.amount - b.amount, a.currency);

export const equals = (a: Money, b: Money): boolean => a.amount === b.amount;

export const isNegative = (m: Money): boolean => m.amount < 0n;

/**
 * Splits money by ratios without losing a grosz (e.g. commission vs mentor share).
 * The remainder grosz is distributed by Dinero's `allocate` (larger ratios first).
 */
export const allocate = (m: Money, ratios: readonly bigint[]): Money[] =>
  dineroAllocate(dinero({ amount: m.amount, currency: CURRENCIES[m.currency] }), [...ratios]).map(
    (part) => of(toSnapshot(part).amount, m.currency),
  );

/** Converts to an integer number of grosze for the API contract (spec §5). */
export const toMinorUnits = (m: Money): number => {
  const value = Number(m.amount);
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`Amount ${m.amount} grosze exceeds the safe integer range`);
  }
  return value;
};
