import type { BookingId } from '../../../shared/domain/index.ts';

/** Domain events: past tense, versioned names (spec §4.7). Payloads carry IDs, not personal data. */
export interface BookingCancelledV1 {
  readonly name: 'booking.cancelled.v1';
  readonly bookingId: BookingId;
  readonly isFree: boolean;
}

export type BookingDomainEvent = BookingCancelledV1;
