// Stan aplikacji demo w pamięci (bez backendu) — wspólny dla stron i panelu.
// Moduł żyje przez całą sesję karty: nawigacja klienta Next.js go nie resetuje, przeładowanie strony — tak (jak w mockupie).
import type { Role, Session, Thread } from '@devmentor/core/domain';
import { MENTORS, SESSIONS, THREADS, REQUESTS, APPLICATIONS, DISPUTES, NOTIFICATIONS } from '@devmentor/db/fixtures';

export interface BookingDraft {
  mentorId: string;
  startsAt?: string;
  durationMin: number;
  type: 'trial' | 'plan';
  holdExpires?: number;
}

export interface Subscription {
  mentorId: string;
  perWeek: number;
  durationMin: number;
  renewsOn: string;
  status: 'active' | 'paused';
}

export const store = {
  role: 'guest' as Role,
  loggedIn: false,
  returnTo: '' as string,
  favorites: new Set<string>(['m3']),
  draft: null as BookingDraft | null,
  sessions: [] as Session[],
  threads: [] as Thread[],
  requests: [...REQUESTS],
  applications: [...APPLICATIONS],
  disputes: [...DISPUTES],
  notifications: NOTIFICATIONS.map((n) => ({ ...n })),
  balances: {} as Record<string, number>,
  subscription: null as Subscription | null,
  goal: { text: 'Pierwsza praca jako frontend developer do marca 2027', target: '2027-03-31',
    milestones: [
      { text: 'Projekt portfolio #1 (sklep) po code review', done: true },
      { text: 'Projekt portfolio #2 z testami', done: false },
      { text: '2 próbne rozmowy techniczne', done: false },
      { text: '20 wysłanych aplikacji', done: false },
    ] },
  onboarding: { step: 1, status: 'draft' as 'draft' | 'submitted', data: {} as Record<string, string>, availability: new Set<string>(['0-18', '0-19', '2-18', '2-19', '5-10']) },
  mentorTemplate: new Set<string>(['0-9', '0-10', '0-17', '0-18', '1-17', '1-18', '1-19', '2-9', '2-10', '2-11', '3-18', '3-19', '4-8', '4-9', '4-16', '5-10', '5-11']),
  payoutDone: false,
  bookingSeq: 100,
};

export const mentorById = (id: string | undefined) => MENTORS.find((m) => m.id === id);
export const sessionById = (id: string | undefined) => store.sessions.find((s) => s.id === id);


/** Persona demo: uczeń z historią sesji, planem i saldem u Kasi. */
export function applyDemoStudent(): void {
  store.sessions = SESSIONS.map((s) => ({ ...s, actionItems: s.actionItems?.map((a) => ({ ...a })) }));
  store.threads = THREADS.map((t) => ({ ...t, messages: [...t.messages] }));
  store.balances = { m1: 3, m3: 0 };
  store.subscription = { mentorId: 'm1', perWeek: 1, durationMin: 60, renewsOn: '2026-11-03', status: 'active' };
}

/** Nowe konto po rejestracji: bez sesji, salda i planu. */
export function applyFreshStudent(): void {
  store.sessions = [];
  store.threads = [];
  store.balances = {};
  store.subscription = null;
}

applyDemoStudent();

// ---- Subskrypcja zmian (dla komponentów React) --------------------------------

const listeners = new Set<() => void>();
let version = 0;

/** Powiadamia subskrybentów (komponenty React) po zmianie `store` — wywoływane przez akcje z `actions.ts`. */
export function notify(): void {
  version++;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getVersion = (): number => version;
