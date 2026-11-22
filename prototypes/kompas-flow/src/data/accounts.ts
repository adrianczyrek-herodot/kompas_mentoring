/**
 * Demo accounts and their starting data. People, sessions, balances and texts come from the grey
 * mockups (`mockupy/src/mocks.ts`: SESSIONS, STUDENTS, REQUESTS, EARNINGS, APPLICATIONS).
 * „Ty” in the mockups' SESSIONS is Adrian C. (STUDENTS st1: next session today 14:05 with Kasia).
 */
import type { BookingStatus } from '@kompas/ui';

export type AccountId = 'guest' | 'adrian' | 'julia' | 'pawel' | 'new' | 'kasia' | 'adam' | 'admin';
export type Role = 'guest' | 'student' | 'mentor' | 'admin';

export type Account = {
  id: AccountId;
  role: Role;
  name: string;
  /** One line for the review bar: what this account is good for. */
  purpose: string;
  /** Mentor accounts: id in MENTORS. */
  mentorId?: string;
  /** Mentor accounts: false while the application waits for the trust team (KONCEPCJA §3.2). */
  approved?: boolean;
};

export const ACCOUNTS: Account[] = [
  { id: 'guest', role: 'guest', name: 'Gość', purpose: 'niezalogowany — P1–P4, bramka logowania' },
  {
    id: 'adrian',
    role: 'student',
    name: 'Adrian C.',
    purpose: 'plan 1×60 min/tydz., saldo 3, sesja dziś 14:05',
  },
  { id: 'julia', role: 'student', name: 'Julia M.', purpose: 'plan 2×60 min/tydz., saldo 5' },
  {
    id: 'pawel',
    role: 'student',
    name: 'Paweł R.',
    purpose: 'sesja próbna czeka na odpowiedź mentora',
  },
  {
    id: 'kasia',
    role: 'mentor',
    name: 'Kasia Nowicka',
    purpose: 'mentor z zatwierdzonym profilem',
    mentorId: 'm1',
    approved: true,
  },
  {
    id: 'adam',
    role: 'mentor',
    name: 'Adam Górski',
    purpose: 'wniosek mentora w weryfikacji',
    mentorId: 'm6',
    approved: false,
  },
  { id: 'admin', role: 'admin', name: 'Zespół zaufania', purpose: 'weryfikacja i spory' },
];

/** Account created by registration in P4 (F1 from zero): a student without any data. */
export const NEW_STUDENT: Account = {
  id: 'new',
  role: 'student',
  name: 'Nowe konto',
  purpose: 'założone w P4 — bez sesji i salda',
};

/**
 * Students. `iga` and `monika` have no demo account: they exist only on the mentor's side
 * (mockups' REQUESTS r2 and STUDENTS st4).
 */
export type StudentId = 'adrian' | 'julia' | 'pawel' | 'new' | 'iga' | 'monika';

export const STUDENT_NAMES: Record<Exclude<StudentId, 'new'>, string> = {
  adrian: 'Adrian C.',
  julia: 'Julia M.',
  pawel: 'Paweł R.',
  iga: 'Iga T.',
  monika: 'Monika K.',
};

export type ActionItem = { text: string; done: boolean; dueAt?: string };

/** U7 review (KONCEPCJA §U7). */
export type Review = {
  rating: number;
  tags: string[];
  publicText: string;
  privateText: string;
};

export type Booking = {
  id: string;
  mentorId: string;
  studentId: StudentId;
  startsAt: string;
  durationMin: 30 | 60;
  type: 'trial' | 'plan';
  status: BookingStatus;
  goal: string;
  note?: string;
  actionItems?: ActionItem[];
  reviewed?: boolean;
  review?: Review;
  /** Trial declined by the mentor (M2): the reason the student sees. */
  declineReason?: string;
  /** U7 after a trial: „Spróbuj z innym mentorem” (free replacement, Z2). */
  replacementRequested?: boolean;
};

export const INITIAL_BOOKINGS: Booking[] = [
  // Adrian — mockups' SESSIONS s1–s6.
  {
    id: 's1',
    mentorId: 'm1',
    studentId: 'adrian',
    startsAt: '2026-10-20T14:05:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'scheduled',
    goal: 'Review architektury komponentów w projekcie portfolio',
  },
  {
    id: 's2',
    mentorId: 'm1',
    studentId: 'adrian',
    startsAt: '2026-10-23T18:00:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'scheduled',
    goal: 'Testy jednostkowe hooków',
  },
  {
    id: 's3',
    mentorId: 'm3',
    studentId: 'adrian',
    startsAt: '2026-10-21T08:00:00+02:00',
    durationMin: 30,
    type: 'trial',
    status: 'scheduled',
    goal: 'Czy da się przejść z frontendu do ML w rok?',
  },
  {
    id: 's4',
    mentorId: 'm1',
    studentId: 'adrian',
    startsAt: '2026-10-18T18:00:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'completed',
    goal: 'Zarządzanie stanem w React',
    reviewed: true,
    note: 'Omówiliśmy, kiedy stan lokalny wystarcza, a kiedy potrzebny jest store. Twoje komponenty formularza robią za dużo — rozdziel walidację od prezentacji.',
    actionItems: [
      { text: 'Wydziel hook useCheckoutForm', done: true },
      { text: 'Przeczytaj dokumentację React o „lifting state up”', done: true },
      { text: 'Dodaj testy do walidacji formularza', done: false },
    ],
  },
  {
    id: 's5',
    mentorId: 'm1',
    studentId: 'adrian',
    startsAt: '2026-10-09T18:00:00+02:00',
    durationMin: 30,
    type: 'trial',
    status: 'completed',
    goal: 'Sesja próbna — ustalenie celu',
    reviewed: false,
    note: 'Cel: pierwsza praca jako frontend developer do marca 2027. Plan: portfolio (3 projekty), code review co tydzień, 2 próbne rozmowy techniczne.',
    actionItems: [{ text: 'Spisz listę 10 firm, do których chcesz aplikować', done: true }],
  },
  {
    id: 's6',
    mentorId: 'm5',
    studentId: 'adrian',
    startsAt: '2026-10-02T17:00:00+02:00',
    durationMin: 30,
    type: 'trial',
    status: 'cancelled',
    goal: 'Konsultacja portfolio',
  },
  // Julia — STUDENTS st2 (next session today 17:00) and her EARNINGS rows with Kasia.
  {
    id: 'j1',
    mentorId: 'm1',
    studentId: 'julia',
    startsAt: '2026-10-20T17:00:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'scheduled',
    goal: 'Awans na mid w obecnej firmie',
  },
  {
    id: 'j2',
    mentorId: 'm1',
    studentId: 'julia',
    startsAt: '2026-10-19T17:00:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'completed',
    goal: 'Awans na mid w obecnej firmie',
    reviewed: true,
  },
  {
    id: 'j3',
    mentorId: 'm1',
    studentId: 'julia',
    startsAt: '2026-10-17T17:00:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'completed',
    goal: 'Awans na mid w obecnej firmie',
    reviewed: true,
  },
  // Paweł — REQUESTS r1: trial request waiting for Kasia.
  {
    id: 'r1',
    mentorId: 'm1',
    studentId: 'pawel',
    startsAt: '2026-10-22T09:00:00+02:00',
    durationMin: 30,
    type: 'trial',
    status: 'requested',
    goal: 'Mam rozmowę techniczną za 2 tygodnie w scale-upie, chcę przećwiczyć zadanie live coding w React.',
  },
  // Mentor side only — REQUESTS r2 and the EARNINGS rows of Kasia (Monika K. 14.10, Julia M. 8.10).
  // EARNINGS have dates only; the hour follows Julia's usual 17:00 and Adrian's 18:00.
  {
    id: 'r2',
    mentorId: 'm1',
    studentId: 'iga',
    startsAt: '2026-10-24T10:00:00+02:00',
    durationMin: 30,
    type: 'trial',
    status: 'requested',
    goal: 'Uczę się sama od pół roku, nie wiem, czy mój kod jest „produkcyjny”.',
  },
  {
    id: 'k1',
    mentorId: 'm1',
    studentId: 'monika',
    startsAt: '2026-10-14T18:00:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'completed',
    goal: 'Nauka TypeScript',
    reviewed: true,
  },
  {
    id: 'j4',
    mentorId: 'm1',
    studentId: 'julia',
    startsAt: '2026-10-08T17:00:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'completed',
    goal: 'Awans na mid w obecnej firmie',
    reviewed: true,
  },
];

/** Prepaid session credits per student and mentor (STUDENTS: Adrian 3, Julia 5). */
export const INITIAL_BALANCES: Record<StudentId, Record<string, number>> = {
  adrian: { m1: 3 },
  julia: { m1: 5 },
  pawel: {},
  new: {},
  iga: {},
  monika: {},
};

