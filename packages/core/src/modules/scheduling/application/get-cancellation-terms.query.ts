import type { Temporal } from 'temporal-polyfill';
import type { Clock } from '../../../shared/domain/index.ts';
import type { Booking } from '../domain/booking.entity.ts';
import {
  canCancelFree,
  freeCancellationDeadline,
} from '../domain/policies/can-cancel-free.policy.ts';

export interface CancellationTerms {
  readonly isFree: boolean;
  readonly freeUntil: Temporal.Instant;
}

/** Query factory: dependencies come from the container (spec §6.4), time from the Clock port. */
export const makeGetCancellationTerms =
  ({ clock }: { clock: Clock }) =>
  (booking: Pick<Booking, 'startsAt'>): CancellationTerms => ({
    isFree: canCancelFree(booking, clock.now()),
    freeUntil: freeCancellationDeadline(booking),
  });

export type GetCancellationTerms = ReturnType<typeof makeGetCancellationTerms>;
