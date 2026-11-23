import { defineEntity, p } from '@mikro-orm/core';

/** Per-mentor booking settings (table `scheduling.mentor_schedule`). */
export const MentorScheduleRecord = defineEntity({
  name: 'MentorScheduleRecord',
  tableName: 'mentor_schedule',
  schema: 'scheduling',
  properties: {
    mentorId: p.string().fieldName('mentor_id').primary(),
    timeZone: p.string().fieldName('time_zone'),
    minNoticeMinutes: p.integer().fieldName('min_notice_minutes'),
    bufferMinutes: p.integer().fieldName('buffer_minutes'),
    version: p.integer(),
    createdAt: p.datetime().fieldName('created_at'),
    updatedAt: p.datetime().fieldName('updated_at'),
  },
});

/** One interval of the weekly template (table `scheduling.availability_rule`). */
export const AvailabilityRuleRecord = defineEntity({
  name: 'AvailabilityRuleRecord',
  tableName: 'availability_rule',
  schema: 'scheduling',
  properties: {
    id: p.uuid().primary(),
    mentorId: p.string().fieldName('mentor_id'),
    weekday: p.integer(),
    startLocal: p.time().fieldName('start_local'),
    endLocal: p.time().fieldName('end_local'),
  },
});

/** One date-specific change of availability (table `scheduling.availability_exception`). */
export const AvailabilityExceptionRecord = defineEntity({
  name: 'AvailabilityExceptionRecord',
  tableName: 'availability_exception',
  schema: 'scheduling',
  properties: {
    id: p.uuid().primary(),
    mentorId: p.string().fieldName('mentor_id'),
    startsAt: p.datetime().fieldName('starts_at'),
    endsAt: p.datetime().fieldName('ends_at'),
    kind: p.string(),
    note: p.text().nullable(),
    createdAt: p.datetime().fieldName('created_at'),
  },
});

export const schedulingRecords = [
  MentorScheduleRecord,
  AvailabilityRuleRecord,
  AvailabilityExceptionRecord,
];
