// Wyszukiwarka mentorów (P2): filtry z parametrów adresu i ich zastosowanie do listy.
import type { Mentor } from './types';

export const PRICE_MAX = 300;

export const TIME_OPTIONS = [['', 'Dowolna pora'], ['rano', 'Rano (do 12)'], ['popoludnie', 'Popołudnie (12–17)'], ['wieczor', 'Wieczór (od 17)']] as const;
export const SORT_OPTIONS = [['trafnosc', 'Trafność'], ['cena-rosnaco', 'Cena rosnąco'], ['cena-malejaco', 'Cena malejąco'], ['ocena', 'Ocena'], ['sesje', 'Liczba sesji']] as const;

export interface MentorFilters { topic: string; priceMax: number; verified: boolean; sort: string; time: string; }

export function readMentorFilters(q: { get(key: string): string | null }): MentorFilters {
  return {
    topic: q.get('topic') ?? '',
    priceMax: Number(q.get('priceMax') ?? PRICE_MAX),
    verified: q.get('verified') === '1',
    sort: q.get('sort') ?? 'trafnosc',
    time: q.get('time') ?? '',
  };
}

/** Parametry adresu dla filtrów — z pominięciem wartości domyślnych. */
export function mentorFiltersToQuery(f: MentorFilters): URLSearchParams {
  const q = new URLSearchParams();
  if (f.topic.trim()) q.set('topic', f.topic.trim());
  if (f.priceMax < PRICE_MAX) q.set('priceMax', String(f.priceMax));
  if (f.verified) q.set('verified', '1');
  if (f.time) q.set('time', f.time);
  if (f.sort !== 'trafnosc') q.set('sort', f.sort);
  return q;
}

/** Aktywne filtry jako [parametr, etykieta] — w kolejności od tematu (najbardziej zawęża). */
export function activeMentorFilters(f: MentorFilters): [string, string][] {
  return [
    f.topic && ['topic', `Temat: ${f.topic}`],
    f.priceMax < PRICE_MAX && ['priceMax', `Do ${f.priceMax} zł`],
    f.verified && ['verified', 'Zweryfikowani'],
    f.time && ['time', `Pora: ${f.time}`],
  ].filter(Boolean) as [string, string][];
}

export function filterMentors(mentors: Mentor[], f: MentorFilters): Mentor[] {
  const t = f.topic.toLowerCase();
  let list = mentors.filter((m) =>
    (!t || [m.name, m.headline, ...m.categories, ...m.tags].join(' ').toLowerCase().includes(t)) &&
    m.rate60 <= f.priceMax && (!f.verified || m.verified) &&
    (!f.time || Object.values(m.availability).flat().some((h) =>
      f.time === 'rano' ? h < 12 : f.time === 'popoludnie' ? h >= 12 && h < 17 : h >= 17)));
  const by: Record<string, (a: Mentor, b: Mentor) => number> = {
    'cena-rosnaco': (a, b) => a.rate60 - b.rate60,
    'cena-malejaco': (a, b) => b.rate60 - a.rate60,
    ocena: (a, b) => b.rating - a.rating,
    sesje: (a, b) => b.sessions - a.sessions,
  };
  const compare = by[f.sort];
  if (compare) list = [...list].sort(compare);
  return list;
}

/** Mentorzy z co najmniej jedną wspólną kategorią (bez samego mentora). */
export const similarMentors = (mentors: Mentor[], m: Mentor, limit = 3): Mentor[] =>
  mentors.filter((x) => x.id !== m.id && x.categories.some((c) => m.categories.includes(c))).slice(0, limit);
