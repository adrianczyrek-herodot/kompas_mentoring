// Expected domain failures are values, not exceptions (spec §4.9).

export type { Err, Ok } from 'neverthrow';
export { err, errAsync, ok, okAsync, Result, ResultAsync } from 'neverthrow';

/** Every domain error is a discriminated union member with a namespaced `code`, e.g. `booking.slot_taken`. */
export interface DomainError<Code extends string = string> {
  readonly code: Code;
}
