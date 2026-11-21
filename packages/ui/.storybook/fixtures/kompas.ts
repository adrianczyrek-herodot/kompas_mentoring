/**
 * Example data for product stories (Storybook only, not exported from the package). Taken from
 * the clickable mockups (`kompas-mentoring/mockupy/src/mocks.ts`) and KONCEPCJA — no invented
 * ratings, reviews or customer numbers (task rule 7). Amounts in grosze (`bigint`).
 * „Now” is fixed like in the mockups: 2026-10-20 14:00 Europe/Warsaw.
 */
import type {
  AgendaItem,
  DaySlots,
  MentorProfileSummary,
  MentorSummary,
  SessionSummary,
  TrialRequest,
} from '../../src/index';

export const TZ = 'Europe/Warsaw';
export const TZ_LABEL = 'Warszawa (GMT+2)';
export const NOW = '2026-10-20T14:00:00+02:00';

const zl = (value: number) => BigInt(value) * 100n;

type MockMentor = MentorSummary &
  Omit<MentorProfileSummary, keyof MentorSummary> & {
    bio: string;
  };

export const kasia: MockMentor = {
  id: 'm1',
  name: 'Kasia Nowicka',
  headline: 'Senior Frontend Engineer · React, TypeScript, architektura UI',
  bio: 'Od 9 lat buduję aplikacje webowe — od startupów po produkty z milionami użytkowników. Pomagam juniorom przejść z „działa” do „jest utrzymywalne”: code review, architektura komponentów, przygotowanie do rozmów technicznych. Na pierwszej sesji ustalamy cel i plan na 8 tygodni.',
  tags: ['React', 'TypeScript', 'Next.js', 'Code review', 'Rozmowy techniczne'],
  languages: ['polski', 'angielski'],
  companies: ['Allegro', 'Brainly'],
  yearsExp: 9,
  rate60: zl(180),
  trialPrice: zl(49),
  rating: 4.9,
  reviewsCount: 87,
  sessions: 642,
  returningPct: 82,
  responseHours: 2,
  verified: true,
  acceptingNew: true,
};

export const tomasz: MockMentor = {
  id: 'm2',
  name: 'Tomasz Wierzbicki',
  headline: 'Engineering Manager · od developera do lidera zespołu',
  bio: 'Prowadzę zespoły od 6 lat. Pracuję z osobami, które dostały pierwszy awans na lidera albo chcą go dostać: rozmowy 1:1, feedback, delegowanie, rozmowy o podwyżce.',
  tags: ['Leadership', '1:1', 'Feedback', 'Awans'],
  languages: ['polski'],
  companies: ['Netguru', 'DocPlanner'],
  yearsExp: 14,
  rate60: zl(240),
  trialPrice: zl(59),
  rating: 4.8,
  reviewsCount: 41,
  sessions: 310,
  returningPct: 76,
  responseHours: 5,
  verified: true,
  acceptingNew: true,
};

export const ewa: MockMentor = {
  id: 'm3',
  name: 'Ewa Sadowska',
  headline: 'Data Scientist · ML w produkcji, Python, przebranżowienie',
  bio: 'Przeszłam z finansów do data science i wiem, jak wygląda ta droga. Pomagam zbudować portfolio projektów ML, które rekruterzy faktycznie czytają.',
  tags: ['Python', 'Machine Learning', 'SQL', 'Portfolio', 'LLM'],
  languages: ['polski', 'angielski'],
  companies: ['ING Tech', 'Revolut'],
  yearsExp: 7,
  rate60: zl(200),
  trialPrice: zl(49),
  rating: 5.0,
  reviewsCount: 23,
  sessions: 128,
  returningPct: 88,
  responseHours: 3,
  verified: true,
  acceptingNew: true,
};

/** Paused new students in the mockups (`acceptingNew: false`). */
export const marek: MockMentor = {
  id: 'm4',
  name: 'Marek Lis',
  headline: 'Staff Backend Engineer · Java, Kotlin, systemy rozproszone',
  bio: 'Projektuję systemy, które obsługują duży ruch. Uczę myślenia o skalowalności, testowaniu i projektowaniu API.',
  tags: ['Java', 'Kotlin', 'Kafka', 'System design', 'AWS'],
  languages: ['polski', 'angielski'],
  companies: ['OLX', 'Zalando'],
  yearsExp: 12,
  rate60: zl(260),
  trialPrice: zl(59),
  rating: 4.7,
  reviewsCount: 56,
  sessions: 401,
  returningPct: 70,
  responseHours: 12,
  verified: true,
  acceptingNew: false,
};

export const natalia: MockMentor = {
  id: 'm5',
  name: 'Natalia Kurek',
  headline: 'Product Designer · UX research, portfolio, Figma',
  bio: 'Pomagam projektantkom i projektantom zbudować portfolio, które pokazuje proces, a nie tylko ładne ekrany.',
  tags: ['Figma', 'UX research', 'Portfolio', 'Design systems'],
  languages: ['polski'],
  companies: ['Booksy'],
  yearsExp: 6,
  rate60: zl(150),
  trialPrice: zl(39),
  rating: 4.9,
  reviewsCount: 34,
  sessions: 215,
  returningPct: 79,
  responseHours: 4,
  verified: true,
  acceptingNew: true,
};

/**
 * No reviews yet → „Nowy mentor” (partial data). In the mockups his trial price is 0 (not set);
 * here 49 zł, the most common trial price in the mockups — an example value, not a rule.
 */
export const adam: MockMentor = {
  id: 'm6',
  name: 'Adam Górski',
  headline: 'Product Manager · discovery, metryki, rozmowy rekrutacyjne PM',
  bio: 'Byłem developerem, teraz jestem PM-em. Pomagam w przejściu do produktu i w przygotowaniu do rozmów.',
  tags: ['Discovery', 'OKR', 'Metryki', 'Rozmowy PM'],
  languages: ['polski', 'angielski'],
  companies: ['Pracuj.pl'],
  yearsExp: 8,
  rate60: zl(170),
  trialPrice: zl(49),
  rating: 0,
  reviewsCount: 0,
  sessions: 0,
  returningPct: 0,
  responseHours: 1,
  verified: false,
  acceptingNew: true,
};

export const mentors: MockMentor[] = [kasia, tomasz, ewa, marek, natalia, adam];

/** Long-text stress case: the longest limits from KONCEPCJA §M1 (headline 80, 15 tags). */
export const longMentor: MockMentor = {
  ...kasia,
  id: 'long',
  name: 'Małgorzata Brzęczyszczykiewicz-Wróblewska',
  headline: 'Principal Frontend Engineer · architektura mikrofrontendów, dostępność i wydajność',
  tags: [
    'React',
    'TypeScript',
    'Next.js',
    'Code review',
    'Rozmowy techniczne',
    'Dostępność',
    'Wydajność',
    'Testy',
    'Mikrofrontendy',
  ],
};

// Week 2026-10-19 … 2026-10-25 built from Kasia's availability template in the mockups
// (Mon 9,10,17,18 · Tue 17,18,19 · Wed 9,10,11 · Thu 18,19 · Fri 8,9,16 · Sat 10,11 · Sun —),
// only slots ≥ 6 h from „now” (KONCEPCJA §U1 „Walidacje”).
const day = (date: string, hours: number[]): DaySlots => ({
  date: `${date}T12:00:00+02:00`,
  slots: hours.map((hour) => {
    const hh = String(hour).padStart(2, '0');
    return { id: `${date}-${hh}`, startsAt: `${date}T${hh}:00:00+02:00` };
  }),
});

export const week: DaySlots[] = [
  day('2026-10-19', []),
  day('2026-10-20', []),
  day('2026-10-21', [9, 10, 11]),
  day('2026-10-22', [18, 19]),
  day('2026-10-23', [8, 9, 16]),
  day('2026-10-24', [10, 11]),
  day('2026-10-25', []),
];
export const WEEK_LABEL = '19–25 października 2026';

export const emptyWeek: DaySlots[] = week.map((d) => ({ ...d, slots: [] }));
/** Marek Lis: Tue 20:00 and Thu 20:00 in the mockups. */
export const NEXT_FREE = '2026-10-27T20:00:00+01:00';

export const sessionToday: SessionSummary = {
  id: 's1',
  startsAt: '2026-10-20T14:05:00+02:00',
  durationMin: 60,
  type: 'plan',
  status: 'scheduled',
  withName: 'Kasia Nowicka',
  goal: 'Review architektury komponentów w projekcie portfolio',
};

export const sessionTrial: SessionSummary = {
  id: 's3',
  startsAt: '2026-10-21T08:00:00+02:00',
  durationMin: 30,
  type: 'trial',
  status: 'scheduled',
  withName: 'Ewa Sadowska',
  goal: 'Czy da się przejść z frontendu do ML w rok?',
};

export const sessionFriday: SessionSummary = {
  id: 's2',
  startsAt: '2026-10-23T18:00:00+02:00',
  durationMin: 60,
  type: 'plan',
  status: 'scheduled',
  withName: 'Kasia Nowicka',
  goal: 'Testy jednostkowe hooków',
};

export const sessions: SessionSummary[] = [sessionToday, sessionTrial, sessionFriday];

export const pastSessions: SessionSummary[] = [
  {
    id: 's4',
    startsAt: '2026-10-18T18:00:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'completed',
    withName: 'Kasia Nowicka',
    goal: 'Zarządzanie stanem w React',
  },
  {
    id: 's5',
    startsAt: '2026-10-09T18:00:00+02:00',
    durationMin: 30,
    type: 'trial',
    status: 'completed',
    withName: 'Kasia Nowicka',
    goal: 'Sesja próbna — ustalenie celu',
  },
  {
    id: 's6',
    startsAt: '2026-10-02T17:00:00+02:00',
    durationMin: 30,
    type: 'trial',
    status: 'cancelled',
    withName: 'Natalia Kurek',
    goal: 'Konsultacja portfolio',
  },
];

/** Requests in Kasia's M2 (mockups `REQUESTS`); respondBy = request + 24 h (E3-S7). */
export const requestPawel: TrialRequest = {
  id: 'r1',
  student: 'Paweł R.',
  startsAt: '2026-10-22T09:00:00+02:00',
  goal: 'Mam rozmowę techniczną za 2 tygodnie w scale-upie, chcę przećwiczyć zadanie live coding w React.',
  respondBy: '2026-10-21T10:30:00+02:00',
};

export const requestIga: TrialRequest = {
  id: 'r2',
  student: 'Iga T.',
  startsAt: '2026-10-24T10:00:00+02:00',
  goal: 'Uczę się sama od pół roku, nie wiem, czy mój kod jest „produkcyjny”.',
  respondBy: '2026-10-21T16:45:00+02:00',
};

export const requests: TrialRequest[] = [requestPawel, requestIga];

/** Kasia's day in M2 (mockups `STUDENTS`, `SESSIONS`): 14:05 Adrian C., 17:00 Julia M. */
export const agenda: AgendaItem[] = [
  {
    id: 'a1',
    startsAt: '2026-10-20T14:05:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'scheduled',
    withName: 'Adrian C.',
    goal: 'Pierwsza praca jako frontend dev do marca 2027',
    joinOpen: true,
  },
  {
    id: 'a2',
    startsAt: '2026-10-20T17:00:00+02:00',
    durationMin: 60,
    type: 'plan',
    status: 'scheduled',
    withName: 'Julia M.',
    goal: 'Awans na mid w obecnej firmie',
    joinOpen: false,
  },
];
