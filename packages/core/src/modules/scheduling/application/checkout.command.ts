import { Temporal } from 'temporal-polyfill';
import type { BookingId, Clock, Result, StudentId } from '../../../shared/domain/index.ts';
import { err, ok } from '../../../shared/domain/index.ts';
import { StudentId as StudentIdSchema } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { Booking } from '../domain/booking.entity.ts';
import type { BookingError } from '../domain/booking.errors.ts';
import { autoAcceptDeadline } from '../domain/policies/auto-accept-deadline.policy.ts';
import { goalProblem } from '../domain/policies/goal.policy.ts';
import type { BookingRepository, CreditReservation, PaymentGate } from './ports.ts';
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
  creditReservation: CreditReservation;
};

/**
 * Confirms a held slot (Q-B2/A8): a trial goes `hold → pending_payment → requested` through the
 * `PaymentGate` (the F3 adapter pays at once), a later session `hold → scheduled` through the
 * `CreditReservation`. The state change and its event live in one transaction, so a rollback leaves
 * neither a booking nor a job behind (spec §4.6).
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
      const outcome = await deps.bookingRepository.completeCheckout({
        bookingId: hold.id,
        studentId,
        to: 'requested',
        goal,
        acceptDeadlineAt,
        now,
      });
      return confirmed(outcome);
    }

    const reservation = await deps.creditReservation.reserve(hold);
    if (reservation.kind === 'insufficient_credit') {
      return err({ code: 'scheduling.insufficient_credit' });
    }
    const trimmedGoal = input.goal?.trim() ?? null;
    const outcome = await deps.bookingRepository.completeCheckout({
      bookingId: hold.id,
      studentId,
      to: 'scheduled',
      goal: trimmedGoal === '' ? null : trimmedGoal,
      acceptDeadlineAt: null,
      now,
    });
    return confirmed(outcome);
  };

const confirmed = (
  outcome: Awaited<ReturnType<BookingRepository['completeCheckout']>>,
): Result<CheckoutResult, BookingError> => {
  if (outcome.kind === 'confirmed') return ok({ kind: 'confirmed', booking: outcome.booking });
  if (outcome.kind === 'expired') return err({ code: 'scheduling.hold_expired' });
  return err({ code: 'scheduling.not_found' });
};

export type Checkout = ReturnType<typeof makeCheckout>;
