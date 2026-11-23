// Public API of the scheduling module — the only file other modules and apps may import.

export {
  type SchedulingProblem,
  toExceptionInput,
  toExceptionView,
  toMentorCalendarView,
  toRuleInput,
  toRuleView,
  toScheduleSettings,
  toSchedulingProblem,
} from './api/availability.api.ts';
export type {
  AddAvailabilityException,
  AddAvailabilityExceptionInput,
  DeleteAvailabilityException,
} from './application/availability-exceptions.commands.ts';
export type {
  CancellationTerms,
  GetCancellationTerms,
} from './application/get-cancellation-terms.query.ts';
export type { GetMentorCalendar } from './application/get-mentor-calendar.query.ts';
export type { GetWeeklyAvailabilityMinutes } from './application/get-weekly-availability-minutes.query.ts';
export type { MentorCalendar } from './application/mentor-calendar.ts';
export type {
  SaveAvailabilityTemplate,
  SaveAvailabilityTemplateInput,
} from './application/save-availability-template.command.ts';
export type {
  UpdateMentorSettings,
  UpdateMentorSettingsInput,
} from './application/update-mentor-settings.command.ts';
export type { SchedulingCradle } from './di.ts';
export type {
  AvailabilityException,
  AvailabilityExceptionKind,
  AvailabilityRule,
  MentorAvailability,
  MentorSchedule,
  Weekday,
} from './domain/availability.entity.ts';
export { defaultScheduleSettings } from './domain/availability.entity.ts';
export type { Booking, BookingType } from './domain/booking.entity.ts';
export type {
  AvailabilityProblem,
  BookingError,
  InvalidAvailability,
  VersionConflict,
} from './domain/booking.errors.ts';
export type { BookingCancelledV1, BookingDomainEvent } from './domain/booking.events.ts';
export type { BookingEvent, BookingStatus } from './domain/booking.state.ts';
export type {
  ExceptionInput,
  InstantRange,
} from './domain/policies/availability-exception.policy.ts';
export {
  overlapsInstantRange,
  validateException,
} from './domain/policies/availability-exception.policy.ts';
export {
  hasMinimumWeeklyAvailability,
  minutesOfDay,
  sortTemplate,
  validateTemplate,
  weeklyAvailabilityMinutes,
} from './domain/policies/availability-template.policy.ts';
export {
  AVAILABILITY,
  BOOKING_HORIZON,
  FREE_CANCELLATION_NOTICE,
  TRIAL_MIN_NOTICE,
} from './domain/policies/config.ts';
export type { MentorSettingsInput } from './domain/policies/mentor-schedule.policy.ts';
export {
  isValidTimeZone,
  validateMentorSettings,
} from './domain/policies/mentor-schedule.policy.ts';
