import type { Temporal } from 'temporal-polyfill';
import { v7 as uuidv7 } from 'uuid';
import { type Clock, err, MentorId, ok, type Result } from '../../../shared/domain/index.ts';
import type { CurrentUser } from '../../identity/index.ts';
import type {
  AvailabilityException,
  AvailabilityExceptionKind,
} from '../domain/availability.entity.ts';
import type { BookingError } from '../domain/booking.errors.ts';
import { validateException } from '../domain/policies/availability-exception.policy.ts';
import { BOOKING_HORIZON } from '../domain/policies/config.ts';
import { type AvailabilityRepository, requirePermission } from './ports.ts';

export interface AddAvailabilityExceptionInput {
  readonly startsAt: Temporal.Instant;
  readonly endsAt: Temporal.Instant;
  readonly kind: AvailabilityExceptionKind;
  readonly note: string | null;
}

/**
 * M3: adds an `off`/`extra` exception (requirement 1, Q10). At least 30 min, in the future, inside
 * the booking horizon and without a same-kind overlap — all checked here, not in the UI.
 */
export const makeAddAvailabilityException =
  ({
    clock,
    availabilityRepository,
  }: {
    clock: Clock;
    availabilityRepository: AvailabilityRepository;
  }) =>
  async (
    actor: CurrentUser,
    input: AddAvailabilityExceptionInput,
  ): Promise<Result<AvailabilityException, BookingError>> => {
    const allowed = requirePermission(actor, 'scheduling.availability.manage.own');
    if (allowed.isErr()) return err(allowed.error);
    const mentorId = MentorId.parse(actor.id);
    const now = clock.now();
    const existing = await availabilityRepository.listExceptions(mentorId);
    const validated = validateException(input, {
      now,
      horizonEnd: now.add(BOOKING_HORIZON),
      existing,
    });
    if (validated.isErr()) return err(validated.error);

    const exception: AvailabilityException = {
      id: uuidv7(),
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      kind: input.kind,
      note: input.note,
    };
    await availabilityRepository.insertException(mentorId, exception, now);
    return ok(exception);
  };

export type AddAvailabilityException = ReturnType<typeof makeAddAvailabilityException>;

/**
 * M3: removes the mentor's own exception. Someone else's or a missing id → `scheduling.not_found`
 * (404), indistinguishable on purpose (spec §8).
 */
export const makeDeleteAvailabilityException =
  ({ availabilityRepository }: { availabilityRepository: AvailabilityRepository }) =>
  async (actor: CurrentUser, id: string): Promise<Result<{ id: string }, BookingError>> => {
    const allowed = requirePermission(actor, 'scheduling.availability.manage.own');
    if (allowed.isErr()) return err(allowed.error);
    const mentorId = MentorId.parse(actor.id);
    const deleted = await availabilityRepository.deleteException(mentorId, id);
    return deleted ? ok({ id }) : err({ code: 'scheduling.not_found' });
  };

export type DeleteAvailabilityException = ReturnType<typeof makeDeleteAvailabilityException>;
