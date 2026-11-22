/**
 * Mentor side of stage 2 (M2–M5) for Kasia Nowicka (m1). Values from the grey mockups:
 * `STUDENTS`, `EARNINGS`, `store.ts` mentorTemplate, `domain.ts` commissionRate / nextTier and
 * `screens/mentor.ts` (176 h worked, payout minimum 100 zł, IBAN ending 4420, private note).
 * Amounts in grosze (`bigint`).
 */
import type { StudentId } from './accounts';
import { mentorById } from './mentors';

const zl = (value: number) => BigInt(value) * 100n;

/** Mentor's view of a student (STUDENTS). The goal of Adrian and Julia lives in the demo state. */
export type MentorStudent = {
  studentId: Exclude<StudentId, 'new'>;
  status: 'active' | 'trial' | 'inactive';
  /** Sessions with this mentor so far (STUDENTS.sessions). */
  sessionsCount: number;
  /** Plan label as in the mockups, for students without a subscription in the demo state. */
  planLabel: string;
  goal: string;
};

export const KASIA_STUDENTS: MentorStudent[] = [
  { studentId: 'adrian', status: 'active', sessionsCount: 6, planLabel: '1×60 min / tydz.', goal: 'Pierwsza praca jako frontend dev do marca 2027' },
  { studentId: 'julia', status: 'active', sessionsCount: 14, planLabel: '2×60 min / tydz.', goal: 'Awans na mid w obecnej firmie' },
  { studentId: 'pawel', status: 'trial', sessionsCount: 0, planLabel: '—', goal: 'Przygotowanie do rozmowy w scale-upie' },
  { studentId: 'monika', status: 'inactive', sessionsCount: 4, planLabel: 'anulowany', goal: 'Nauka TypeScript' },
];

/** Private notes of the mentor (M4, „Widzisz tylko Ty”). */
export const INITIAL_MENTOR_NOTES: Partial<Record<StudentId, string>> = {
  adrian: 'Mocny w CSS, słabszy w testach. Motywuje go konkretny termin.',
};

export type EarningStatus = 'available' | 'pending' | 'paid' | 'in-transit';

export type Earning = {
  id: string;
  mentorId: string;
  bookingId?: string;
  /** Calendar date `YYYY-MM-DD`. */
  date: string;
  studentName: string;
  type: 'Plan 60 min' | 'Plan 30 min' | 'Sesja próbna';
  gross: bigint;
  fee: bigint;
  status: EarningStatus;
};

export const INITIAL_EARNINGS: Earning[] = [
  { id: 'e1', mentorId: 'm1', bookingId: 'j2', date: '2026-10-19', studentName: 'Julia M.', type: 'Plan 60 min', gross: zl(180), fee: zl(36), status: 'pending' },
  { id: 'e2', mentorId: 'm1', bookingId: 'j3', date: '2026-10-17', studentName: 'Julia M.', type: 'Plan 60 min', gross: zl(180), fee: zl(36), status: 'available' },
  { id: 'e3', mentorId: 'm1', bookingId: 's4', date: '2026-10-18', studentName: 'Adrian C.', type: 'Plan 60 min', gross: zl(180), fee: zl(36), status: 'available' },
  { id: 'e4', mentorId: 'm1', bookingId: 'k1', date: '2026-10-14', studentName: 'Monika K.', type: 'Plan 60 min', gross: zl(180), fee: zl(36), status: 'available' },
  // A trial goes to the platform in full (Z5).
  { id: 'e5', mentorId: 'm1', bookingId: 's5', date: '2026-10-09', studentName: 'Adrian C.', type: 'Sesja próbna', gross: zl(49), fee: zl(49), status: 'paid' },
  { id: 'e6', mentorId: 'm1', bookingId: 'j4', date: '2026-10-08', studentName: 'Julia M.', type: 'Plan 60 min', gross: zl(180), fee: zl(36), status: 'paid' },
];

export const PAYOUT_MINIMUM = zl(100);
export const PAYOUT_ACCOUNT = 'PL61 •••• •••• 4420';

export type Payout = { id: string; mentorId: string; at: string; amount: bigint };

/** Hours worked by Kasia (grey M5). */
export const KASIA_HOURS = 176;

/** Platform commission falling with hours worked (`domain.ts`, working values of Z5), in percent. */
export function commissionPercent(hours: number): number {
  if (hours < 20) return 33;
  if (hours < 50) return 28;
  if (hours < 200) return 20;
  return 18;
}

export function nextTier(hours: number): number | null {
  return [20, 50, 200].find((tier) => tier > hours) ?? null;
}

/** Weekday (0 = Monday) → start hours, mentor's local time. */
export type Availability = Record<number, number[]>;

export type AvailabilityException = {
  id: string;
  /** Calendar dates `YYYY-MM-DD`, inclusive. */
  from: string;
  to: string;
  type: 'off' | 'extra';
  label: string;
};

export type MentorSettings = {
  template: Availability;
  exceptions: AvailabilityException[];
  /** KONCEPCJA §M3: 2–48 h. */
  minNoticeHours: number;
  /** KONCEPCJA §M3: 0–30 min. */
  bufferMin: number;
  acceptingNew: boolean;
  googleCalendar: 'off' | 'connected' | 'error';
};

/**
 * Starting settings: the template is the mentor's availability from `mentors.ts` (for Kasia the
 * grey `mentorTemplate`), minimum notice 6 h (`domain.ts` MIN_NOTICE_HOURS).
 */
export function initialSettings(mentorId: string): MentorSettings {
  return {
    template: { ...(mentorById(mentorId)?.availability ?? {}) },
    exceptions: [],
    minNoticeHours: 6,
    bufferMin: 0,
    acceptingNew: true,
    googleCalendar: 'off',
  };
}
