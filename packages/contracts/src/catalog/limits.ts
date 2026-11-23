// Mirror of `catalog/domain/policies/config.ts` for the browser (contracts cannot import core).
// `contracts-parity.test.ts` in core fails when the two drift apart.

export const CATALOG_LIMITS = {
  languages: { min: 1, max: 5 },
  categories: { min: 1, max: 5 },
  tags: { min: 3, max: 15 },
  tagLength: { min: 2, max: 30 },
  yearsExperience: { min: 0, max: 50 },
  experience: { max: 10 },
  company: { min: 2, max: 80 },
  role: { min: 2, max: 80 },
  experienceYear: { min: 1950, max: 2100 },
  headline: { min: 20, max: 80 },
  bio: { min: 300, max: 2000 },
  /** Grosze (API money is an integer of minor units, spec §5). */
  rate60: { min: 4_000, max: 100_000, step: 100 },
} as const;

export const CATEGORY_SLUGS = [
  'it-programowanie',
  'data-ai',
  'produkt-ux',
  'kariera-rekrutacja',
  'biznes-zarzadzanie',
  'marketing-sprzedaz',
] as const;

export const COUNTRIES = [
  'PL',
  'AT',
  'BE',
  'CH',
  'CZ',
  'DE',
  'DK',
  'ES',
  'FR',
  'GB',
  'IE',
  'IT',
  'LT',
  'NL',
  'NO',
  'PT',
  'SE',
  'SK',
  'UA',
  'US',
] as const;

export const LANGUAGES = [
  'pl',
  'en',
  'de',
  'uk',
  'es',
  'fr',
  'it',
  'cs',
  'sk',
  'lt',
  'nl',
  'pt',
  'sv',
  'ru',
] as const;

export const PHOTO_RULES = {
  contentTypes: ['image/jpeg', 'image/png'],
  maxBytes: 5 * 1024 * 1024,
  minSide: 400,
} as const;

/** M1 steps (API keys) and their fixed Polish URL segments (spec "Ekrany"). */
export const PROFILE_STEPS = [
  'about',
  'skills',
  'bio',
  'rate',
  'availability',
  'verification',
] as const;
export type ProfileStepKey = (typeof PROFILE_STEPS)[number];

export const STEP_SEGMENTS = {
  about: 'o-mnie',
  skills: 'kompetencje',
  bio: 'opis-i-wideo',
  rate: 'stawka',
  availability: 'dostepnosc',
  verification: 'weryfikacja',
} as const satisfies Record<ProfileStepKey, string>;
