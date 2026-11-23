import { Temporal } from 'temporal-polyfill';
import { type Clock, err, ok, type Result } from '../../../shared/domain/index.ts';
import { defaultScheduleSettings, type MentorSchedule } from '../domain/availability.entity.ts';
import type { BookingError } from '../domain/booking.errors.ts';
import { BOOKING_HORIZON, TRIAL_MIN_NOTICE } from '../domain/policies/config.ts';
import { slotsFor } from '../domain/policies/slots-for.policy.ts';
import type { MentorAvailabilitySlots } from './mentor-availability.ts';
import type {
  AvailabilityRepository,
  BusyRepository,
  MentorBookabilityRepository,
} from './ports.ts';

/** Q2: a trial is always 30 min, a later session is 30 or 60 min. */
export type AvailabilityDuration = 30 | 60;
export type AvailabilityBookingType = 'trial' | 'plan';

export interface GetMentorAvailabilityInput {
  /** `:id` of the public endpoint is the mentor **profile** id (requirement 20). */
  readonly mentorProfileId: string;
  readonly range: { readonly from: Temporal.Instant; readonly to: Temporal.Instant };
  readonly durationMinutes: AvailabilityDuration;
  readonly kind: AvailabilityBookingType;
}

type Engine = Omit<Parameters<typeof slotsFor>[0], 'range' | 'duration'>;

type AvailabilityDeps = {
  clock: Clock;
  availabilityRepository: AvailabilityRepository;
  mentorBookabilityRepository: MentorBookabilityRepository;
  busyRepository: BusyRepository;
};

const atLeast = (a: Temporal.Duration, b: Temporal.Duration): Temporal.Duration =>
  a.total({ unit: 'millisecond' }) >= b.total({ unit: 'millisecond' }) ? a : b;

/** Q9: a trial always leaves the mentor at least 6 h to answer; anything else follows the mentor. */
const noticeFor = (schedule: MentorSchedule, kind: AvailabilityBookingType): Temporal.Duration => {
  const notice = Temporal.Duration.from({ minutes: schedule.minNoticeMinutes });
  return kind === 'trial' ? atLeast(notice, TRIAL_MIN_NOTICE) : notice;
};

/** Q10: the window of the answer never leaves the 8-week horizon or starts in the past. */
const clip = (range: GetMentorAvailabilityInput['range'], now: Temporal.Instant) => ({
  from: Temporal.Instant.compare(range.from, now) < 0 ? now : range.from,
  to:
    Temporal.Instant.compare(range.to, now.add(BOOKING_HORIZON)) < 0
      ? range.to
      : now.add(BOOKING_HORIZON),
});

/** Template, exceptions and settings of one mentor, with the defaults of a fresh profile. */
const readAvailability = async (
  deps: Pick<AvailabilityDeps, 'availabilityRepository'>,
  mentorId: MentorSchedule['mentorId'],
) => {
  const [schedule, rules, exceptions] = await Promise.all([
    deps.availabilityRepository.findSchedule(mentorId),
    deps.availabilityRepository.listRules(mentorId),
    deps.availabilityRepository.listExceptions(mentorId),
  ]);
  return { schedule: schedule ?? { mentorId, ...defaultScheduleSettings() }, rules, exceptions };
};

/** The engine input of `slotsFor`, with busy time read for the whole horizon in one query. */
const buildEngine = async (
  deps: AvailabilityDeps,
  input: GetMentorAvailabilityInput,
  now: Temporal.Instant,
  horizonEnd: Temporal.Instant,
): Promise<Result<Engine, BookingError>> => {
  const projection = await deps.mentorBookabilityRepository.findByProfileId(input.mentorProfileId);
  // Q5/Q13: an unknown, unapproved or suspended mentor is one 404 for the caller (spec §8).
  if (!projection?.bookable) return err({ code: 'scheduling.mentor_unavailable' });
  const { schedule, rules, exceptions } = await readAvailability(deps, projection.mentorId);
  return ok({
    rules,
    exceptions,
    busy: await deps.busyRepository.listBusy(projection.mentorId, { from: now, to: horizonEnd }),
    timeZone: schedule.timeZone,
    settings: {
      minNotice: noticeFor(schedule, input.kind),
      buffer: Temporal.Duration.from({ minutes: schedule.bufferMinutes }),
    },
    horizon: BOOKING_HORIZON,
    now,
  });
};

/** U1's answer: the slots of the window, or the first slot after it („następny wolny termin"). */
const answerFor = (
  engine: Engine,
  window: { from: Temporal.Instant; to: Temporal.Instant },
  horizonEnd: Temporal.Instant,
  duration: Temporal.Duration,
): { slots: MentorAvailabilitySlots['slots']; nextAvailableAt: Temporal.Instant | null } => {
  if (Temporal.Instant.compare(window.to, window.from) <= 0)
    return { slots: [], nextAvailableAt: null };
  const slots = slotsFor({ ...engine, range: window, duration }).map((startsAt) => ({
    startsAt,
    endsAt: startsAt.add(duration),
  }));
  return {
    slots,
    nextAvailableAt:
      slots.length > 0
        ? null
        : (slotsFor({ ...engine, range: { from: window.to, to: horizonEnd }, duration })[0] ??
          null),
  };
};

/**
 * U1's slot list for one mentor (E3-S3 step 8): template, exceptions, notice, buffer and busy time
 * resolved by the pure `slotsFor` in the mentor's zone. Public: no session is required and the
 * answer holds no personal data.
 */
export const makeGetMentorAvailability =
  (deps: AvailabilityDeps) =>
  async (
    input: GetMentorAvailabilityInput,
  ): Promise<Result<MentorAvailabilitySlots, BookingError>> => {
    const now = deps.clock.now();
    const horizonEnd = now.add(BOOKING_HORIZON);
    const window = clip(input.range, now);
    const duration = Temporal.Duration.from({
      minutes: input.kind === 'trial' ? 30 : input.durationMinutes,
    });
    const engine = await buildEngine(deps, input, now, horizonEnd);
    if (engine.isErr()) return err(engine.error);
    const { slots, nextAvailableAt } = answerFor(engine.value, window, horizonEnd, duration);
    return ok({
      mentorTimeZone: engine.value.timeZone,
      durationMinutes: input.kind === 'trial' ? 30 : input.durationMinutes,
      slots,
      nextAvailableAt,
    });
  };

export type GetMentorAvailability = ReturnType<typeof makeGetMentorAvailability>;
