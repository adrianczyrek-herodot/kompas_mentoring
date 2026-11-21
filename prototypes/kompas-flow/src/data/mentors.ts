/**
 * Mentors from the grey mockups (`kompas-mentoring/mockupy/src/mocks.ts`): names, prices, ratings
 * and reviews are copied, not invented (ratings approved by the owner on 2026-11-21).
 * Amounts in grosze (`bigint`), like `Money` in @kompas/ui.
 */
import type { MentorProfileSummary, MentorSummary } from '@kompas/ui';

const zl = (value: number) => BigInt(value) * 100n;

type Review = { author: string; rating: number; date: string; text: string };

/** Weekday (0 = Monday) → start hours of free slots, mentor's local time (Warsaw). */
type Availability = Record<number, number[]>;

export type Mentor = MentorSummary &
  Omit<MentorProfileSummary, keyof MentorSummary> & {
    bio: string;
    country: string;
    categories: string[];
    reviews: Review[];
    availability: Availability;
  };

const std: Availability = {
  0: [9, 10, 17, 18],
  1: [17, 18, 19],
  2: [9, 10, 11],
  3: [18, 19],
  4: [8, 9, 16],
  5: [10, 11],
  6: [],
};

export const CATEGORIES = [
  'Frontend',
  'Backend',
  'Data & AI',
  'Product Management',
  'UX/UI Design',
  'Kariera w IT',
  'DevOps & Cloud',
  'Przywództwo',
];

const MENTORS: Mentor[] = [
  {
    id: 'm1',
    name: 'Kasia Nowicka',
    headline: 'Senior Frontend Engineer · React, TypeScript, architektura UI',
    bio: 'Od 9 lat buduję aplikacje webowe — od startupów po produkty z milionami użytkowników. Pomagam juniorom przejść z „działa” do „jest utrzymywalne”: code review, architektura komponentów, przygotowanie do rozmów technicznych. Na pierwszej sesji ustalamy cel i plan na 8 tygodni.',
    country: 'Polska',
    languages: ['polski', 'angielski'],
    categories: ['Frontend', 'Kariera w IT'],
    tags: ['React', 'TypeScript', 'Next.js', 'Code review', 'Rozmowy techniczne'],
    yearsExp: 9,
    companies: ['Allegro', 'Brainly'],
    rate60: zl(180),
    trialPrice: zl(49),
    rating: 4.9,
    reviewsCount: 87,
    sessions: 642,
    returningPct: 82,
    responseHours: 2,
    verified: true,
    acceptingNew: true,
    reviews: [
      {
        author: 'Michał',
        rating: 5,
        date: '2026-10-02T12:00:00+02:00',
        text: 'Po trzech sesjach przepisałem swój projekt portfolio i dostałem pierwszą ofertę. Konkretne uwagi, zero lania wody.',
      },
      {
        author: 'Ola',
        rating: 5,
        date: '2026-09-18T12:00:00+02:00',
        text: 'Świetnie tłumaczy, dlaczego coś jest problemem, zamiast dawać gotowe rozwiązanie.',
      },
      {
        author: 'Piotr',
        rating: 4,
        date: '2026-09-01T12:00:00+02:00',
        text: 'Bardzo dobra sesja próbna, chciałbym więcej wolnych terminów wieczorem.',
      },
    ],
    availability: std,
  },
  {
    id: 'm2',
    name: 'Tomasz Wierzbicki',
    headline: 'Engineering Manager · od developera do lidera zespołu',
    bio: 'Prowadzę zespoły od 6 lat. Pracuję z osobami, które dostały pierwszy awans na lidera albo chcą go dostać: rozmowy 1:1, feedback, delegowanie, rozmowy o podwyżce.',
    country: 'Polska',
    languages: ['polski'],
    categories: ['Przywództwo', 'Kariera w IT'],
    tags: ['Leadership', '1:1', 'Feedback', 'Awans'],
    yearsExp: 14,
    companies: ['Netguru', 'DocPlanner'],
    rate60: zl(240),
    trialPrice: zl(59),
    rating: 4.8,
    reviewsCount: 41,
    sessions: 310,
    returningPct: 76,
    responseHours: 5,
    verified: true,
    acceptingNew: true,
    reviews: [
      {
        author: 'Agnieszka',
        rating: 5,
        date: '2026-10-10T12:00:00+02:00',
        text: 'Pierwszy raz ktoś rozłożył mi delegowanie na konkretne kroki.',
      },
    ],
    availability: { 0: [19, 20], 1: [], 2: [19, 20], 3: [7, 8], 4: [], 5: [9, 10, 11], 6: [] },
  },
  {
    id: 'm3',
    name: 'Ewa Sadowska',
    headline: 'Data Scientist · ML w produkcji, Python, przebranżowienie',
    bio: 'Przeszłam z finansów do data science i wiem, jak wygląda ta droga. Pomagam zbudować portfolio projektów ML, które rekruterzy faktycznie czytają.',
    country: 'Polska',
    languages: ['polski', 'angielski'],
    categories: ['Data & AI', 'Kariera w IT'],
    tags: ['Python', 'Machine Learning', 'SQL', 'Portfolio', 'LLM'],
    yearsExp: 7,
    companies: ['ING Tech', 'Revolut'],
    rate60: zl(200),
    trialPrice: zl(49),
    rating: 5.0,
    reviewsCount: 23,
    sessions: 128,
    returningPct: 88,
    responseHours: 3,
    verified: true,
    acceptingNew: true,
    reviews: [
      {
        author: 'Kuba',
        rating: 5,
        date: '2026-10-12T12:00:00+02:00',
        text: 'Plan nauki dopasowany do mojego czasu, a nie z YouTube.',
      },
    ],
    availability: { 0: [12, 13], 1: [12, 13], 2: [], 3: [12, 13, 18], 4: [12], 5: [], 6: [10] },
  },
  {
    id: 'm4',
    name: 'Marek Lis',
    headline: 'Staff Backend Engineer · Java, Kotlin, systemy rozproszone',
    bio: 'Projektuję systemy, które obsługują duży ruch. Uczę myślenia o skalowalności, testowaniu i projektowaniu API.',
    country: 'Polska',
    languages: ['polski', 'angielski'],
    categories: ['Backend', 'DevOps & Cloud'],
    tags: ['Java', 'Kotlin', 'Kafka', 'System design', 'AWS'],
    yearsExp: 12,
    companies: ['OLX', 'Zalando'],
    rate60: zl(260),
    trialPrice: zl(59),
    rating: 4.7,
    reviewsCount: 56,
    sessions: 401,
    returningPct: 70,
    responseHours: 12,
    verified: true,
    acceptingNew: false,
    reviews: [
      {
        author: 'Bartek',
        rating: 5,
        date: '2026-09-22T12:00:00+02:00',
        text: 'System design przerobiony na prawdziwych przykładach.',
      },
    ],
    availability: { 0: [], 1: [20], 2: [], 3: [20], 4: [], 5: [], 6: [] },
  },
  {
    id: 'm5',
    name: 'Natalia Kurek',
    headline: 'Product Designer · UX research, portfolio, Figma',
    bio: 'Pomagam projektantkom i projektantom zbudować portfolio, które pokazuje proces, a nie tylko ładne ekrany.',
    country: 'Polska',
    languages: ['polski'],
    categories: ['UX/UI Design'],
    tags: ['Figma', 'UX research', 'Portfolio', 'Design systems'],
    yearsExp: 6,
    companies: ['Booksy'],
    rate60: zl(150),
    trialPrice: zl(39),
    rating: 4.9,
    reviewsCount: 34,
    sessions: 215,
    returningPct: 79,
    responseHours: 4,
    verified: true,
    acceptingNew: true,
    reviews: [
      {
        author: 'Zuza',
        rating: 5,
        date: '2026-10-05T12:00:00+02:00',
        text: 'Case study z portfolio wreszcie ma sens.',
      },
    ],
    availability: std,
  },
  {
    // Application under review (A1 „a1”): not public yet (brief rule 8) — P3 answers 404.
    id: 'm6',
    name: 'Adam Górski',
    headline: 'Product Manager · discovery, metryki, rozmowy rekrutacyjne PM',
    bio: 'Byłem developerem, teraz jestem PM-em. Pomagam w przejściu do produktu i w przygotowaniu do rozmów.',
    country: 'Polska',
    languages: ['polski', 'angielski'],
    categories: ['Product Management', 'Kariera w IT'],
    tags: ['Discovery', 'OKR', 'Metryki', 'Rozmowy PM'],
    yearsExp: 8,
    companies: ['Pracuj.pl'],
    rate60: zl(170),
    trialPrice: zl(0),
    rating: 0,
    reviewsCount: 0,
    sessions: 0,
    returningPct: 0,
    responseHours: 1,
    verified: false,
    acceptingNew: true,
    reviews: [],
    availability: { 0: [18], 1: [18], 2: [18], 3: [18], 4: [], 5: [], 6: [] },
  },
];

/** Only approved mentors are public (brief rule 8). */
export const PUBLIC_MENTORS = MENTORS.filter((mentor) => mentor.verified);

export function mentorById(id: string | undefined): Mentor | undefined {
  return MENTORS.find((mentor) => mentor.id === id);
}

export function publicMentorById(id: string | undefined): Mentor | undefined {
  return PUBLIC_MENTORS.find((mentor) => mentor.id === id);
}

/** Service fee of a paid trial, from the grey mockups (U2: 3 zł). */
export const TRIAL_SERVICE_FEE = zl(3);

/** Promo code from the grey mockups (U2: KOMPAS10 → −10% of the session price). */
export const PROMO_CODE = 'KOMPAS10';
export const PROMO_PERCENT = 10n;
