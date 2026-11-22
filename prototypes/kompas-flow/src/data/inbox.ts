/**
 * Messages (S1) and notifications (S2). Threads and the student's notifications come from the grey
 * mockups (`THREADS`, `NOTIFICATIONS`); the mentor's and admin's notifications are derived from
 * the demo data (trial requests, applications, disputes), not invented — only their hour is a demo
 * assumption (the source has dates only).
 */
import type { AccountId, StudentId } from './accounts';

export type Message = {
  id: string;
  from: 'student' | 'mentor';
  text: string;
  /** ISO instant. */
  at: string;
  /** Sending failed (S1 Er): shown with „Ponów”. */
  failed?: boolean;
};

export type Thread = {
  id: string;
  studentId: StudentId;
  mentorId: string;
  messages: Message[];
  unread: { student: number; mentor: number };
};

export const INITIAL_THREADS: Thread[] = [
  {
    id: 't1',
    studentId: 'adrian',
    mentorId: 'm1',
    unread: { student: 1, mentor: 0 },
    messages: [
      { id: 't1-1', from: 'mentor', text: 'Cześć! Przed czwartkiem wrzuć proszę link do repo z formularzem, przejrzę go wcześniej.', at: '2026-10-19T19:12:00+02:00' },
      { id: 't1-2', from: 'student', text: 'Jasne, wrzucę jutro rano.', at: '2026-10-19T19:30:00+02:00' },
      { id: 't1-3', from: 'mentor', text: 'Super, dzięki. Dziś o 14:05 widzimy się w pokoju sesji.', at: '2026-10-20T09:02:00+02:00' },
    ],
  },
  {
    id: 't2',
    studentId: 'adrian',
    mentorId: 'm3',
    unread: { student: 0, mentor: 0 },
    messages: [
      { id: 't2-1', from: 'student', text: 'Dzień dobry, czy na sesji próbnej możemy omówić plan przejścia do ML?', at: '2026-10-18T10:00:00+02:00' },
      { id: 't2-2', from: 'mentor', text: 'Oczywiście. Przygotuj krótko, co już umiesz z Pythona i matematyki.', at: '2026-10-18T13:40:00+02:00' },
    ],
  },
];

/** Contact or payment details outside the platform (`domain.ts` OFF_PLATFORM) → S1 warning. */
export const OFF_PLATFORM = /(\+?\d[\d\s-]{7,}\d)|([^\s@]+@[^\s@]+\.[a-z]{2,})|(whatsapp|telegram|revolut|blik na)/i;

export type Notification = {
  id: string;
  accountId: AccountId;
  text: string;
  /** ISO instant. */
  at: string;
  /** Hash path (deep link, KONCEPCJA §3.2). */
  link: string;
  read: boolean;
};

export const INITIAL_NOTIFICATIONS: Notification[] = [
  // Grey mockups' NOTIFICATIONS (Adrian).
  { id: 'n1', accountId: 'adrian', text: 'Sesja z Kasią Nowicką zaczyna się za 5 minut', at: '2026-10-20T14:00:00+02:00', link: '/sesje/s1', read: false },
  { id: 'n2', accountId: 'adrian', text: 'Nowa wiadomość od Kasi Nowickiej', at: '2026-10-20T09:02:00+02:00', link: '/wiadomosci/t1', read: false },
  { id: 'n3', accountId: 'adrian', text: 'Oceń sesję próbną z 9 października', at: '2026-10-10T09:00:00+02:00', link: '/sesje/s5/ocena', read: true },
  { id: 'n4', accountId: 'adrian', text: 'Plan odnowiony: 4 sesje dodane do salda', at: '2026-10-06T08:00:00+02:00', link: '/plany', read: true },
  // Derived: Kasia's trial requests (REQUESTS r1, r2) and Julia's session today.
  { id: 'n5', accountId: 'kasia', text: 'Prośba o sesję próbną: Paweł R., 22 października 9:00', at: '2026-10-20T08:00:00+02:00', link: '/mentor', read: false },
  { id: 'n6', accountId: 'kasia', text: 'Prośba o sesję próbną: Iga T., 24 października 10:00', at: '2026-10-20T11:30:00+02:00', link: '/mentor', read: false },
  // Derived: Adam's application (APPLICATIONS a1, submitted 17.10).
  { id: 'n7', accountId: 'adam', text: 'Wniosek wysłany do weryfikacji — odpowiemy zwykle do 2 dni roboczych', at: '2026-10-17T12:00:00+02:00', link: '/mentor/onboarding/6', read: true },
  // Derived: the admin queues (APPLICATIONS, DISPUTES).
  { id: 'n8', accountId: 'admin', text: 'Nowy spór: Hanna P. — „Sesja niezgodna z opisem”', at: '2026-10-19T18:10:00+02:00', link: '/admin/spory', read: false },
  { id: 'n9', accountId: 'admin', text: 'Nowy wniosek mentora: Laura Bielecka (KYC: niezgodność)', at: '2026-10-19T09:00:00+02:00', link: '/admin/weryfikacja', read: false },
];
