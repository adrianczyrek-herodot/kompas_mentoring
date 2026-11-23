import type { InferEntity } from '@mikro-orm/core';
import { Temporal } from 'temporal-polyfill';
import { MentorId } from '../../../shared/domain/index.ts';
import type {
  AvailabilityException,
  AvailabilityExceptionKind,
  AvailabilityRule,
  MentorSchedule,
  Weekday,
} from '../domain/availability.entity.ts';
import type {
  AvailabilityExceptionRecord,
  AvailabilityRuleRecord,
  MentorScheduleRecord,
} from './scheduling.records.ts';

export type MentorScheduleRow = InferEntity<typeof MentorScheduleRecord>;
export type AvailabilityRuleRow = InferEntity<typeof AvailabilityRuleRecord>;
export type AvailabilityExceptionRow = InferEntity<typeof AvailabilityExceptionRecord>;

// MikroORM 7 returns `datetime` as `Date` and `time` as a string (lesson backend 2026-11-23);
// adapters convert to/from `Temporal` at the repository boundary, never inside the domain.

const toInstant = (date: Date): Temporal.Instant =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime());

export const toDate = (instant: Temporal.Instant): Date => new Date(instant.epochMilliseconds);

/** DB 'HH:MM:SS' → domain `PlainTime`; only the wall-clock time is meaningful. */
const toPlainTime = (value: string): Temporal.PlainTime => Temporal.PlainTime.from(value);

/** Domain `PlainTime` → DB 'HH:MM' (the grid never carries seconds). */
export const toLocalString = (time: Temporal.PlainTime): string =>
  time.toString({ smallestUnit: 'minute' });

export const toSchedule = (row: MentorScheduleRow): MentorSchedule => ({
  mentorId: MentorId.parse(row.mentorId),
  timeZone: row.timeZone,
  minNoticeMinutes: row.minNoticeMinutes,
  bufferMinutes: row.bufferMinutes,
  version: row.version,
});

export const toRule = (row: AvailabilityRuleRow): AvailabilityRule => ({
  weekday: row.weekday as Weekday,
  startLocal: toPlainTime(row.startLocal),
  endLocal: toPlainTime(row.endLocal),
});

export const toException = (row: AvailabilityExceptionRow): AvailabilityException => ({
  id: row.id,
  startsAt: toInstant(row.startsAt),
  endsAt: toInstant(row.endsAt),
  kind: row.kind as AvailabilityExceptionKind,
  note: row.note ?? null,
});
