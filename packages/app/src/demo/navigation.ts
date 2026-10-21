// Nawigacja aplikacji demo, wspólna dla stron React i ekranów z `src/legacy`.
// Trasy mockupu mają postać hasha (`#/sesje`); `toUrl()` zamienia je na adres w aplikacji Next.js.
import type { Role } from '@devmentor/core/domain';

export const ROLE_LABEL: Record<Role, string> = { guest: 'Gość', student: 'Uczeń', mentor: 'Mentor', admin: 'Admin' };

/** Pozycje menu wg roli: [trasa mockupu, etykieta, ikona]. */
export const NAV: Record<Role, [string, string, string][]> = {
  guest: [['#/mentorzy', 'Znajdź mentora', 'search'], ['#/mentor/onboarding/1', 'Zostań mentorem', 'user']],
  student: [['#/mentorzy', 'Szukaj', 'search'], ['#/sesje', 'Sesje', 'cal'], ['#/wiadomosci', 'Wiadomości', 'chat'], ['#/postepy', 'Postępy', 'target'], ['#/plany', 'Plany', 'wallet']],
  mentor: [['#/mentor', 'Panel', 'home'], ['#/mentor/kalendarz', 'Kalendarz', 'cal'], ['#/mentor/uczniowie', 'Uczniowie', 'users'], ['#/wiadomosci', 'Wiadomości', 'chat'], ['#/mentor/zarobki', 'Zarobki', 'wallet']],
  admin: [['#/admin/weryfikacja', 'Weryfikacja', 'shield'], ['#/admin/spory', 'Spory', 'flag']],
};

export const DEFAULT_ROUTE: Record<Role, string> = {
  guest: '#/',
  student: '#/sesje',
  mentor: '#/mentor',
  admin: '#/admin/weryfikacja',
};

export type Access = 'public' | 'auth' | Role;

export interface ScreenInfo { id: string; title: string; access: Access; bare?: boolean; }

/** Ekrany przepisane na React — mają prawdziwe adresy (ta sama ścieżka co trasa mockupu). */
const SCREENS: (ScreenInfo & { pattern: string })[] = [
  { pattern: '/', id: 'P1', title: 'Strona główna', access: 'public' },
  { pattern: '/mentorzy', id: 'P2', title: 'Wyszukiwarka mentorów', access: 'public' },
  { pattern: '/mentorzy/:id', id: 'P3', title: 'Profil mentora', access: 'public' },
  { pattern: '/logowanie', id: 'P4', title: 'Logowanie', access: 'public' },
  { pattern: '/rejestracja', id: 'P4', title: 'Rejestracja', access: 'public' },
  { pattern: '/rezerwacja/:mentorId', id: 'U1', title: 'Wybór terminu', access: 'public' },
  { pattern: '/rezerwacja/:mentorId/platnosc', id: 'U2', title: 'Checkout', access: 'student' },
  { pattern: '/potwierdzenie/:id', id: 'U3', title: 'Potwierdzenie rezerwacji', access: 'student' },
  { pattern: '/sesje', id: 'U4', title: 'Moje sesje', access: 'student' },
  { pattern: '/sesje/:id', id: 'U5', title: 'Szczegóły sesji', access: 'student' },
  { pattern: '/sesje/:id/pokoj', id: 'U6', title: 'Pokój sesji', access: 'auth', bare: true },
  { pattern: '/sesje/:id/ocena', id: 'U7', title: 'Ocena sesji', access: 'student' },
  { pattern: '/plany', id: 'U8', title: 'Plany i saldo', access: 'student' },
  { pattern: '/postepy', id: 'U9', title: 'Postępy', access: 'student' },
  { pattern: '/wiadomosci', id: 'S1', title: 'Wiadomości', access: 'auth' },
  { pattern: '/wiadomosci/:id', id: 'S1', title: 'Wiadomości', access: 'public' },
  { pattern: '/powiadomienia', id: 'S2', title: 'Powiadomienia', access: 'auth' },
  { pattern: '/konto', id: 'S3', title: 'Konto i ustawienia', access: 'auth' },
  { pattern: '/mapa', id: '—', title: 'Mapa ekranów', access: 'public' },
];

/** Adres, pod którym działają ekrany jeszcze nieprzepisane z `src/legacy` (router na hashu). */
export const LEGACY_BASE = '/app';

/** Dopasowuje ścieżkę do wzorca z parametrami `:nazwa`; zwraca parametry albo `null`. */
export function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const parts = path.split('/').filter(Boolean);
  const rp = pattern.split('/').filter(Boolean);
  if (rp.length !== parts.length) return null;
  const params: Record<string, string> = {};
  const ok = rp.every((p, i) => (p.startsWith(':') ? ((params[p.slice(1)] = decodeURIComponent(parts[i]!)), true) : p === parts[i]));
  return ok ? params : null;
}

/** Ekran React dla ścieżki, np. `/mentorzy/m1` → P3; `null` — ekran jest jeszcze w `src/legacy`. */
export function reactScreen(path: string): ScreenInfo | null {
  const s = SCREENS.find((x) => matchPattern(x.pattern, path));
  return s ? { id: s.id, title: s.title, access: s.access, bare: s.bare } : null;
}

/** Trasa mockupu (`#/mentorzy?topic=X`, `/sesje`) → adres w aplikacji (`/mentorzy?topic=X`, `/app#/sesje`). */
export function toUrl(route: string): string {
  const raw = route.replace(/^#/, '') || '/';
  const path = raw.split('?')[0] || '/';
  return reactScreen(path) ? raw : `${LEGACY_BASE}#${raw}`;
}
