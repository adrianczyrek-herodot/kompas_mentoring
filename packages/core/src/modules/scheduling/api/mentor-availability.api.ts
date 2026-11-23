import type { MentorAvailabilityView } from '@kompas/contracts/scheduling';
import type { Temporal } from 'temporal-polyfill';
import type { MentorAvailabilitySlots } from '../application/mentor-availability.ts';
import { isValidTimeZone } from '../domain/policies/mentor-schedule.policy.ts';

/** `YYYY-MM-DDTHH:MM` — the wall-clock time of an instant in one zone (U1 grid labels). */
const wallClock = (instant: Temporal.Instant, timeZone: string): string =>
  instant.toZonedDateTimeISO(timeZone).toPlainDateTime().toString({ smallestUnit: 'minute' });

/**
 * Domain answer → the public JSON (requirement 20). The engine works on instants only ("Silnik
 * slotów": the viewing zone never enters it), so presentation happens here: the same six instants
 * read 01:30–03:00 in Warsaw and 19:30–21:00 in New York, and the client renders both.
 * An unknown viewer zone falls back to the mentor's own — the answer stays correct, only labels
 * change, and a guest may send anything from a stale `Intl` cache.
 */
export const toMentorAvailabilityView = (
  availability: MentorAvailabilitySlots,
  viewerTimeZone: string | undefined,
): MentorAvailabilityView => {
  const timeZone =
    viewerTimeZone !== undefined && isValidTimeZone(viewerTimeZone)
      ? viewerTimeZone
      : availability.mentorTimeZone;
  return {
    mentorTimeZone: availability.mentorTimeZone,
    timeZone,
    durationMinutes: availability.durationMinutes as MentorAvailabilityView['durationMinutes'],
    slots: availability.slots.map((slot) => ({
      startsAt: slot.startsAt.toString(),
      endsAt: slot.endsAt.toString(),
      localStart: wallClock(slot.startsAt, timeZone),
      localEnd: wallClock(slot.endsAt, timeZone),
    })),
    nextAvailableAt: availability.nextAvailableAt?.toString() ?? null,
  };
};
