// Field rules of the mentor profile (F2 spec, "Pola i walidacje"). `packages/contracts/catalog`
// mirrors these limits for the browser; `contracts-parity.test.ts` keeps both in step.

/** M1 steps in order. URL segments (`o-mnie`, …) are mapped in apps/web. */
export const PROFILE_STEPS = [
  'about',
  'skills',
  'bio',
  'rate',
  'availability',
  'verification',
] as const;

/** Steps that E2-S2 lets the mentor fill in; availability and verification arrive with E2-S3. */
export const DRAFT_STEPS = ['about', 'skills', 'bio', 'rate'] as const;

export const LIMITS = {
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
  /** Hourly rate in grosze: 40–1000 zł in whole złoty (Q9). */
  rate60: { min: 4_000n, max: 100_000n, step: 100n },
} as const;

/** Closed category list (Q3) — changed only by a migration; the catalog migration seeds the same slugs. */
export const CATEGORY_SLUGS = [
  'it-programowanie',
  'data-ai',
  'produkt-ux',
  'kariera-rekrutacja',
  'biznes-zarzadzanie',
  'marketing-sprzedaz',
] as const;

/** ISO 3166-1 alpha-2 countries offered in M1; PL is the default (mentors abroad: Later L11). */
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

export const DEFAULT_COUNTRY = 'PL';

/** ISO 639-1 session languages offered in M1. */
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

/** Profile photo (requirement 2): JPG/PNG, ≤ 5 MB, ≥ 400×400 px. */
export const PHOTO = {
  contentTypes: ['image/jpeg', 'image/png'],
  maxBytes: 5 * 1024 * 1024,
  minSide: 400,
  /** Bytes read from storage to find the image dimensions (JPEG EXIF can push SOF far in). */
  headerBytes: 256 * 1024,
  /** Presigned upload validity (spec "Bezpieczeństwo"). */
  uploadUrlTtlSeconds: 300,
  /** Unconfirmed uploads older than this are removed by the cleanup job. */
  orphanAfterHours: 24,
} as const;

/** Suffix length of the public address `/mentorzy/<imie>-<6 znaków id>` (Q14). */
export const SLUG_SUFFIX_LENGTH = 6;
export const SLUG_NAME_MAX_LENGTH = 30;
