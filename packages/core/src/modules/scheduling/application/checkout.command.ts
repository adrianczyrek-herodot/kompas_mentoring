import { Temporal } from 'temporal-polyfill';
import type { BookingId, Clock, Result, StudentId } from '../../../shared/domain/index.ts';
import { err, ok } from '../../../shared/domain/index.ts';
import { StudentId as StudentIdSchema } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { Booking } from '../domain/booking.entity.ts';
import type { BookingError } from '../domain/booking.errors.ts';
import { autoAcceptDeadline } from '../domain/policies/auto-accept-deadline.policy.ts';
import { goalProblem } from '../domain/policies/goal.policy.ts';
import type { BookingRepository, PaymentGate } from './ports.ts';
import { requirePermission } from './ports.ts';

/** `POST /checkout` (U2): the hold and, for a trial, the goal the student typed. */
export interface CheckoutInput {
  readonly holdId: BookingId;
  readonly goal: string | null;
}

/** Q1: F3 always confirms; the union leaves room for F4's `payment_required`. */
export type CheckoutResult =
  | { readonly kind: 'confirmed'; readonly booking: Booking }
  | { readonly kind: 'payment_required'; readonly clientSecret: string };

type Deps = {
  clock: Clock;
  bookingRepository: BookingRepository;
  paymentGate: PaymentGate;
};

/**
 * Confirms a held slot (Q-B2/A8): a trial goes `hold → pending_payment → requested` through the
 * `PaymentGate` (the F3 adapter pays at once), a later session `hold → scheduled` through the
 * `CreditReservation` the repository calls in its transaction. The state change, the credit and
 * the event live in one transaction, so a rollback leaves neither a booking nor a job behind
 * (spec §4.6).
 */
export const makeCheckout =
  (deps: Deps) =>
  async (actor: CurrentUser, input: CheckoutInput): Promise<Result<CheckoutResult, BookingError>> => {
    const permission = requirePermission(actor, 'scheduling.booking.create');
    if (permission.isErr()) return err(permission.error);
    if (!actor.emailVerified) return err({ code: 'scheduling.email_not_verified' });

    const studentId: StudentId = StudentIdSchema.parse(actor.id);
    const now = deps.clock.now();
    const hold = await deps.bookingRepository.findById(input.holdId);
    if (hold === null) return err({ code: 'scheduling.not_found' });
    if (hold.studentId !== studentId) return err({ code: 'scheduling.not_found' });
    if (hold.status !== 'hold') return err({ code: 'scheduling.hold_expired' });
    const expired =
      hold.holdExpiresAt === null || Temporal.Instant.compare(hold.holdExpiresAt, now) <= 0;
    if (expired) {
      await deps.bookingRepository.expireHoldById(hold.id, now);
      return err({ code: 'scheduling.hold_expired' });
    }

    if (hold.type === 'trial') {
      const goal = input.goal?.trim() ?? '';
      const problem = goalProblem(goal);
      if (problem !== null) return err({ code: 'scheduling.invalid_goal', issue: problem });
      const payment = await deps.paymentGate.start(hold);
      if (payment.kind === 'pending') {
        return ok({ kind: 'payment_required', clientSecret: payment.clientSecret });
      }
      const acceptDeadlineAt = autoAcceptDeadline(hold.createdAt, hold.startsAt);
      // F3: `NoPaymentGate` paid at once, so both steps of §4.3 happen in one transaction.
      const outcome = await deps.bookingRepository.completeCheckout({
        bookingId: hold.id,
        studentId,
        events: ['checkout_started', 'payment_succeeded'],
        reserveCredit: false,
        goal,
        acceptDeadlineAt,
        now,
      });
      return confirmed(outcome);
    }

    // The credit is reserved by `CreditReservation` inside the checkout transaction (spec §4.5).
    const trimmedGoal = input.goal?.trim() ?? null;
    const outcome = await deps.bookingRepository.completeCheckout({
      bookingId: hold.id,
      studentId,
      events: ['confirmed_with_credit'],
      reserveCredit: true,
      goal: trimmedGoal === '' ? null : trimmedGoal,
      acceptDeadlineAt: null,
      now,
    });
    return confirmed(outcome);
  };

const confirmed = (
  outcome: Awaited<ReturnType<BookingRepository['completeCheckout']>>,
): Result<CheckoutResult, BookingError> => {
  switch (outcome.kind) {
    case 'confirmed':
      return ok({ kind: 'confirmed', booking: outcome.booking });
    case 'insufficient_credit':
      return err({ code: 'scheduling.insufficient_credit' });
    case 'expired':
      return err({ code: 'scheduling.hold_expired' });
    case 'not_found':
      return err({ code: 'scheduling.not_found' });
  }
};

export type Checkout = ReturnType<typeof makeCheckout>;
