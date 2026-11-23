import type { InferEntity } from '@mikro-orm/core';
import { Temporal } from 'temporal-polyfill';
import {
  BookingId,
  MentorId,
  money,
  StudentId,
} from '../../../shared/domain/index.ts';
import type {
  Booking,
  BookingCancelledBy,
  BookingPaymentMode,
  BookingType,
} from '../domain/booking.entity.ts';
import type { BookingStatus } from '../domain/booking.state.ts';
import type { BookingRecord } from './scheduling.records.ts';

export type BookingRow = InferEntity<typeof BookingRecord>;

// MikroORM 7 returns `datetime` as `Date` and `bigint` as `bigint` (lesson backend 2026-11-23);
// adapters convert to/from `Temporal`/`Money` at the repository boundary, never inside the domain.
const toInstant = (date: Date): Temporal.Instant =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime());

const toNullableInstant = (date: Date | null | undefined): Temporal.Instant | null =>
  date === null || date === undefined ? null : toInstant(date);

export const toDate = (instant: Temporal.Instant): Date => new Date(instant.epochMilliseconds);

export const toBooking = (row: BookingRow): Booking => ({
  id: BookingId.parse(row.id),
  mentorId: MentorId.parse(row.mentorId),
  studentId: StudentId.parse(row.studentId),
  type: row.type as BookingType,
  status: row.status as BookingStatus,
  startsAt: toInstant(row.startsAt),
  endsAt: toInstant(row.endsAt),
  bufferMinutes: row.bufferMinutes,
  holdExpiresAt: toNullableInstant(row.holdExpiresAt),
  goal: row.goal ?? null,
  price:
    row.priceAmount === null || row.priceAmount === undefined
      ? null
      : money.of(row.priceAmount, (row.currency as 'PLN' | null) ?? 'PLN'),
  paymentMode: (row.paymentMode as BookingPaymentMode | null) ?? null,
  acceptDeadlineAt: toNullableInstant(row.acceptDeadlineAt),
  declineReason: row.declineReason ?? null,
  declineComment: row.declineComment ?? null,
  cancelledBy: (row.cancelledBy as BookingCancelledBy | null) ?? null,
  cancelReason: row.cancelReason ?? null,
  rescheduleCount: row.rescheduleCount,
  version: row.version,
  createdAt: toInstant(row.createdAt),
  updatedAt: toInstant(row.updatedAt),
});
