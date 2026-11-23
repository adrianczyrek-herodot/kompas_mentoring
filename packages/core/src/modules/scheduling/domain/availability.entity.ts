import type { Temporal } from 'temporal-polyfill';
import type { MentorId } from '../../../shared/domain/index.ts';
import { AVAILABILITY } from './policies/config.ts';

/** ISO weekday (1 = Monday … 7 = Sunday). */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * One weekly template interval in the mentor's local time (spec "Dostępność").
 * An interval never crosses midnight — a mentor who works overnight enters two rules.
 */
export interface AvailabilityRule {
  readonly weekday: Weekday;
  readonly startLocal: Temporal.PlainTime;
  readonly endLocal: Temporal.PlainTime;
}

/** `off` = holiday / block, `extra` = additional hours, both as exact instants. */
export type AvailabilityExceptionKind = 'off' | 'extra';

export interface AvailabilityException {
  readonly id: string;
  readonly startsAt: Temporal.Instant;
  readonly endsAt: Temporal.Instant;
  readonly kind: AvailabilityExceptionKind;
  readonly note: string | null;
}

/**
 * Per-mentor booking settings (exactly one row per mentor, `scheduling.mentor_schedule`).
 * The weekly template lives in `AvailabilityRule` rows, the date-specific changes in
 * `AvailabilityException`.
 */
export interface MentorSchedule {
  readonly mentorId: MentorId;
  readonly timeZone: string;
  /** Q9: booking notice in minutes (2 h–48 h). */
  readonly minNoticeMinutes: number;
  /** M3: buffer after a session in minutes (0–30). */
  readonly bufferMinutes: number;
  readonly version: number;
}

/**
 * A schedule that does not exist yet is edited against these defaults (Q9/Q12). `version: 0`
 * means "no row saved yet" — the first save sends `expectedVersion: 0`.
 */
export const defaultScheduleSettings = (): Pick<
  MentorSchedule,
  'timeZone' | 'minNoticeMinutes' | 'bufferMinutes' | 'version'
> => ({
  timeZone: AVAILABILITY.defaultTimeZone,
  minNoticeMinutes: AVAILABILITY.notice.defaultMinutes,
  bufferMinutes: AVAILABILITY.buffer.defaultMinutes,
  version: 0,
});

/** The whole editable availability of one mentor, as the calendar and the editor need it. */
export interface MentorAvailability {
  readonly schedule: MentorSchedule;
  readonly rules: readonly AvailabilityRule[];
  readonly exceptions: readonly AvailabilityException[];
}
