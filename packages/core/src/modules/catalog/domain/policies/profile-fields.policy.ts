import { err, type Money, ok, type Result } from '../../../../shared/domain/index.ts';
import type { InvalidFields } from '../catalog.errors.ts';
import { CATEGORY_SLUGS, COUNTRIES, LANGUAGES, LIMITS } from './config.ts';
import {
  charLength,
  checkCount,
  checkOptions,
  checkText,
  checkWholeNumber,
  cleanLine,
  cleanText,
  IssueCollector,
  type StepMode,
  uniqueBy,
} from './field-rules.ts';
import { rateProblem } from './rate.policy.ts';
import { parseVideoLink, type VideoLink } from './video-link.policy.ts';

export interface AboutFields {
  readonly country: string | null;
  readonly languages: readonly string[];
}

export interface ExperienceEntry {
  readonly company: string;
  readonly role: string;
  readonly fromYear: number | null;
  readonly toYear: number | null;
}

export interface SkillsFields {
  readonly categories: readonly string[];
  readonly tags: readonly string[];
  readonly yearsExperience: number | null;
  readonly experience: readonly ExperienceEntry[];
}

export interface BioFields {
  readonly headline: string | null;
  readonly bio: string | null;
  readonly video: VideoLink | null;
}

export interface BioInput extends Omit<BioFields, 'video'> {
  /** Raw link typed by the mentor; stored as `{ provider, videoId }`. */
  readonly videoUrl: string | null;
}

export interface RateFields {
  readonly rate60: Money | null;
}

const done = <T>(issues: IssueCollector, value: T): Result<T, InvalidFields> =>
  issues.isEmpty ? ok(value) : err({ code: 'catalog.invalid_fields', issues: issues.issues });

/** Step 1 "O mnie": country from the list, 1–5 session languages. The photo has its own command. */
export const checkAbout = (
  input: AboutFields,
  mode: StepMode,
): Result<AboutFields, InvalidFields> => {
  const issues = new IssueCollector();
  const country = cleanLine(input.country)?.toUpperCase() ?? null;
  if (country === null && mode === 'complete') issues.add('country', 'required');
  if (country !== null) checkOptions(issues, 'country', [country], COUNTRIES);
  const languages = uniqueBy(
    input.languages.map((l) => l.trim().toLowerCase()),
    (l) => l,
  );
  checkOptions(issues, 'languages', languages, LANGUAGES);
  checkCount(issues, 'languages', languages.length, LIMITS.languages, mode);
  return done(issues, { country, languages });
};

/** Tag normalisation (Q3): trimmed, single spaces, compared case-insensitively, no duplicates. */
export const tagKey = (label: string): string => label.toLocaleLowerCase('pl');

const checkTags = (issues: IssueCollector, raw: readonly string[], mode: StepMode): string[] => {
  const tags = uniqueBy(
    raw.map(cleanLine).filter((tag): tag is string => tag !== null),
    tagKey,
  );
  const { min, max } = LIMITS.tagLength;
  if (tags.some((tag) => charLength(tag) < min || charLength(tag) > max)) {
    issues.add('tags', 'invalid');
  }
  checkCount(issues, 'tags', tags.length, LIMITS.tags, mode);
  return tags;
};

const checkExperience = (
  issues: IssueCollector,
  entries: readonly ExperienceEntry[],
): ExperienceEntry[] => {
  checkCount(issues, 'experience', entries.length, LIMITS.experience, 'draft');
  return entries.map((entry, index) => {
    const at = `experience.${index}`;
    const company = checkText(
      issues,
      `${at}.company`,
      cleanLine(entry.company),
      LIMITS.company,
      'complete',
    );
    const role = checkText(issues, `${at}.role`, cleanLine(entry.role), LIMITS.role, 'complete');
    const fromYear = checkWholeNumber(
      issues,
      `${at}.fromYear`,
      entry.fromYear,
      LIMITS.experienceYear,
      'draft',
    );
    const toYear = checkWholeNumber(
      issues,
      `${at}.toYear`,
      entry.toYear,
      LIMITS.experienceYear,
      'draft',
    );
    if (fromYear !== null && toYear !== null && fromYear > toYear)
      issues.add(`${at}.toYear`, 'out_of_range');
    return { company: company ?? '', role: role ?? '', fromYear, toYear };
  });
};

/** Step 2 "Kompetencje": 1–5 categories, 3–15 tags, 0–50 years, 0–10 companies / roles. */
export const checkSkills = (
  input: SkillsFields,
  mode: StepMode,
): Result<SkillsFields, InvalidFields> => {
  const issues = new IssueCollector();
  const categories = uniqueBy(input.categories, (c) => c);
  checkOptions(issues, 'categories', categories, CATEGORY_SLUGS);
  checkCount(issues, 'categories', categories.length, LIMITS.categories, mode);
  const tags = checkTags(issues, input.tags, mode);
  const yearsExperience = checkWholeNumber(
    issues,
    'yearsExperience',
    input.yearsExperience,
    LIMITS.yearsExperience,
    mode,
  );
  const experience = checkExperience(issues, input.experience);
  return done(issues, { categories, tags, yearsExperience, experience });
};

/** Step 3 "Opis i wideo": headline 20–80, plain-text bio 300–2000, optional YouTube/Vimeo link (Q4). */
export const checkBio = (input: BioInput, mode: StepMode): Result<BioFields, InvalidFields> => {
  const issues = new IssueCollector();
  const headline = checkText(issues, 'headline', cleanLine(input.headline), LIMITS.headline, mode);
  const bio = checkText(issues, 'bio', cleanText(input.bio), LIMITS.bio, mode);
  const rawVideo = cleanLine(input.videoUrl);
  const video = rawVideo === null ? null : parseVideoLink(rawVideo);
  if (rawVideo !== null && video === null) issues.add('videoUrl', 'invalid');
  return done(issues, { headline, bio, video });
};

/** Step 4 "Stawka": 40–1000 zł per 60 minutes in whole złoty (Q9). */
export const checkRate = (input: RateFields, mode: StepMode): Result<RateFields, InvalidFields> => {
  const issues = new IssueCollector();
  if (input.rate60 === null) {
    if (mode === 'complete') issues.add('rate60', 'required');
  } else {
    const problem = rateProblem(input.rate60);
    if (problem !== null) issues.add('rate60', problem);
  }
  return done(issues, { rate60: input.rate60 });
};
