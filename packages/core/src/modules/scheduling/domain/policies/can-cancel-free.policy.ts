import { Temporal } from 'temporal-polyfill';
import type { Booking } from '../booking.entity.ts';
import { FREE_CANCELLATION_NOTICE } from './config.ts';

/** Last instant at which cancelling is still free (Z4). Exact time, so DST changes do not shift it. */
export const freeCancellationDeadline = (booking: Pick<Booking, 'startsAt'>): Temporal.Instant =>
  booking.startsAt.subtract(FREE_CANCELLATION_NOTICE);

/**
 * Z4: cancellation is free when at least 12 h remain until the start (mockup `canCancelFree`).
 * Whether the booking may be cancelled at all is decided by the state machine.
 */
export const canCancelFree = (booking: Pick<Booking, 'startsAt'>, now: Temporal.Instant): boolean =>
  Temporal.Instant.compare(now, freeCancellationDeadline(booking)) <= 0;
