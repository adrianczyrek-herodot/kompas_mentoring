// Public API of the scheduling module — the only file other modules and apps may import.

export { toBookingView, toCheckoutView } from './api/booking.api.ts';
export { toMentorAvailabilityView } from './api/mentor-availability.api.ts';
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
  Checkout,
  CheckoutInput,
  CheckoutResult,
} from './application/checkout.command.ts';
export type { CreateHold, CreateHoldInput } from './application/create-hold.command.ts';
export type { ExpireHolds } from './application/expire-holds.handler.ts';
export type { GetBooking } from './application/get-booking.query.ts';
export type {
  AvailabilityBookingType,
  AvailabilityDuration,
  GetMentorAvailability,
  GetMentorAvailabilityInput,
} from './application/get-mentor-availability.query.ts';
export type {
  CheckoutTransition,
  CreditReservation,
  CreditReservationOutcome,
  InsertOutcome,
  NewBooking,
  PaymentGate,
  PaymentStart,
} from './application/ports.ts';
export type { BookingRepository } from './application/ports.ts';
export type { ReleaseHold } from './application/release-hold.command.ts';
export type {
  AvailableSlot,
  MentorAvailabilitySlots,
} from './application/mentor-availability.ts';
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
export type {
  Booking,
  BookingCancelledBy,
  BookingPaymentMode,
  BookingType,
} from './domain/booking.entity.ts';
export type {
  AvailabilityProblem,
  BookingError,
  EmailNotVerified,
  HoldExpired,
  HoldRateLimited,
  InsufficientCredit,
  InvalidAvailability,
  InvalidGoal,
  NotAcceptingNew,
  SlotTaken,
  StudentBusy,
  TrialAlreadyUsed,
  VersionConflict,
} from './domain/booking.errors.ts';
export { autoAcceptDeadline } from './domain/policies/auto-accept-deadline.policy.ts';
export type { BookingIcs } from './infrastructure/ics.ts';
export { toIcs } from './infrastructure/ics.ts';
export { type GoalProblem, goalProblem } from './domain/policies/goal.policy.ts';
export {
  holdExpiresAt,
  holdLimitReached,
  HOLD_WINDOW,
} from './domain/policies/hold.policy.ts';
export { EXPIRE_HOLDS_CRON, EXPIRE_HOLDS_QUEUE } from './jobs/expire-holds.ts';
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
  GOAL,
  HOLD,
  TRIAL_MIN_NOTICE,
  TRIAL_PRICE,
} from './domain/policies/config.ts';
export type { MentorSettingsInput } from './domain/policies/mentor-schedule.policy.ts';
export {
  isValidTimeZone,
  validateMentorSettings,
} from './domain/policies/mentor-schedule.policy.ts';
export type {
  AvailabilityWindowsInput,
  Interval,
  SlotsForInput,
} from './domain/policies/slots-for.policy.ts';
export { availabilityWindows, slotsFor } from './domain/policies/slots-for.policy.ts';
