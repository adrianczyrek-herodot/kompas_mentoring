// Nawigacja aplikacji demo: role, menu, tabela ekranów z dostępem.
// Dane demo i część linków zapisują trasy w formie z mockupu (`#/sesje`); `toUrl()` zamienia je na adres.
import type { Role } from '@devmentor/core/domain';

export const ROLE_LABEL: Record<Role, string> = { guest: 'Gość', student: 'Uczeń', mentor: 'Mentor', admin: 'Admin' };

/** Pozycje menu wg roli: [trasa mockupu, etykieta, ikona]. */
export const NAV: Record<Role, [string, string, string][]> = {
  guest: [['#/mentorzy', 'Znajdź mentora', 'search'], ['#/mentor/onboarding/1', 'Zostań mentorem', 'user']],
  student: [['#/mentorzy', 'Szukaj', 'search'], ['#/sesje', 'Sesje', 'cal'], ['#/wiadomosci', 'Wiadomości', 'chat'], ['#/postepy', 'Postępy', 'target'], ['#/plany', 'Plany', 'wallet']],
  mentor: [['#/mentor', 'Panel', 'home'], ['#/mentor/kalendarz', 'Kalendarz', 'cal'], ['#/mentor/uczniowie', 'Uczniowie', 'users'], ['#/wiadomosci', 'Wiadomości', 'chat'], ['#/mentor/zarobki', 'Zarobki', 'wallet']],
  admin: [['#/admin', 'Pulpit', 'home'], ['#/admin/weryfikacja', 'Weryfikacja', 'shield'], ['#/admin/spory', 'Spory', 'flag']],
};

export const DEFAULT_ROUTE: Record<Role, string> = {
  guest: '#/',
  student: '#/sesje',
  mentor: '#/mentor',
  admin: '#/admin/weryfikacja',
};

export type Access = 'public' | 'auth' | Role;

/** `area`: `site` — strony frontendowe (Tailwind), `panel` — panel mentora i admina (shadcn/ui). */
export interface ScreenInfo { id: string; title: string; access: Access; area: 'site' | 'panel'; bare?: boolean; }

/** Wszystkie ekrany (ścieżki jak trasy mockupu). */
const SCREENS: (Omit<ScreenInfo, 'area'> & { pattern: string; area?: 'panel' })[] = [
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
  { pattern: '/mentor/onboarding/:step', id: 'M1', title: 'Onboarding mentora', access: 'public', area: 'panel' },
  { pattern: '/mentor', id: 'M2', title: 'Panel mentora', access: 'mentor', area: 'panel' },
  { pattern: '/mentor/kalendarz', id: 'M3', title: 'Kalendarz i dostępność', access: 'mentor', area: 'panel' },
  { pattern: '/mentor/uczniowie', id: 'M4', title: 'Uczniowie', access: 'mentor', area: 'panel' },
  { pattern: '/mentor/uczniowie/:id', id: 'M4', title: 'Uczeń', access: 'mentor', area: 'panel' },
  { pattern: '/mentor/zarobki', id: 'M5', title: 'Zarobki i wypłaty', access: 'mentor', area: 'panel' },
  { pattern: '/admin', id: '—', title: 'Pulpit', access: 'admin', area: 'panel' },
  { pattern: '/admin/weryfikacja', id: 'A1', title: 'Weryfikacja mentorów', access: 'admin', area: 'panel' },
  { pattern: '/admin/spory', id: 'A2', title: 'Spory i zwroty', access: 'admin', area: 'panel' },
];

/** Dopasowuje ścieżkę do wzorca z parametrami `:nazwa`; zwraca parametry albo `null`. */
export function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const parts = path.split('/').filter(Boolean);
  const rp = pattern.split('/').filter(Boolean);
  if (rp.length !== parts.length) return null;
  const params: Record<string, string> = {};
  const ok = rp.every((p, i) => (p.startsWith(':') ? ((params[p.slice(1)] = decodeURIComponent(parts[i]!)), true) : p === parts[i]));
  return ok ? params : null;
}

/** Ekran dla ścieżki, np. `/mentorzy/m1` → P3; `null` — nieznana ścieżka. */
export function screenInfo(path: string): ScreenInfo | null {
  const s = SCREENS.find((x) => matchPattern(x.pattern, path));
  return s ? { id: s.id, title: s.title, access: s.access, area: s.area ?? 'site', bare: s.bare } : null;
}

/** Trasa w formie z mockupu (`#/mentorzy?topic=X`) → adres w aplikacji (`/mentorzy?topic=X`). */
export function toUrl(route: string): string {
  return route.replace(/^#/, '') || '/';
}
