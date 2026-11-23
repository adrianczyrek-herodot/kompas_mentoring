import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import type { MentorAvailabilitySlots } from '../application/mentor-availability.ts';
import { toMentorAvailabilityView } from './mentor-availability.api.ts';

// U1/requirement 20: the engine answers in instants, the endpoint labels them in the viewer's zone
// (Q12). These are the same six instants of the 25.10.2026 example, seen from Warsaw and New York.

const slots = [
  '2026-10-24T23:30:00Z',
  '2026-10-25T00:00:00Z',
  '2026-10-25T00:30:00Z',
  '2026-10-25T01:00:00Z',
  '2026-10-25T01:30:00Z',
  '2026-10-25T02:00:00Z',
].map((startsAt) => ({
  startsAt: Temporal.Instant.from(startsAt),
  endsAt: Temporal.Instant.from(startsAt).add({ minutes: 30 }),
}));

const availability: MentorAvailabilitySlots = {
  mentorTimeZone: 'Europe/Warsaw',
  durationMinutes: 30,
  slots,
  nextAvailableAt: null,
};

describe('toMentorAvailabilityView', () => {
  it('labels the slots in the viewer zone and keeps the instants unchanged', () => {
    const view = toMentorAvailabilityView(availability, 'America/New_York');
    expect(view.timeZone).toBe('America/New_York');
    expect(view.mentorTimeZone).toBe('Europe/Warsaw');
    expect(view.slots[0]).toEqual({
      startsAt: '2026-10-24T23:30:00Z',
      endsAt: '2026-10-25T00:00:00Z',
      localStart: '2026-10-24T19:30',
      localEnd: '2026-10-24T20:00',
    });
    expect(view.slots.map((slot) => slot.localStart)).toEqual([
      '2026-10-24T19:30',
      '2026-10-24T20:00',
      '2026-10-24T20:30',
      '2026-10-24T21:00',
      '2026-10-24T21:30',
      '2026-10-24T22:00',
    ]);
  });

  it('falls back to the mentor zone for a missing or unknown viewer zone', () => {
    const mentorZone = toMentorAvailabilityView(availability, undefined);
    expect(mentorZone.timeZone).toBe('Europe/Warsaw');
    expect(mentorZone.slots[0]?.localStart).toBe('2026-10-25T01:30');
    expect(toMentorAvailabilityView(availability, 'Mars/Olympus').timeZone).toBe('Europe/Warsaw');
  });

  it('passes the booking window and the next free slot through', () => {
    const view = toMentorAvailabilityView(
      { ...availability, nextAvailableAt: Temporal.Instant.from('2026-10-26T09:00:00Z') },
      'Europe/Warsaw',
    );
    expect(view.nextAvailableAt).toBe('2026-10-26T09:00:00Z');
    expect(view.durationMinutes).toBe(30);
  });
});
