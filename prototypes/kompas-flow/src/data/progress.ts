/**
 * Student side of stage 2: goal and milestones (U9), plans (U8) and payment history. Values come
 * from the grey mockups (`store.ts` goal and subscription, `screens/student.ts` payment rows,
 * `domain.ts` planPrice / transferSessions). Amounts in grosze (`bigint`).
 */
import type { StudentId } from './accounts';
import { mentorById } from './mentors';

export type Milestone = { text: string; done: boolean };

export type Goal = {
  text: string;
  /** Calendar date `YYYY-MM-DD`, or undefined when the goal has no deadline yet. */
  targetDate?: string;
  milestones: Milestone[];
};

export const INITIAL_GOALS: Partial<Record<StudentId, Goal>> = {
  adrian: {
    text: 'Pierwsza praca jako frontend developer do marca 2027',
    targetDate: '2027-03-31',
    milestones: [
      { text: 'Projekt portfolio #1 (sklep) po code review', done: true },
      { text: 'Projekt portfolio #2 z testami', done: false },
      { text: '2 próbne rozmowy techniczne', done: false },
      { text: '20 wysłanych aplikacji', done: false },
    ],
  },
  // Mockups' STUDENTS st2 — goal text only, no deadline or milestones in the source.
  julia: { text: 'Awans na mid w obecnej firmie', milestones: [] },
};

export type PlanStatus = 'active' | 'paused' | 'cancelled';

export type Subscription = {
  id: string;
  studentId: StudentId;
  mentorId: string;
  perWeek: number;
  durationMin: 30 | 60;
  /** Calendar date `YYYY-MM-DD` of the next 4-week renewal. */
  renewsOn: string;
  status: PlanStatus;
  /** „Zmień plan” applies from the next period (KONCEPCJA §U8). */
  nextPeriod?: { perWeek: number; durationMin: 30 | 60 };
};

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-adrian', studentId: 'adrian', mentorId: 'm1', perWeek: 1, durationMin: 60, renewsOn: '2026-11-03', status: 'active' },
  // Julia's plan (STUDENTS st2: 2×60 min / tydz.); the mockups give no renewal date — same cycle as Adrian.
  { id: 'sub-julia', studentId: 'julia', mentorId: 'm1', perWeek: 2, durationMin: 60, renewsOn: '2026-11-03', status: 'active' },
];

/** Plan options of the grey mockups (`PLAN_OPTIONS`): sessions per week. */
export const PLAN_PER_WEEK = [1, 2, 3, 5] as const;
export const PLAN_WEEKS = 4;

/** Price of a 4-week plan: 30 min costs half of the 60-minute rate (`domain.ts` planPrice). */
export function planPrice(rate60: bigint, perWeek: number, durationMin: 30 | 60): bigint {
  const perSession = durationMin === 60 ? rate60 : rate60 / 2n;
  return perSession * BigInt(perWeek * PLAN_WEEKS);
}

/** Moving prepaid sessions to another mentor: value recalculated at the new rate, rounded down. */
export function transferSessions(sessions: number, fromMentorId: string, toMentorId: string): number {
  const from = mentorById(fromMentorId)?.rate60 ?? 0n;
  const to = mentorById(toMentorId)?.rate60 ?? 0n;
  if (to === 0n) return 0;
  return Number((BigInt(sessions) * from) / to);
}

export type Payment = {
  id: string;
  studentId: StudentId;
  /** ISO instant. */
  at: string;
  description: string;
  amount: bigint;
  /** Negative entries are refunds. */
  kind: 'payment' | 'refund';
};

const zl = (value: number) => BigInt(value) * 100n;

/** Adrian's payment history from the grey U8 (plan 720 zł, trials 49 zł + 3 zł fee). */
export const INITIAL_PAYMENTS: Payment[] = [
  { id: 'pay-1', studentId: 'adrian', at: '2026-10-06T08:00:00+02:00', description: 'Plan 1×60 min · Kasia Nowicka', amount: zl(720), kind: 'payment' },
  { id: 'pay-2', studentId: 'adrian', at: '2026-10-09T12:00:00+02:00', description: 'Sesja próbna · Kasia Nowicka', amount: zl(52), kind: 'payment' },
  { id: 'pay-3', studentId: 'adrian', at: '2026-10-18T12:00:00+02:00', description: 'Sesja próbna · Ewa Sadowska', amount: zl(52), kind: 'payment' },
];

/** Review tags of the grey U7. */
export const REVIEW_TAGS = ['konkretny/a', 'dobrze przygotowany/a', 'cierpliwy/a', 'praktyczne przykłady', 'jasne zadania'];
