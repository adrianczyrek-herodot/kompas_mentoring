import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { BookingId, MentorId, StudentId } from '../../../shared/domain/index.ts';
import type { Booking } from '../domain/booking.entity.ts';
import { toIcs } from './ics.ts';

const booking: Booking = {
  id: BookingId.parse('018f0000-0000-7000-8000-000000000001'),
  mentorId: MentorId.parse('018f0000-0000-7000-8000-000000000002'),
  studentId: StudentId.parse('018f0000-0000-7000-8000-000000000003'),
  type: 'trial',
  status: 'requested',
  startsAt: Temporal.Instant.from('2027-01-04T08:00:00Z'),
  endsAt: Temporal.Instant.from('2027-01-04T08:30:00Z'),
  bufferMinutes: 0,
  holdExpiresAt: null,
  goal: 'Przygotowanie do rozmowy.',
  price: null,
  paymentMode: 'none',
  acceptDeadlineAt: null,
  declineReason: null,
  declineComment: null,
  cancelledBy: null,
  cancelReason: null,
  rescheduleCount: 2,
  version: 1,
  createdAt: Temporal.Instant.from('2027-01-01T10:00:00Z'),
  updatedAt: Temporal.Instant.from('2027-01-01T10:00:00Z'),
};

describe('toIcs (requirement 6)', () => {
  it('uses the booking id as UID and the reschedule count as SEQUENCE', () => {
    const { filename, content } = toIcs(booking);
    expect(filename).toBe('kompas-018f0000-0000-7000-8000-000000000001.ics');
    expect(content).toContain('UID:018f0000-0000-7000-8000-000000000001@kompas\r\n');
    expect(content).toContain('SEQUENCE:2\r\n');
  });

  it('writes DTSTART and DTEND as UTC instants', () => {
    const { content } = toIcs(booking);
    expect(content).toContain('DTSTART:20270104T080000Z\r\n');
    expect(content).toContain('DTEND:20270104T083000Z\r\n');
    expect(content.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});
