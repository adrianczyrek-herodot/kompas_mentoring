// Public API of the scheduling module — the only file other modules and apps may import.
export type {
  CancellationTerms,
  GetCancellationTerms,
} from './application/get-cancellation-terms.query.ts';
export type { SchedulingCradle } from './di.ts';
export type { Booking, BookingType } from './domain/booking.entity.ts';
export type { BookingError } from './domain/booking.errors.ts';
export type { BookingCancelledV1, BookingDomainEvent } from './domain/booking.events.ts';
export type { BookingEvent, BookingStatus } from './domain/booking.state.ts';
