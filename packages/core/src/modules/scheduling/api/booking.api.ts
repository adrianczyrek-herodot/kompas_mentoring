import type { BookingView, CheckoutView } from '@kompas/contracts/scheduling';
import { money } from '../../../shared/domain/index.ts';
import type { CheckoutResult } from '../application/checkout.command.ts';
import type { Booking } from '../domain/booking.entity.ts';

/** Domain booking → the JSON U1–U3 render (requirement 20). */
export const toBookingView = (booking: Booking): BookingView => ({
  id: booking.id,
  mentorId: booking.mentorId,
  studentId: booking.studentId,
  type: booking.type,
  status: booking.status,
  startsAt: booking.startsAt.toString(),
  endsAt: booking.endsAt.toString(),
  goal: booking.goal,
  price:
    booking.price === null
      ? null
      : { amountMinorUnits: money.toMinorUnits(booking.price), currency: booking.price.currency },
  paymentMode: booking.paymentMode,
  acceptDeadlineAt: booking.acceptDeadlineAt?.toString() ?? null,
  rescheduleCount: booking.rescheduleCount,
});

/** Q1: F3 maps to `confirmed`; the union already carries `payment_required` for F4. */
export const toCheckoutView = (result: CheckoutResult): CheckoutView =>
  result.kind === 'confirmed'
    ? { kind: 'confirmed', booking: toBookingView(result.booking) }
    : { kind: 'payment_required', clientSecret: result.clientSecret };
