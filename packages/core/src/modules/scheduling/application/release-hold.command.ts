import type { BookingId, Clock } from '../../../shared/domain/index.ts';
import { err, ok, type Result, StudentId } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { Booking } from '../domain/booking.entity.ts';
import type { BookingError } from '../domain/booking.errors.ts';
import type { BookingRepository } from './ports.ts';
import { requirePermission } from './ports.ts';

type Deps = { clock: Clock; bookingRepository: BookingRepository };

/** `DELETE /bookings/holds/{id}` (U2 „Zmień termin”): frees the student's own hold (Q18). */
export const makeReleaseHold =
  (deps: Deps) =>
  async (actor: CurrentUser, holdId: BookingId): Promise<Result<Booking, BookingError>> => {
    const permission = requirePermission(actor, 'scheduling.booking.create');
    if (permission.isErr()) return err(permission.error);
    const booking = await deps.bookingRepository.releaseHold(
      StudentId.parse(actor.id),
      holdId,
      deps.clock.now(),
    );
    return booking === null ? err({ code: 'scheduling.not_found' }) : ok(booking);
  };

export type ReleaseHold = ReturnType<typeof makeReleaseHold>;
