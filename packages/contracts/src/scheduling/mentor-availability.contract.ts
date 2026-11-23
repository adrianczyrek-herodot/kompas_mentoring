import { oc } from '@orpc/contract';
import { z } from 'zod';

// Public availability of one mentor (requirement 20, U1). Guest-visible: no session, no personal
// data beyond the mentor's own zone. Instants are stable for every viewer; the `localStart` /
// `localEnd` pair is the same instant in the caller's zone, so the grid needs no client arithmetic.

/** 30 min for a trial (Q2), 30 or 60 min for a later session. */
export const AvailabilityDurationMinutes = z.union([z.literal(30), z.literal(60)]);
export type AvailabilityDurationMinutes = z.infer<typeof AvailabilityDurationMinutes>;

export const AvailabilityBookingType = z.enum(['trial', 'plan']);
export type AvailabilityBookingType = z.infer<typeof AvailabilityBookingType>;

/** One bookable start: the instant plus the wall-clock time in the zone the caller asked for. */
export const MentorAvailabilitySlot = z.object({
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  /** `YYYY-MM-DDTHH:MM` in `timeZone` of the answer (the viewer's zone, Q12). */
  localStart: z.string(),
  localEnd: z.string(),
});
export type MentorAvailabilitySlot = z.infer<typeof MentorAvailabilitySlot>;

/** `GET /mentors/{id}/availability` — U1's slot list and „następny wolny termin". */
export const MentorAvailabilityView = z.object({
  /** Q12: the mentor's own zone, shown next to the grid. */
  mentorTimeZone: z.string(),
  /** The zone `localStart`/`localEnd` are expressed in (the caller's, or the mentor's). */
  timeZone: z.string(),
  durationMinutes: AvailabilityDurationMinutes,
  slots: z.array(MentorAvailabilitySlot),
  /** First bookable start after `to`, inside the 8-week horizon; `null` when there is none. */
  nextAvailableAt: z.iso.datetime({ offset: true }).nullable(),
});
export type MentorAvailabilityView = z.infer<typeof MentorAvailabilityView>;

export const getMentorAvailabilityContract = oc
  .route({
    method: 'GET',
    path: '/mentors/{id}/availability',
    summary: 'Public availability slots of a mentor (U1)',
  })
  .input(
    z.object({
      /** The mentor **profile** id, as P3 and the U1 URL use it. */
      id: z.uuid(),
      from: z.iso.datetime({ offset: true }),
      to: z.iso.datetime({ offset: true }),
      duration: AvailabilityDurationMinutes.optional(),
      type: AvailabilityBookingType.optional(),
      /** Q12: the viewer's zone; omitted → the mentor's zone. */
      timeZone: z.string().min(1).optional(),
    }),
  )
  .output(MentorAvailabilityView);
