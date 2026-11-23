import type { BookingId } from '../../../shared/domain/index.ts';
import { err, ok, type Result } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { Booking } from '../domain/booking.entity.ts';
import type { BookingError } from '../domain/booking.errors.ts';
import type { BookingRepository } from './ports.ts';

/** Participant of a booking: the student or the mentor — nobody else may read it (spec §8). */
const isParticipant = (actor: CurrentUser, booking: Booking): boolean =>
  String(actor.id) === String(booking.studentId) || String(actor.id) === String(booking.mentorId);

type Deps = { bookingRepository: BookingRepository };

/**
 * `GET /bookings/{id}` (U3): the booking of one student or mentor. A foreign or unknown booking is
 * one 404, so the caller cannot tell existence (spec §8).
 */
export const makeGetBooking =
  (deps: Deps) =>
  async (actor: CurrentUser, bookingId: BookingId): Promise<Result<Booking, BookingError>> => {
    const booking = await deps.bookingRepository.findById(bookingId);
    if (booking === null || !isParticipant(actor, booking)) {
      return err({ code: 'scheduling.not_found' });
    }
    return ok(booking);
  };

export type GetBooking = ReturnType<typeof makeGetBooking>;
