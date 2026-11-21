// Core types for the prototype

export type Role = 'guest' | 'student' | 'mentor' | 'admin';

export type ViewState = 'success' | 'loading' | 'empty' | 'error';

export type PaymentSimulation = 'success' | 'declined' | '3ds_interrupted' | 'hold_expired';

export type ScreenId =
  | 'P1' | 'P2' | 'P3' | 'P4'
  | 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6' | 'U7' | 'U8' | 'U9'
  | 'S1' | 'S2' | 'S3'
  | 'M1' | 'M2' | 'M3' | 'M4' | 'M5'
  | 'A1' | 'A2';

// Re-export all data types and constants from mocks
export type { 
  Session, 
  Thread, 
  Notification, 
  TrialRequest, 
  Review, 
  Mentor, 
  StudentPersona, 
  MentorPersona,
  SessionStatus,
} from './mocks';

export { 
  CATEGORIES,
  MENTORS,
  SESSIONS,
  THREADS,
  NOTIFICATIONS,
  REQUESTS,
  STUDENT_PERSONAS,
  MENTOR_PERSONAS,
  PLAN_OPTIONS,
  DURATION_OPTIONS,
  mentorById,
  sessionById,
  threadById,
  weekSlots,
  nextFreeWeek,
  canCancelFree,
  canJoin,
  hasStarted,
  FREE_CANCEL_HOURS,
  JOIN_BEFORE_MIN,
  MIN_NOTICE_HOURS,
  HOLD_MINUTES,
  formatMoney,
  formatDateTime,
  formatTime,
  formatDate,
  formatDayName,
  formatDayNumber,
} from './mocks';

export { DEMO_NOW } from './mocks';

export interface ScreenDefinition {
  id: ScreenId;
  title: string;
  path: string;
  access: 'public' | 'student' | 'mentor' | 'admin' | 'auth';
  roles: Role[];
}

export const SCREENS: ScreenDefinition[] = [
  { id: 'P1', title: 'Strona główna', path: '/', access: 'public', roles: ['guest', 'student', 'mentor', 'admin'] },
  { id: 'P2', title: 'Wyszukiwarka mentorów', path: '/mentorzy', access: 'public', roles: ['guest', 'student', 'mentor', 'admin'] },
  { id: 'P3', title: 'Profil mentora', path: '/mentorzy/:id', access: 'public', roles: ['guest', 'student', 'mentor', 'admin'] },
  { id: 'P4', title: 'Logowanie / Rejestracja', path: '/logowanie', access: 'public', roles: ['guest'] },
  { id: 'U1', title: 'Wybór terminu', path: '/rezerwacja/:mentorId', access: 'student', roles: ['student'] },
  { id: 'U2', title: 'Checkout', path: '/rezerwacja/:mentorId/platnosc', access: 'student', roles: ['student'] },
  { id: 'U3', title: 'Potwierdzenie rezerwacji', path: '/potwierdzenie/:id', access: 'student', roles: ['student'] },
  { id: 'U4', title: 'Moje sesje', path: '/sesje', access: 'student', roles: ['student'] },
  { id: 'U5', title: 'Szczegóły sesji', path: '/sesje/:id', access: 'student', roles: ['student'] },
  { id: 'U6', title: 'Pokój sesji', path: '/sesje/:id/pokoj', access: 'student', roles: ['student'] },
  { id: 'U7', title: 'Ocena sesji', path: '/sesje/:id/ocena', access: 'student', roles: ['student'] },
  { id: 'U8', title: 'Plany i saldo', path: '/plany', access: 'student', roles: ['student'] },
  { id: 'U9', title: 'Postępy', path: '/postepy', access: 'student', roles: ['student'] },
  { id: 'S1', title: 'Wiadomości', path: '/wiadomosci', access: 'auth', roles: ['student', 'mentor', 'admin'] },
  { id: 'S2', title: 'Powiadomienia', path: '/powiadomienia', access: 'auth', roles: ['student', 'mentor', 'admin'] },
  { id: 'S3', title: 'Konto i ustawienia', path: '/konto', access: 'auth', roles: ['student', 'mentor', 'admin'] },
  { id: 'M1', title: 'Onboarding mentora', path: '/mentor/onboarding/:krok', access: 'mentor', roles: ['mentor'] },
  { id: 'M2', title: 'Panel mentora', path: '/mentor', access: 'mentor', roles: ['mentor'] },
  { id: 'M3', title: 'Kalendarz i dostępność', path: '/mentor/kalendarz', access: 'mentor', roles: ['mentor'] },
  { id: 'M4', title: 'Uczniowie i notatki', path: '/mentor/uczniowie', access: 'mentor', roles: ['mentor'] },
  { id: 'M5', title: 'Zarobki i wypłaty', path: '/mentor/zarobki', access: 'mentor', roles: ['mentor'] },
  { id: 'A1', title: 'Weryfikacja mentorów', path: '/admin/weryfikacja', access: 'admin', roles: ['admin'] },
  { id: 'A2', title: 'Spory i zwroty', path: '/admin/spory', access: 'admin', roles: ['admin'] },
];

export const ROLE_LABELS: Record<Role, string> = {
  guest: 'Gość',
  student: 'Uczeń',
  mentor: 'Mentor',
  admin: 'Admin',
};

export const ROLE_NAV: Record<Role, { label: string; href: string; icon: string }[]> = {
  guest: [
    { label: 'Znajdź mentora', href: '#/mentorzy', icon: 'search' },
    { label: 'Zostań mentorem', href: '#/mentor/onboarding/1', icon: 'user-plus' },
  ],
  student: [
    { label: 'Szukaj', href: '#/mentorzy', icon: 'search' },
    { label: 'Sesje', href: '#/sesje', icon: 'calendar' },
    { label: 'Wiadomości', href: '#/wiadomosci', icon: 'message-square' },
    { label: 'Postępy', href: '#/postepy', icon: 'target' },
    { label: 'Plany', href: '#/plany', icon: 'wallet' },
  ],
  mentor: [
    { label: 'Panel', href: '#/mentor', icon: 'layout-dashboard' },
    { label: 'Kalendarz', href: '#/mentor/kalendarz', icon: 'calendar' },
    { label: 'Uczniowie', href: '#/mentor/uczniowie', icon: 'users' },
    { label: 'Wiadomości', href: '#/wiadomosci', icon: 'message-square' },
    { label: 'Zarobki', href: '#/mentor/zarobki', icon: 'wallet' },
  ],
  admin: [
    { label: 'Weryfikacja', href: '#/admin/weryfikacja', icon: 'shield-check' },
    { label: 'Spory', href: '#/admin/spory', icon: 'alert-triangle' },
  ],
};

export const DEFAULT_ROUTE: Record<Role, string> = {
  guest: '#/',
  student: '#/sesje',
  mentor: '#/mentor',
  admin: '#/admin/weryfikacja',
};

// Review/Comment types
export interface Comment {
  id: string;
  prototypeId: string;
  screenId: ScreenId;
  author: string;
  text: string;
  createdAt: Date;
  resolved: boolean;
}

export interface ReviewState {
  comments: Comment[];
  sidebarOpen: boolean;
  activeCommentId: string | null;
}