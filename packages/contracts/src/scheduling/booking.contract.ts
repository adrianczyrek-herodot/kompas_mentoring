import { oc } from '@orpc/contract';
import { z } from 'zod';
import { SCHEDULING_LIMITS as L } from './limits.ts';

// Booking flow of U1 (hold), U2 (checkout) and U3 (status) — requirement 20. Problem codes in the
// responses are the domain codes (`scheduling.*`), like the availability routes.

/** The full `Booking` state machine (spec stacku §4.3); the client only renders it. */
export const BookingStatusView = z.enum([
  'hold',
  'pending_payment',
  'requested',
  'scheduled',
  'in_progress',
  'completed',
  'late_cancelled',
  'no_show_student',
  'no_show_mentor',
  'disputed',
  'cancelled',
  'expired',
  'settled',
  'refunded',
]);
export type BookingStatusView = z.infer<typeof BookingStatusView>;

export const BookingTypeView = z.enum(['trial', 'plan', 'single']);
export type BookingTypeView = z.infer<typeof BookingTypeView>;

export const BookingPaymentModeView = z.enum(['none', 'stripe']);

/** One booking as the UI needs it (no personal data beyond the IDs). */
export const BookingView = z.object({
  id: z.uuid(),
  mentorId: z.uuid(),
  studentId: z.uuid(),
  type: BookingTypeView,
  status: BookingStatusView,
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  goal: z.string().nullable(),
  price: z
    .object({ amountMinorUnits: z.number().int().min(0), currency: z.literal('PLN') })
    .nullable(),
  paymentMode: BookingPaymentModeView.nullable(),
  /** Q14: the mentor's answer deadline of a trial request. */
  acceptDeadlineAt: z.iso.datetime({ offset: true }).nullable(),
  rescheduleCount: z.number().int(),
});
export type BookingView = z.infer<typeof BookingView>;

/** U1 „Dalej”: the mentor profile, the slot and the kind; a trial is always 30 min (Q2). */
export const CreateHoldInput = z.object({
  mentorProfileId: z.uuid(),
  startsAt: z.iso.datetime({ offset: true }),
  durationMinutes: z.union([z.literal(30), z.literal(60)]).optional(),
  type: z.enum(['trial', 'plan']),
});
export type CreateHoldInput = z.infer<typeof CreateHoldInput>;

/** U2 „Potwierdź rezerwację”: the goal is required for a trial (20–500, checked by the domain). */
export const CheckoutInput = z.object({
  holdId: z.uuid(),
  goal: z.string().trim().max(L.goal.maxLength, { error: 'too_long' }).nullish(),
});
export type CheckoutInput = z.infer<typeof CheckoutInput>;

/** Q1: F3 always answers `confirmed`; F4 adds `payment_required` without changing the route. */
export const CheckoutView = z.union([
  z.object({ kind: z.literal('confirmed'), booking: BookingView }),
  z.object({ kind: z.literal('payment_required'), clientSecret: z.string() }),
]);
export type CheckoutView = z.infer<typeof CheckoutView>;

/** POST /api/bookings/holds — takes the 10-minute hold (Idempotency-Key required). */
export const createHoldContract = oc
  .route({ method: 'POST', path: '/bookings/holds', summary: 'Take a 10-minute hold (U1)' })
  .input(CreateHoldInput)
  .output(BookingView);

/** GET /api/bookings/holds/{id} — the hold U2 summarises. */
export const getHoldContract = oc
  .route({ method: 'GET', path: '/bookings/holds/{id}', summary: 'Read one hold (U2)' })
  .input(z.object({ id: z.uuid() }))
  .output(BookingView);

/** DELETE /api/bookings/holds/{id} — „Zmień termin” releases the hold (Q18). */
export const deleteHoldContract = oc
  .route({ method: 'DELETE', path: '/bookings/holds/{id}', summary: 'Release a hold (U2)' })
  .input(z.object({ id: z.uuid() }))
  .output(BookingView);

/** POST /api/checkout — confirms the hold (Idempotency-Key required). */
export const checkoutContract = oc
  .route({ method: 'POST', path: '/checkout', summary: 'Confirm the held slot (U2)' })
  .input(CheckoutInput)
  .output(CheckoutView);

/** GET /api/bookings/{id} — status of one booking (U3); a foreign booking is one 404. */
export const getBookingContract = oc
  .route({ method: 'GET', path: '/bookings/{id}', summary: 'Read one booking (U3)' })
  .input(z.object({ id: z.uuid() }))
  .output(BookingView);
