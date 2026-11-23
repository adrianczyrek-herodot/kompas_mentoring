import { oc } from '@orpc/contract';
import { z } from 'zod';
import { SCHEDULING_LIMITS as L } from './limits.ts';

// M3 availability: weekly template, exceptions and mentor settings (spec "Wymagania" 1, 2, 20).
// Problem codes in responses are the domain codes (`scheduling.*`), so the browser and the server
// say the same thing about the same value (lesson backend 2026-11-23).

/** 'HH:MM' local wall-clock time on the 30-min grid. */
const LocalTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: 'invalid' });

/** One weekly template interval in the mentor's local time. */
export const AvailabilityRuleView = z.object({
  weekday: z
    .number({ error: 'required' })
    .int({ error: 'out_of_range' })
    .min(1, { error: 'out_of_range' })
    .max(7, { error: 'out_of_range' }),
  startLocal: LocalTime,
  endLocal: LocalTime,
});
export type AvailabilityRuleView = z.infer<typeof AvailabilityRuleView>;

export const AvailabilityExceptionKind = z.enum(['off', 'extra']);
export type AvailabilityExceptionKind = z.infer<typeof AvailabilityExceptionKind>;

/** `off` = holiday / block, `extra` = additional hours, as exact instants. */
export const AvailabilityExceptionView = z.object({
  id: z.uuid(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  kind: AvailabilityExceptionKind,
  note: z.string().nullable(),
});
export type AvailabilityExceptionView = z.infer<typeof AvailabilityExceptionView>;

/** Per-mentor booking settings (Q9 notice, M3 buffer, Q12 time zone). */
export const MentorScheduleSettings = z.object({
  timeZone: z.string().min(1, { error: 'required' }),
  minNoticeMinutes: z
    .number({ error: 'required' })
    .int({ error: 'out_of_range' })
    .min(L.notice.minMinutes, { error: 'out_of_range' })
    .max(L.notice.maxMinutes, { error: 'out_of_range' }),
  bufferMinutes: z
    .number({ error: 'required' })
    .int({ error: 'out_of_range' })
    .min(L.buffer.minMinutes, { error: 'out_of_range' })
    .max(L.buffer.maxMinutes, { error: 'out_of_range' }),
  version: z.number().int(),
});
export type MentorScheduleSettings = z.infer<typeof MentorScheduleSettings>;

/** Bookings of the week: filled from step 10 of the plan; empty in E3-S2. */
export const MentorCalendarSession = z.object({
  id: z.uuid(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  status: z.enum(['requested', 'scheduled']),
  outsideAvailability: z.boolean(),
});

/** `GET /mentor/calendar` — the mentor's week of availability and sessions (M3). */
export const MentorCalendarView = z.object({
  settings: MentorScheduleSettings,
  rules: z.array(AvailabilityRuleView),
  exceptions: z.array(AvailabilityExceptionView),
  sessions: z.array(MentorCalendarSession),
});
export type MentorCalendarView = z.infer<typeof MentorCalendarView>;

/** An exception id as M3 sends it when removing a row. */
export const AvailabilityExceptionId = z.uuid();

/** Problem data for 422 (RFC 9457 extension): one entry per offending field. */
export const AvailabilityIssues = z.object({
  issues: z.array(z.object({ field: z.string(), problem: z.string() })),
});

/** Problem data for 409 (Q11): sessions the change overlaps; resend with `acknowledgeConflicts`. */
export const AvailabilityConflicts = z.object({
  bookingIds: z.array(z.string()),
});

/** The weekly template as M3 saves it — shared by the oRPC route and the web server action. */
export const SaveAvailabilityTemplateInput = z.object({
  rules: z.array(AvailabilityRuleView),
  expectedVersion: z.number({ error: 'required' }).int({ error: 'out_of_range' }),
  /** Q11: keep the sessions that the change overlaps. */
  acknowledgeConflicts: z.boolean().optional(),
});
export type SaveAvailabilityTemplateInput = z.infer<typeof SaveAvailabilityTemplateInput>;

/** The new exception as M3 sends it; `startsAt`/`endsAt` are instants. */
export const AddAvailabilityExceptionInput = z.object({
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  kind: AvailabilityExceptionKind,
  note: z.string().trim().max(L.exceptionNoteMaxLength, { error: 'too_long' }).nullish(),
});
export type AddAvailabilityExceptionInput = z.infer<typeof AddAvailabilityExceptionInput>;

/** Mentor settings as M3 saves them (Q9 notice, Q12 zone). */
export const UpdateMentorSettingsInput = z.object({
  timeZone: z.string().min(1, { error: 'required' }),
  minNoticeMinutes: z
    .number({ error: 'required' })
    .int({ error: 'out_of_range' })
    .min(L.notice.minMinutes, { error: 'out_of_range' })
    .max(L.notice.maxMinutes, { error: 'out_of_range' }),
  bufferMinutes: z
    .number({ error: 'required' })
    .int({ error: 'out_of_range' })
    .min(L.buffer.minMinutes, { error: 'out_of_range' })
    .max(L.buffer.maxMinutes, { error: 'out_of_range' }),
  expectedVersion: z.number({ error: 'required' }).int({ error: 'out_of_range' }),
});
export type UpdateMentorSettingsInput = z.infer<typeof UpdateMentorSettingsInput>;

/** GET /api/mentor/calendar — the week M3 draws (from/to are instants on the client's axis). */
export const getMentorCalendarContract = oc
  .route({ method: 'GET', path: '/mentor/calendar', summary: 'Mentor week: availability (M3)' })
  .input(
    z.object({
      from: z.iso.datetime({ offset: true }),
      to: z.iso.datetime({ offset: true }),
    }),
  )
  .output(MentorCalendarView);

/** PUT /api/mentor/availability/template — saves the whole weekly template (409 on a stale version). */
export const saveAvailabilityTemplateContract = oc
  .route({
    method: 'PUT',
    path: '/mentor/availability/template',
    summary: 'Save the weekly availability template (M3)',
  })
  .input(SaveAvailabilityTemplateInput)
  .output(MentorCalendarView);

/** POST /api/mentor/availability/exceptions — adds an `off`/`extra` exception. */
export const addAvailabilityExceptionContract = oc
  .route({
    method: 'POST',
    path: '/mentor/availability/exceptions',
    summary: 'Add an availability exception (M3)',
  })
  .input(AddAvailabilityExceptionInput)
  .output(AvailabilityExceptionView);

/** DELETE /api/mentor/availability/exceptions/{id} — removes the mentor's own exception. */
export const deleteAvailabilityExceptionContract = oc
  .route({
    method: 'DELETE',
    path: '/mentor/availability/exceptions/{id}',
    summary: 'Remove an availability exception (M3)',
  })
  .input(z.object({ id: z.uuid() }))
  .output(z.object({ id: z.uuid() }));

/** PATCH /api/mentor/settings — notice, buffer and time zone (Q9/Q12, 409 on a stale version). */
export const updateMentorSettingsContract = oc
  .route({
    method: 'PATCH',
    path: '/mentor/settings',
    summary: 'Mentor booking settings (M3)',
  })
  .input(UpdateMentorSettingsInput)
  .output(MentorScheduleSettings);
