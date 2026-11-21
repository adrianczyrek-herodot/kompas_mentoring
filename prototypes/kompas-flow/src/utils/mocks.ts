// Mock data for the prototype - based on kompas-mentoring/mockupy/src/mocks.ts

import { StudentPersona, MentorPersona } from './types';

export const DEMO_NOW = new Date('2026-10-20T14:00:00+02:00');

export const CATEGORIES = [
  'Frontend', 'Backend', 'Data & AI', 'Product Management', 'UX/UI Design',
  'Kariera w IT', 'DevOps & Cloud', 'Przywództwo',
];

export interface Mentor {
  id: string;
  name: string;
  headline: string;
  bio: string;
  country: string;
  languages: string[];
  categories: string[];
  tags: string[];
  yearsExp: number;
  companies: string[];
  rate60: number;
  trialPrice: number;
  rating: number;
  reviewsCount: number;
  sessions: number;
  returningPct: number;
  responseHours: number;
  verified: boolean;
  acceptingNew: boolean;
  hue: number;
  reviews: Review[];
  availability: Record<number, number[]>;
}

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
  tags: string[];
}

const stdAvailability = { 0: [9, 10, 17, 18], 1: [17, 18, 19], 2: [9, 10, 11], 3: [18, 19], 4: [8, 9, 16], 5: [10, 11], 6: [] };

export const MENTORS: Mentor[] = [
  {
    id: 'm1', name: 'Kasia Nowicka', headline: 'Senior Frontend Engineer · React, TypeScript, architektura UI',
    bio: 'Od 9 lat buduję aplikacje webowe — od startupów po produkty z milionami użytkowników. Pomagam juniorom przejść z „działa” do „jest utrzymywalne”: code review, architektura komponentów, przygotowanie do rozmów technicznych. Na pierwszej sesji ustalamy cel i plan na 8 tygodni.',
    country: 'Polska', languages: ['polski', 'angielski'], categories: ['Frontend', 'Kariera w IT'],
    tags: ['React', 'TypeScript', 'Next.js', 'Code review', 'Rozmowy techniczne'], yearsExp: 9,
    companies: ['Allegro', 'Brainly'], rate60: 180, trialPrice: 49, rating: 4.9, reviewsCount: 87, sessions: 642,
    returningPct: 82, responseHours: 2, verified: true, acceptingNew: true, hue: 168,
    reviews: [
      { author: 'Michał', rating: 5, date: '2026-10-02', text: 'Po trzech sesjach przepisałem swój projekt portfolio i dostałem pierwszą ofertę. Konkretne uwagi, zero lania wody.', tags: ['konkretna', 'dobrze przygotowana'] },
      { author: 'Ola', rating: 5, date: '2026-09-18', text: 'Świetnie tłumaczy, dlaczego coś jest problemem, zamiast dawać gotowe rozwiązanie.', tags: ['cierpliwa'] },
      { author: 'Piotr', rating: 4, date: '2026-09-01', text: 'Bardzo dobra sesja próbna, chciałbym więcej wolnych terminów wieczorem.', tags: ['konkretna'] },
    ],
    availability: stdAvailability,
  },
  {
    id: 'm2', name: 'Tomasz Wierzbicki', headline: 'Engineering Manager · od developera do lidera zespołu',
    bio: 'Prowadzę zespoły od 6 lat. Pracuję z osobami, które dostały pierwszy awans na lidera albo chcą go dostać: rozmowy 1:1, feedback, delegowanie, rozmowy o podwyżce.',
    country: 'Polska', languages: ['polski'], categories: ['Przywództwo', 'Kariera w IT'],
    tags: ['Leadership', '1:1', 'Feedback', 'Awans'], yearsExp: 14, companies: ['Netguru', 'DocPlanner'],
    rate60: 240, trialPrice: 59, rating: 4.8, reviewsCount: 41, sessions: 310, returningPct: 76, responseHours: 5,
    verified: true, acceptingNew: true, hue: 28,
    reviews: [{ author: 'Agnieszka', rating: 5, date: '2026-10-10', text: 'Pierwszy raz ktoś rozłożył mi delegowanie na konkretne kroki.', tags: ['praktyczny'] }],
    availability: { 0: [19, 20], 1: [], 2: [19, 20], 3: [7, 8], 4: [], 5: [9, 10, 11], 6: [] },
  },
  {
    id: 'm3', name: 'Ewa Sadowska', headline: 'Data Scientist · ML w produkcji, Python, przebranżowienie',
    bio: 'Przeszłam z finansów do data science i wiem, jak wygląda ta droga. Pomagam zbudować portfolio projektów ML, które rekruterzy faktycznie czytają.',
    country: 'Polska', languages: ['polski', 'angielski'], categories: ['Data & AI', 'Kariera w IT'],
    tags: ['Python', 'Machine Learning', 'SQL', 'Portfolio', 'LLM'], yearsExp: 7, companies: ['ING Tech', 'Revolut'],
    rate60: 200, trialPrice: 49, rating: 5.0, reviewsCount: 23, sessions: 128, returningPct: 88, responseHours: 3,
    verified: true, acceptingNew: true, hue: 262,
    reviews: [{ author: 'Kuba', rating: 5, date: '2026-10-12', text: 'Plan nauki dopasowany do mojego czasu, a nie z YouTube.', tags: ['konkretna'] }],
    availability: { 0: [12, 13], 1: [12, 13], 2: [], 3: [12, 13, 18], 4: [12], 5: [], 6: [10] },
  },
  {
    id: 'm4', name: 'Marek Lis', headline: 'Staff Backend Engineer · Java, Kotlin, systemy rozproszone',
    bio: 'Projektuję systemy, które obsługują duży ruch. Uczę myślenia o skalowalności, testowaniu i projektowaniu API.',
    country: 'Polska', languages: ['polski', 'angielski'], categories: ['Backend', 'DevOps & Cloud'],
    tags: ['Java', 'Kotlin', 'Kafka', 'System design', 'AWS'], yearsExp: 12, companies: ['OLX', 'Zalando'],
    rate60: 260, trialPrice: 59, rating: 4.7, reviewsCount: 56, sessions: 401, returningPct: 70, responseHours: 12,
    verified: true, acceptingNew: false, hue: 210,
    reviews: [{ author: 'Bartek', rating: 5, date: '2026-09-22', text: 'System design przerobiony na prawdziwych przykładach.', tags: ['ekspert'] }],
    availability: { 0: [], 1: [20], 2: [], 3: [20], 4: [], 5: [], 6: [] },
  },
  {
    id: 'm5', name: 'Natalia Kurek', headline: 'Product Designer · UX research, portfolio, Figma',
    bio: 'Pomagam projektantkom i projektantom zbudować portfolio, które pokazuje proces, a nie tylko ładne ekrany.',
    country: 'Polska', languages: ['polski'], categories: ['UX/UI Design'],
    tags: ['Figma', 'UX research', 'Portfolio', 'Design systems'], yearsExp: 6, companies: ['Booksy'],
    rate60: 150, trialPrice: 39, rating: 4.9, reviewsCount: 34, sessions: 215, returningPct: 79, responseHours: 4,
    verified: true, acceptingNew: true, hue: 330,
    reviews: [{ author: 'Zuza', rating: 5, date: '2026-10-05', text: 'Case study z portfolio wreszcie ma sens.', tags: ['konkretna'] }],
    availability: stdAvailability,
  },
];

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'disputed' | 'requested';

export interface Session {
  id: string;
  mentorId: string;
  student: string;
  startsAt: string;
  durationMin: number;
  type: 'trial' | 'plan';
  status: SessionStatus;
  goal: string;
  note?: string;
  actionItems?: { text: string; done: boolean }[];
  reviewed?: boolean;
}

export const SESSIONS: Session[] = [
  { id: 's1', mentorId: 'm1', student: 'Ty', startsAt: '2026-10-20T14:05:00+02:00', durationMin: 60, type: 'plan', status: 'scheduled', goal: 'Review architektury komponentów w projekcie portfolio' },
  { id: 's2', mentorId: 'm1', student: 'Ty', startsAt: '2026-10-23T18:00:00+02:00', durationMin: 60, type: 'plan', status: 'scheduled', goal: 'Testy jednostkowe hooków' },
  { id: 's3', mentorId: 'm3', student: 'Ty', startsAt: '2026-10-21T08:00:00+02:00', durationMin: 30, type: 'trial', status: 'scheduled', goal: 'Czy da się przejść z frontendu do ML w rok?' },
  { id: 's4', mentorId: 'm1', student: 'Ty', startsAt: '2026-10-18T18:00:00+02:00', durationMin: 60, type: 'plan', status: 'completed', goal: 'Zarządzanie stanem w React', reviewed: true,
    note: 'Omówiliśmy, kiedy stan lokalny wystarcza, a kiedy potrzebny jest store. Twoje komponenty formularza robią za dużo — rozdziel walidację od prezentacji.',
    actionItems: [{ text: 'Wydziel hook useCheckoutForm', done: true }, { text: 'Przeczytaj dokumentację React o „lifting state up”', done: true }, { text: 'Dodaj testy do walidacji formularza', done: false }] },
  { id: 's5', mentorId: 'm1', student: 'Ty', startsAt: '2026-10-09T18:00:00+02:00', durationMin: 30, type: 'trial', status: 'completed', goal: 'Sesja próbna — ustalenie celu', reviewed: false,
    note: 'Cel: pierwsza praca jako frontend developer do marca 2027. Plan: portfolio (3 projekty), code review co tydzień, 2 próbne rozmowy techniczne.',
    actionItems: [{ text: 'Spisz listę 10 firm, do których chcesz aplikować', done: true }] },
  { id: 's6', mentorId: 'm5', student: 'Ty', startsAt: '2026-10-02T17:00:00+02:00', durationMin: 30, type: 'trial', status: 'cancelled', goal: 'Konsultacja portfolio' },
];

export interface Thread {
  id: string;
  withName: string;
  hue: number;
  unread: number;
  messages: { me: boolean; text: string; at: string }[];
}

export const THREADS: Thread[] = [
  { id: 't1', withName: 'Kasia Nowicka', hue: 168, unread: 1, messages: [
    { me: false, text: 'Cześć! Przed czwartkiem wrzuć proszę link do repo z formularzem, przejrzę go wcześniej.', at: '2026-10-19T19:12:00+02:00' },
    { me: true, text: 'Jasne, wrzucę jutro rano.', at: '2026-10-19T19:30:00+02:00' },
    { me: false, text: 'Super, dzięki. Dziś o 14:05 widzimy się w pokoju sesji.', at: '2026-10-20T09:02:00+02:00' },
  ] },
  { id: 't2', withName: 'Ewa Sadowska', hue: 262, unread: 0, messages: [
    { me: true, text: 'Dzień dobry, czy na sesji próbnej możemy omówić plan przejścia do ML?', at: '2026-10-18T10:00:00+02:00' },
    { me: false, text: 'Oczywiście. Przygotuj krótko, co już umiesz z Pythona i matematyki.', at: '2026-10-18T13:40:00+02:00' },
  ] },
];

export interface TrialRequest {
  id: string;
  student: string;
  startsAt: string;
  goal: string;
  hue: number;
}

export const REQUESTS: TrialRequest[] = [
  { id: 'r1', student: 'Paweł R.', startsAt: '2026-10-22T09:00:00+02:00', goal: 'Mam rozmowę techniczną za 2 tygodnie w scale-upie, chcę przećwiczyć zadanie live coding w React.', hue: 190 },
  { id: 'r2', student: 'Iga T.', startsAt: '2026-10-24T10:00:00+02:00', goal: 'Uczę się sama od pół roku, nie wiem, czy mój kod jest „produkcyjny”.', hue: 140 },
];

export interface Notification {
  text: string;
  at: string;
  link: string;
  unread: boolean;
}

export const NOTIFICATIONS: Notification[] = [
  { text: 'Sesja z Kasią Nowicką zaczyna się za 5 minut', at: '2026-10-20T14:00:00+02:00', link: '#/sesje/s1', unread: true },
  { text: 'Nowa wiadomość od Kasi Nowickiej', at: '2026-10-20T09:02:00+02:00', link: '#/wiadomosci/t1', unread: true },
  { text: 'Oceń sesję próbną z 9 października', at: '2026-10-10T09:00:00+02:00', link: '#/sesje/s5/ocena', unread: false },
  { text: 'Plan odnowiony: 4 sesje dodane do salda', at: '2026-10-06T08:00:00+02:00', link: '#/plany', unread: false },
];

export const PLAN_OPTIONS = [1, 2, 3, 5];

export const DURATION_OPTIONS = [30, 60];

// Helper functions
export const mentorById = (id: string) => MENTORS.find((m) => m.id === id);
export const sessionById = (id: string) => SESSIONS.find((s) => s.id === id);
export const threadById = (id: string) => THREADS.find((t) => t.id === id);

// Slot generation (from domain.ts)
export const MIN_NOTICE_HOURS = 6;
export const HOLD_MINUTES = 10;

export interface Slot { iso: string; taken: boolean; holdExpires?: number; }

const startOfWeek = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};

export function weekSlots(mentor: Mentor, weekOffset: number, now = DEMO_NOW): { day: Date; slots: Slot[] }[] {
  const start = startOfWeek(now);
  start.setDate(start.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const slots = (mentor.availability[i] ?? [])
      .map((h) => {
        const d = new Date(day);
        d.setHours(h, 0, 0, 0);
        return d;
      })
      .filter((d) => d.getTime() - now.getTime() >= MIN_NOTICE_HOURS * 36e5)
      .map((d) => ({ iso: d.toISOString(), taken: (d.getDate() * 7 + d.getHours() + mentor.id.length) % 5 === 0 }));
    return { day, slots };
  });
}

export function nextFreeWeek(mentor: Mentor, from: number): number | null {
  for (let w = from + 1; w < from + 6; w++) {
    if (weekSlots(mentor, w).some((d) => d.slots.some((s) => !s.taken))) return w;
  }
  return null;
}

export const FREE_CANCEL_HOURS = 12;
export const JOIN_BEFORE_MIN = 10;

export function canCancelFree(session: Session, now = DEMO_NOW): boolean {
  return new Date(session.startsAt).getTime() - now.getTime() >= FREE_CANCEL_HOURS * 36e5;
}

export function canJoin(session: Session, now = DEMO_NOW): boolean {
  const start = new Date(session.startsAt).getTime();
  return session.status === 'scheduled' && now.getTime() >= start - JOIN_BEFORE_MIN * 6e4 && now.getTime() <= start + session.durationMin * 6e4;
}

export function hasStarted(session: Session, now = DEMO_NOW): boolean {
  return new Date(session.startsAt).getTime() <= now.getTime();
}

// Formatting helpers
export function formatMoney(amount: number, currency = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

export function formatDateTime(iso: string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Date(iso).toLocaleString('pl-PL', {
    timeZone: 'Europe/Warsaw',
    ...options,
  });
}

export function formatTime(iso: string): string {
  return formatDateTime(iso, { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(iso: string): string {
  return formatDateTime(iso, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDayName(date: Date): string {
  return date.toLocaleString('pl-PL', { weekday: 'short' });
}

export function formatDayNumber(date: Date): string {
  return date.toLocaleString('pl-PL', { day: '2-digit' });
}

export interface StudentPersona {
  id: string;
  name: string;
  goal: string;
  plan: string;
  balance: number;
  nextSession?: string;
  hue: number;
}

export interface MentorPersona {
  id: string;
  name: string;
  headline: string;
  verified: boolean;
  acceptingNew: boolean;
  hue: number;
}

export const STUDENT_PERSONAS: StudentPersona[] = [
  {
    id: 'st1',
    name: 'Adrian C.',
    goal: 'Pierwsza praca jako frontend developer do marca 2027',
    plan: '1×60 min / tydz.',
    balance: 3,
    nextSession: '2026-10-20T14:05:00+02:00',
    hue: 12,
  },
  {
    id: 'st2',
    name: 'Julia M.',
    goal: 'Awans na mid w obecnej firmie',
    plan: '2×60 min / tydz.',
    balance: 5,
    nextSession: '2026-10-20T17:00:00+02:00',
    hue: 300,
  },
  {
    id: 'st3',
    name: 'Paweł R.',
    goal: 'Przygotowanie do rozmowy w scale-upie',
    plan: '—',
    balance: 0,
    hue: 190,
  },
];

export const MENTOR_PERSONAS: MentorPersona[] = [
  {
    id: 'm1',
    name: 'Kasia Nowicka',
    headline: 'Senior Frontend Engineer · React, TypeScript, architektura UI',
    verified: true,
    acceptingNew: true,
    hue: 168,
  },
];