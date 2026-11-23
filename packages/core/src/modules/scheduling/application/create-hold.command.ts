import type { Temporal } from 'temporal-polyfill';
import {
  BookingId,
  type Clock,
  err,
  type Money,
  money,
  newId,
  ok,
  type Result,
  StudentId,
} from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type { Booking } from '../domain/booking.entity.ts';
import type { BookingError } from '../domain/booking.errors.ts';
import { TRIAL_PRICE } from '../domain/policies/config.ts';
import { goalProblem } from '../domain/policies/goal.policy.ts';
import { holdExpiresAt, holdLimitReached, HOLD_WINDOW } from '../domain/policies/hold.policy.ts';
import type {
  AvailabilityRepository,
  BookingRepository,
  MentorBookabilityRepository,
} from './ports.ts';
import { requirePermission } from './ports.ts';

/** `POST /bookings/holds` (U1): the chosen mentor profile, start and kind. */
export interface CreateHoldInput {
  readonly mentorProfileId: string;
  readonly startsAt: Temporal.Instant;
  /** Q2: a trial is always 30 min; a later session is 30 or 60 min. */
  readonly durationMinutes: 30 | 60;
  readonly type: 'trial' | 'plan';
  /** U2: required for a trial, 20–500 characters. */
  readonly goal: string | null;
}

type Deps = {
  clock: Clock;
  availabilityRepository: AvailabilityRepository;
  mentorBookabilityRepository: MentorBookabilityRepository;
  bookingRepository: BookingRepository;
};

/** Q3: the price snapshotted into the booking — platform trial price or the mentor's 60-min rate. */
const priceFor = (
  type: CreateHoldInput['type'],
  durationMinutes: number,
  rate60: Money | null,
): Money | null => {
  if (type === 'trial') return TRIAL_PRICE;
  if (rate60 === null) return null;
  return money.of(durationMinutes === 60 ? rate60.amount : rate60.amount / 2n);
};

/**
 * U1/requirement 4: takes a 10-minute hold on a slot (spec §4.4). Checks the caller (student, its
 * e-mail verified), the mentor mirror (bookable, `accepting_new` for a trial), the goal of a trial,
 * the hourly hold cap and then lets the database's exclusion/unique constraints decide the race.
 */
export const makeCreateHold =
  (deps: Deps) =>
  async (actor: CurrentUser, input: CreateHoldInput): Promise<Result<Booking, BookingError>> => {
    const permission = requirePermission(actor, 'scheduling.booking.create');
    if (permission.isErr()) return err(permission.error);
    if (!actor.emailVerified) return err({ code: 'scheduling.email_not_verified' });

    const mentor = await deps.mentorBookabilityRepository.findByProfileId(input.mentorProfileId);
    if (!mentor?.bookable) return err({ code: 'scheduling.mentor_unavailable' });
    if (input.type === 'trial' && !mentor.acceptingNew) {
      return err({ code: 'scheduling.not_accepting_new' });
    }

    // U2 collects the goal at checkout; when it already arrives here it must still be valid.
    const goal = input.goal?.trim() ?? '';
    if (goal.length > 0) {
      const problem = goalProblem(goal);
      if (problem !== null) return err({ code: 'scheduling.invalid_goal', issue: problem });
    }

    const now = deps.clock.now();
    const holdsInWindow = await deps.bookingRepository.countHoldsSince(
      StudentId.parse(actor.id),
      now.subtract(HOLD_WINDOW),
    );
    if (holdLimitReached(holdsInWindow)) {
      return err({ code: 'scheduling.hold_rate_limited', retryAfterSeconds: 3_600 });
    }

    const durationMinutes = input.type === 'trial' ? 30 : input.durationMinutes;
    const schedule = await deps.availabilityRepository.findSchedule(mentor.mentorId);
    const result = await deps.bookingRepository.createHold({
      id: newId(BookingId),
      mentorId: mentor.mentorId,
      studentId: StudentId.parse(actor.id),
      type: input.type,
      status: 'hold',
      startsAt: input.startsAt,
      endsAt: input.startsAt.add({ minutes: durationMinutes }),
      bufferMinutes: schedule?.bufferMinutes ?? 0,
      holdExpiresAt: holdExpiresAt(now),
      goal: goal.length > 0 ? goal : null,
      price: priceFor(input.type, durationMinutes, mentor.rate60),
      acceptDeadlineAt: null,
      now,
    });
    if (result.kind === 'created') return ok(result.booking);
    switch (result.kind) {
      case 'slot_taken':
        return err({ code: 'scheduling.slot_taken' });
      case 'student_busy':
        return err({ code: 'scheduling.student_busy' });
      case 'trial_already_used':
        return err({ code: 'scheduling.trial_already_used' });
    }
  };

export type CreateHold = ReturnType<typeof makeCreateHold>;
