/**
 * P2 filters serialised in the URL (KONCEPCJA §P2: „filtry serializowane w URL”), e.g.
 * `#/mentorzy?temat=react&cena=0-300&jezyk=angielski&pora=wieczor&sort=cena-rosnaco`.
 */
import type { ActiveFilter } from '@kompas/ui';
import type { Mentor } from '../data/mentors';

export type TimeOfDay = 'rano' | 'popoludnie' | 'wieczor';
export type Sort = 'trafnosc' | 'cena-rosnaco' | 'cena-malejaco' | 'ocena' | 'sesje';

export type Filters = {
  topic: string;
  category: string;
  price: [number, number];
  language: string;
  minYears: number;
  times: TimeOfDay[];
  verifiedOnly: boolean;
  sort: Sort;
};

export const PRICE_MAX = 1000;
export const NO_FILTERS: Filters = {
  topic: '',
  category: '',
  price: [0, PRICE_MAX],
  language: '',
  minYears: 0,
  times: [],
  verifiedOnly: false,
  sort: 'trafnosc',
};

export const TIME_LABELS: Record<TimeOfDay, string> = {
  rano: 'Rano (do 12:00)',
  popoludnie: 'Po południu (12–17)',
  wieczor: 'Wieczorem (od 17:00)',
};

export const SORT_LABELS: Record<Sort, string> = {
  trafnosc: 'Trafność',
  'cena-rosnaco': 'Cena: od najniższej',
  'cena-malejaco': 'Cena: od najwyższej',
  ocena: 'Ocena',
  sesje: 'Liczba sesji',
};

const clampPrice = (value: number) => Math.min(PRICE_MAX, Math.max(0, value));

export function filtersFrom(query: URLSearchParams): Filters {
  const [min = 0, max = PRICE_MAX] = (query.get('cena') ?? '').split('-').map(Number);
  const sort = query.get('sort') as Sort | null;
  return {
    topic: query.get('temat') ?? '',
    category: query.get('kategoria') ?? '',
    price: [clampPrice(Number.isFinite(min) ? min : 0), clampPrice(Number.isFinite(max) ? max : PRICE_MAX)],
    language: query.get('jezyk') ?? '',
    minYears: Number(query.get('doswiadczenie') ?? 0) || 0,
    times: (query.get('pora') ?? '').split(',').filter((t): t is TimeOfDay => t in TIME_LABELS),
    verifiedOnly: query.get('zweryfikowani') === '1',
    sort: sort && sort in SORT_LABELS ? sort : 'trafnosc',
  };
}

export function queryOf(filters: Filters): Record<string, string | undefined> {
  const [min, max] = filters.price;
  return {
    temat: filters.topic || undefined,
    kategoria: filters.category || undefined,
    cena: min !== 0 || max !== PRICE_MAX ? `${String(min)}-${String(max)}` : undefined,
    jezyk: filters.language || undefined,
    doswiadczenie: filters.minYears ? String(filters.minYears) : undefined,
    pora: filters.times.length ? filters.times.join(',') : undefined,
    zweryfikowani: filters.verifiedOnly ? '1' : undefined,
    sort: filters.sort === 'trafnosc' ? undefined : filters.sort,
  };
}

function timesOf(mentor: Mentor): Set<TimeOfDay> {
  const hours = Object.values(mentor.availability).flat();
  return new Set(
    hours.map((hour): TimeOfDay => (hour < 12 ? 'rano' : hour < 17 ? 'popoludnie' : 'wieczor')),
  );
}

export function matches(mentor: Mentor, filters: Filters): boolean {
  const zl = Number(mentor.rate60 / 100n);
  const topic = filters.topic.trim().toLowerCase();
  const text = [mentor.name, mentor.headline, ...mentor.tags, ...mentor.categories]
    .join(' ')
    .toLowerCase();
  const times = timesOf(mentor);
  return (
    (!topic || text.includes(topic)) &&
    (!filters.category || mentor.categories.includes(filters.category)) &&
    zl >= filters.price[0] &&
    zl <= filters.price[1] &&
    (!filters.language || mentor.languages.includes(filters.language)) &&
    mentor.yearsExp >= filters.minYears &&
    (!filters.verifiedOnly || mentor.verified) &&
    (filters.times.length === 0 || filters.times.some((time) => times.has(time)))
  );
}

export function sorted(mentors: Mentor[], sort: Sort): Mentor[] {
  const list = [...mentors];
  switch (sort) {
    case 'cena-rosnaco':
      return list.sort((a, b) => Number(a.rate60 - b.rate60));
    case 'cena-malejaco':
      return list.sort((a, b) => Number(b.rate60 - a.rate60));
    case 'ocena':
      return list.sort((a, b) => b.rating - a.rating);
    case 'sesje':
      return list.sort((a, b) => b.sessions - a.sessions);
    case 'trafnosc':
      return list;
  }
}

export type ActiveWithReset = ActiveFilter & { reset: Partial<Filters> };

export function activeOf(filters: Filters): ActiveWithReset[] {
  const list: ActiveWithReset[] = [];
  if (filters.topic) list.push({ id: 'topic', label: `„${filters.topic}”`, reset: { topic: '' } });
  if (filters.category)
    list.push({ id: 'category', label: filters.category, reset: { category: '' } });
  const [min, max] = filters.price;
  if (min !== 0 || max !== PRICE_MAX)
    list.push({
      id: 'price',
      label: `${String(min)}–${String(max)} zł`,
      reset: { price: [0, PRICE_MAX] },
    });
  if (filters.language)
    list.push({ id: 'language', label: `Język: ${filters.language}`, reset: { language: '' } });
  if (filters.minYears)
    list.push({
      id: 'years',
      label: `Doświadczenie ${String(filters.minYears)}+ lat`,
      reset: { minYears: 0 },
    });
  if (filters.verifiedOnly)
    list.push({ id: 'verified', label: 'Tylko zweryfikowani', reset: { verifiedOnly: false } });
  for (const time of filters.times)
    list.push({
      id: `time-${time}`,
      label: TIME_LABELS[time],
      reset: { times: filters.times.filter((t) => t !== time) },
    });
  return list;
}
