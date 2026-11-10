import type { InvalidBookingTransition } from './booking.state.ts';

/** Every expected scheduling failure; mapped to RFC 9457 problems at the API edge (spec §4.9). */
export type BookingError = InvalidBookingTransition;
