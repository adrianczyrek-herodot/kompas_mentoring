import { describe, expect, it } from 'vitest';
import { BookingId, MentorId, newId } from './ids.ts';

describe('branded IDs', () => {
  it('generates time-ordered UUID v7 values', () => {
    const first = newId(BookingId);
    const second = newId(BookingId);
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(first < second).toBe(true);
  });

  it('parses only valid UUIDs at the system edge', () => {
    expect(MentorId.safeParse('not-an-id').success).toBe(false);
    expect(MentorId.safeParse('0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d10').success).toBe(true);
  });

  it('does not let a MentorId be used as a BookingId', () => {
    const mentorId = MentorId.parse('0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d10');
    // @ts-expect-error — brands differ, so this must not compile.
    const bookingId: BookingId = mentorId;
    expect(bookingId).toBe(mentorId);
  });
});
