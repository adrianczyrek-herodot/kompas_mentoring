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

export interface ScreenInfo { id: string; title: string; }

/** Ekrany przepisane na React — mają prawdziwe adresy (ta sama ścieżka co trasa mockupu). */
const PUBLIC_SCREENS: (ScreenInfo & { pattern: string })[] = [
  { pattern: '/', id: 'P1', title: 'Strona główna' },
  { pattern: '/mentorzy', id: 'P2', title: 'Wyszukiwarka mentorów' },
  { pattern: '/mentorzy/:id', id: 'P3', title: 'Profil mentora' },
  { pattern: '/logowanie', id: 'P4', title: 'Logowanie' },
  { pattern: '/rejestracja', id: 'P4', title: 'Rejestracja' },
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

/** Ekran publiczny (React) dla ścieżki, np. `/mentorzy/m1` → P3. */
export function publicScreen(path: string): ScreenInfo | null {
  const s = PUBLIC_SCREENS.find((x) => matchPattern(x.pattern, path));
  return s ? { id: s.id, title: s.title } : null;
}

/** Trasa mockupu (`#/mentorzy?topic=X`, `/sesje`) → adres w aplikacji (`/mentorzy?topic=X`, `/app#/sesje`). */
export function toUrl(route: string): string {
  const raw = route.replace(/^#/, '') || '/';
  const path = raw.split('?')[0] || '/';
  return publicScreen(path) ? raw : `${LEGACY_BASE}#${raw}`;
}
