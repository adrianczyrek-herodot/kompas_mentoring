import { type Money, money } from '../../../../shared/domain/index.ts';
import type { FieldProblem } from '../catalog.errors.ts';
import { LIMITS } from './config.ts';

/** Q9: 40–1000 zł per 60 minutes, whole złoty only. `null` when the rate is acceptable. */
export const rateProblem = (rate60: Money): FieldProblem | null => {
  const { min, max, step } = LIMITS.rate60;
  if (rate60.amount < min || rate60.amount > max) return 'out_of_range';
  return rate60.amount % step === 0n ? null : 'not_whole_zloty';
};

/** 30 minutes cost half of the hourly rate, rounded down to the grosz (`money.allocate`). */
export const halfHourRate = (rate60: Money): Money => {
  const [, lower] = money.allocate(rate60, [1n, 1n]);
  return lower ?? money.zero(rate60.currency);
};
