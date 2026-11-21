/**
 * Screens of the approved map (KONCEPCJA §3.1). IDs and paths are permanent: review comments are
 * stored against the ID. `refs` = backlog stories / KONCEPCJA sections shown next to the screen.
 */
export type ScreenId =
  | 'P1'
  | 'P2'
  | 'P3'
  | 'P4'
  | 'U1'
  | 'U2'
  | 'U3'
  | 'U4'
  | 'U5'
  | 'U6'
  | 'U7'
  | 'U8'
  | 'U9'
  | 'S1'
  | 'S2'
  | 'S3'
  | 'M1'
  | 'M2'
  | 'M3'
  | 'M4'
  | 'M5'
  | 'A1'
  | 'A2';

/**
 * `public` — everyone; `booking` — public until the slot is held (F1: the guest picks a slot,
 * logs in at „Dalej”); `guest` — P4; `auth` — any signed-in role; the rest — that role only.
 */
export type Access = 'public' | 'booking' | 'guest' | 'auth' | 'student' | 'mentor' | 'admin';

export type ScreenDef = {
  id: ScreenId;
  name: string;
  paths: string[];
  access: Access;
  /** One sentence: the user's task (KONCEPCJA §4 „Cel”). */
  purpose: string;
  refs: string[];
  /** Hash path used when the screen is opened from the review bar or a comment thread. */
  sample: string;
  /** Item marked as current in the AppHeader navigation. */
  nav?: string;
};

export const SCREENS: ScreenDef[] = [
  {
    id: 'P1',
    name: 'Strona główna',
    paths: ['/'],
    access: 'public',
    purpose: 'W kilka sekund przekierować gościa do wyszukiwarki z wstępnym filtrem.',
    refs: ['E2-S7', 'UC1'],
    sample: '/',
  },
  {
    id: 'P2',
    name: 'Wyszukiwarka mentorów',
    paths: ['/mentorzy'],
    access: 'public',
    purpose: 'Porównać mentorów i wybrać 1–3 do obejrzenia.',
    refs: ['E2-S5', 'E2-S8', 'UC1'],
    sample: '/mentorzy',
    nav: 'search',
  },
  {
    id: 'P3',
    name: 'Profil mentora',
    paths: ['/mentorzy/:id'],
    access: 'public',
    purpose: 'Zbudować zaufanie i doprowadzić do rezerwacji sesji próbnej.',
    refs: ['E2-S6', 'UC2'],
    sample: '/mentorzy/m1',
    nav: 'search',
  },
  {
    id: 'P4',
    name: 'Logowanie / Rejestracja',
    paths: ['/logowanie', '/rejestracja'],
    access: 'guest',
    purpose: 'Założyć konto lub zalogować się bez utraty kontekstu rezerwacji.',
    refs: ['E1 (F1)', 'E3-S9', 'UC3'],
    sample: '/logowanie',
  },
  {
    id: 'U1',
    name: 'Wybór terminu',
    paths: ['/rezerwacja/:mentorId'],
    access: 'booking',
    purpose: 'Wybrać slot sesji próbnej lub kolejnej sesji z planu.',
    refs: ['E3-S3', 'E3-S4', 'UC4'],
    sample: '/rezerwacja/m1',
    nav: 'search',
  },
  {
    id: 'U2',
    name: 'Checkout',
    paths: ['/rezerwacja/:mentorId/platnosc'],
    access: 'student',
    purpose: 'Opłacić rezerwację (albo potwierdzić z salda) i przekazać mentorowi kontekst.',
    refs: ['E3-S4', 'F4 Later (płatności)', 'UC4'],
    sample: '/rezerwacja/m1/platnosc',
    nav: 'search',
  },
  {
    id: 'U3',
    name: 'Potwierdzenie rezerwacji',
    paths: ['/rezerwacja/:bookingId/potwierdzenie'],
    access: 'student',
    purpose: 'Dać pewność, że sesja jest umówiona, i przygotować ucznia.',
    refs: ['E3-S4', 'E3-S8', 'UC4'],
    sample: '/rezerwacja/s2/potwierdzenie',
    nav: 'sessions',
  },
  {
    id: 'U4',
    name: 'Moje sesje',
    paths: ['/sesje'],
    access: 'student',
    purpose: 'Jedno miejsce z nadchodzącymi i minionymi sesjami.',
    refs: ['E3-S5', 'UC5'],
    sample: '/sesje',
    nav: 'sessions',
  },
  {
    id: 'U5',
    name: 'Szczegóły sesji',
    paths: ['/sesje/:id'],
    access: 'student',
    purpose: 'Zarządzać pojedynczą sesją: dołączyć, przełożyć, anulować, zgłosić problem.',
    refs: ['E3-S5', 'E3-S6', 'UC10', 'UC17'],
    sample: '/sesje/s2',
    nav: 'sessions',
  },
  {
    id: 'U6',
    name: 'Pokój sesji',
    paths: ['/sesje/:id/pokoj'],
    access: 'student',
    purpose: 'Odbyć sesję wideo z mentorem.',
    refs: ['F5 Later', 'UC6'],
    sample: '/sesje/s1/pokoj',
    nav: 'sessions',
  },
  {
    id: 'U7',
    name: 'Ocena sesji',
    paths: ['/sesje/:id/ocena'],
    access: 'student',
    purpose: 'Ocenić sesję i zdecydować o kontynuacji.',
    refs: ['F5 Later', 'UC7', 'UC8'],
    sample: '/sesje/s5/ocena',
    nav: 'sessions',
  },
  {
    id: 'U8',
    name: 'Plany i saldo',
    paths: ['/plany'],
    access: 'student',
    purpose: 'Wybrać plan, zobaczyć saldo i odnowienia.',
    refs: ['F4 Later', 'UC9'],
    sample: '/plany',
    nav: 'sessions',
  },
  {
    id: 'U9',
    name: 'Postępy',
    paths: ['/postepy'],
    access: 'student',
    purpose: 'Widzieć cele, notatki i zadania z sesji.',
    refs: ['F5 Later', 'UC11'],
    sample: '/postepy',
    nav: 'progress',
  },
  {
    id: 'S1',
    name: 'Wiadomości',
    paths: ['/wiadomosci', '/wiadomosci/:threadId'],
    access: 'auth',
    purpose: 'Rozmawiać z mentorem lub uczniem w platformie.',
    refs: ['F5 Later', 'UC5'],
    sample: '/wiadomosci',
    nav: 'messages',
  },
  {
    id: 'S2',
    name: 'Powiadomienia',
    paths: ['/powiadomienia'],
    access: 'auth',
    purpose: 'Zobaczyć przypomnienia i zdarzenia dotyczące sesji.',
    refs: ['E3-S8'],
    sample: '/powiadomienia',
  },
  {
    id: 'S3',
    name: 'Konto i ustawienia',
    paths: ['/konto'],
    access: 'auth',
    purpose: 'Zarządzać profilem, powiadomieniami, bezpieczeństwem i danymi (RODO).',
    refs: ['E1 (F1)', 'E3-S9'],
    sample: '/konto',
    nav: 'account',
  },
  {
    id: 'M1',
    name: 'Onboarding mentora',
    paths: ['/mentor/onboarding/:krok'],
    access: 'mentor',
    purpose: 'Przejść 6 kroków i wysłać wniosek do weryfikacji.',
    refs: ['E2-S2', 'E2-S3', 'UC12'],
    sample: '/mentor/onboarding/1',
  },
  {
    id: 'M2',
    name: 'Panel mentora',
    paths: ['/mentor'],
    access: 'mentor',
    purpose: 'Zobaczyć dzisiejsze sesje i odpowiedzieć na prośby o sesję próbną.',
    refs: ['E3-S7', 'UC13'],
    sample: '/mentor',
    nav: 'dashboard',
  },
  {
    id: 'M3',
    name: 'Kalendarz i dostępność',
    paths: ['/mentor/kalendarz'],
    access: 'mentor',
    purpose: 'Ustawić dostępność cykliczną, wyjątki i synchronizację kalendarza.',
    refs: ['E3-S2', 'E3-S10', 'UC14'],
    sample: '/mentor/kalendarz',
    nav: 'calendar',
  },
  {
    id: 'M4',
    name: 'Uczniowie i notatki',
    paths: ['/mentor/uczniowie', '/mentor/uczniowie/:id'],
    access: 'mentor',
    purpose: 'Prowadzić cele, notatki i zadania uczniów.',
    refs: ['F5 Later', 'UC15'],
    sample: '/mentor/uczniowie',
    nav: 'students',
  },
  {
    id: 'M5',
    name: 'Zarobki i wypłaty',
    paths: ['/mentor/zarobki'],
    access: 'mentor',
    purpose: 'Widzieć rozliczone i oczekujące sesje oraz zlecić wypłatę.',
    refs: ['F6 Later', 'UC16'],
    sample: '/mentor/zarobki',
    nav: 'earnings',
  },
  {
    id: 'A1',
    name: 'Weryfikacja mentorów',
    paths: ['/admin/weryfikacja'],
    access: 'admin',
    purpose: 'Zatwierdzić, odesłać do poprawy albo odrzucić wniosek mentora.',
    refs: ['E2-S4', 'UC18'],
    sample: '/admin/weryfikacja',
  },
  {
    id: 'A2',
    name: 'Spory i zwroty',
    paths: ['/admin/spory'],
    access: 'admin',
    purpose: 'Rozstrzygnąć zgłoszony problem z sesją.',
    refs: ['F6 Later', 'UC17'],
    sample: '/admin/spory',
  },
];

export function screenById(id: string): ScreenDef | undefined {
  return SCREENS.find((screen) => screen.id === id);
}
