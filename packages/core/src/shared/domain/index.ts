export type { Clock } from './clock.ts';
export { BookingId, MentorId, newId, StudentId, UserId } from './ids.ts';
export type { Currency, Money } from './money.ts';
/** Money operations: `money.of(14_900n)`, `money.add(a, b)`, `money.allocate(m, [15n, 85n])`. */
export * as money from './money.ts';
export type { DomainError, Err, Ok } from './result.ts';
export { err, errAsync, ok, okAsync, Result, ResultAsync } from './result.ts';
