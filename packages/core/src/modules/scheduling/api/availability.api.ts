import type {
  AvailabilityExceptionView,
  AvailabilityRuleView,
  MentorCalendarView,
  MentorScheduleSettings,
} from '@kompas/contracts/scheduling';
import { Temporal } from 'temporal-polyfill';
import type { AddAvailabilityExceptionInput } from '../application/availability-exceptions.commands.ts';
import type { MentorCalendar } from '../application/mentor-calendar.ts';
import type {
  AvailabilityException,
  AvailabilityRule,
  MentorSchedule,
  Weekday,
} from '../domain/availability.entity.ts';
import type { AvailabilityIssue, BookingError } from '../domain/booking.errors.ts';

/** Contract 'HH:MM' → domain `PlainTime` (the boundary is also where the grid is enforced). */
const toPlainTime = (value: string): Temporal.PlainTime => Temporal.PlainTime.from(value);

/** Domain `PlainTime` → contract 'HH:MM'. */
const toLocalTime = (time: Temporal.PlainTime): string =>
  time.toString({ smallestUnit: 'minute' });

export const toRuleInput = (view: AvailabilityRuleView): AvailabilityRule => ({
  weekday: view.weekday as Weekday,
  startLocal: toPlainTime(view.startLocal),
  endLocal: toPlainTime(view.endLocal),
});

export const toRuleView = (rule: AvailabilityRule): AvailabilityRuleView => ({
  weekday: rule.weekday,
  startLocal: toLocalTime(rule.startLocal),
  endLocal: toLocalTime(rule.endLocal),
});

export const toScheduleSettings = (schedule: MentorSchedule): MentorScheduleSettings => ({
  timeZone: schedule.timeZone,
  minNoticeMinutes: schedule.minNoticeMinutes,
  bufferMinutes: schedule.bufferMinutes,
  version: schedule.version,
});

export const toExceptionInput = (input: {
  readonly startsAt: string;
  readonly endsAt: string;
  readonly kind: AvailabilityException['kind'];
  readonly note?: string | null | undefined;
}): AddAvailabilityExceptionInput => ({
  startsAt: Temporal.Instant.from(input.startsAt),
  endsAt: Temporal.Instant.from(input.endsAt),
  kind: input.kind,
  note: input.note ?? null,
});

export const toExceptionView = (exception: AvailabilityException): AvailabilityExceptionView => ({
  id: exception.id,
  startsAt: exception.startsAt.toString(),
  endsAt: exception.endsAt.toString(),
  kind: exception.kind,
  note: exception.note,
});

/** Domain calendar → the JSON M3 draws (sessions stay empty until step 10). */
export const toMentorCalendarView = (calendar: MentorCalendar): MentorCalendarView => ({
  settings: toScheduleSettings(calendar.schedule),
  rules: calendar.rules.map(toRuleView),
  exceptions: calendar.exceptions.map(toExceptionView),
  sessions: [],
});

export interface SchedulingProblem {
  readonly status: 403 | 404 | 409 | 422;
  readonly code: string;
  readonly issues?: readonly AvailabilityIssue[];
  readonly bookingIds?: readonly string[];
}

/** Expected failures → RFC 9457 status codes (spec §4.9). */
export const toSchedulingProblem = (error: BookingError): SchedulingProblem => {
  switch (error.code) {
    case 'scheduling.forbidden':
      return { status: 403, code: error.code };
    case 'scheduling.not_found':
      return { status: 404, code: error.code };
    case 'scheduling.version_conflict':
      return { status: 409, code: error.code };
    case 'scheduling.availability_conflicts':
      return { status: 409, code: error.code, bookingIds: error.bookingIds };
    case 'scheduling.invalid_availability':
      return { status: 422, code: error.code, issues: error.issues };
    case 'booking.invalid_transition':
      return { status: 409, code: error.code };
  }
};
