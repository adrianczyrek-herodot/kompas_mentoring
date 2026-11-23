import { z } from 'zod';
import { CATEGORY_SLUGS, COUNTRIES, CATALOG_LIMITS as L, LANGUAGES } from './limits.ts';

// Step forms of M1, shared by the browser (inline errors) and the API (spec "Pola i walidacje").
// `draft` accepts empty fields but never invalid ones; `complete` is what "Zapisz i dalej" needs.

type Mode = 'draft' | 'complete';

const chars = (value: string) => Array.from(value).length;

/** Text that must be filled in, with its length counted in code points. */
const filledText = (range: { min: number; max: number }) =>
  z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const length = chars(value);
      if (length < range.min) {
        ctx.addIssue({ code: 'custom', message: length === 0 ? 'required' : 'too_short' });
      } else if (length > range.max) {
        ctx.addIssue({ code: 'custom', message: 'too_long' });
      }
    });

/** In a draft the text may stay empty (`''` or `null`), but a filled-in value must be valid. */
const text = (range: { min: number; max: number }, mode: Mode) =>
  mode === 'complete'
    ? filledText(range)
    : z.union([z.literal(''), filledText(range)]).nullable();

const whole = (range: { min: number; max: number }, mode: Mode) => {
  // The problem codes are the ones of the domain (`catalog/domain/policies`), so the browser and
  // the server say the same thing about the same value.
  const number = z
    .number({ error: 'required' })
    .int({ error: 'out_of_range' })
    .min(range.min, { error: 'out_of_range' })
    .max(range.max, { error: 'out_of_range' });
  return mode === 'complete' ? number : number.nullable();
};

const list = <T extends z.ZodType>(item: T, range: { min?: number; max: number }, mode: Mode) =>
  z
    .array(item)
    .max(range.max, { error: 'too_many' })
    .min(mode === 'complete' ? (range.min ?? 0) : 0, { error: 'too_few' });

const aboutSchema = (mode: Mode) =>
  z.object({
    country: mode === 'complete' ? z.enum(COUNTRIES) : z.enum(COUNTRIES).nullable(),
    languages: list(z.enum(LANGUAGES), L.languages, mode),
  });

const experienceEntry = z
  .object({
    company: filledText(L.company),
    role: filledText(L.role),
    fromYear: whole(L.experienceYear, 'draft'),
    toYear: whole(L.experienceYear, 'draft'),
  })
  .refine((e) => e.fromYear === null || e.toYear === null || e.fromYear <= e.toYear, {
    message: 'out_of_range',
    path: ['toYear'],
  });

const skillsSchema = (mode: Mode) =>
  z.object({
    categories: list(z.enum(CATEGORY_SLUGS), L.categories, mode),
    tags: list(filledText(L.tagLength), L.tags, mode),
    yearsExperience: whole(L.yearsExperience, mode),
    experience: list(experienceEntry, L.experience, 'draft'),
  });

const YOUTUBE_OR_VIMEO =
  /^(https?:\/\/)?((www\.|m\.)?youtube\.com\/(watch\?(.*&)?v=|shorts\/)[\w-]{11}|youtu\.be\/[\w-]{11}|(www\.)?vimeo\.com\/\d{6,12}\/?)([?&#].*)?$/i;

const bioSchema = (mode: Mode) =>
  z.object({
    headline: text(L.headline, mode),
    bio: text(L.bio, mode),
    // Optional in both modes (Q4); the server stores `{ provider, videoId }`.
    videoUrl: z
      .string()
      .trim()
      .refine((value) => value === '' || YOUTUBE_OR_VIMEO.test(value), { message: 'invalid' })
      .nullable(),
  });

const rate60 = z
  .number({ error: 'required' })
  .int({ error: 'out_of_range' })
  .min(L.rate60.min, { error: 'out_of_range' })
  .max(L.rate60.max, { error: 'out_of_range' })
  .refine((v) => v % L.rate60.step === 0, { error: 'not_whole_zloty' });

const rateSchema = (mode: Mode) =>
  z.object({ rate60Amount: mode === 'complete' ? rate60 : rate60.nullable() });

export const AboutStepDraft = aboutSchema('draft');
export const AboutStepComplete = aboutSchema('complete');
export const SkillsStepDraft = skillsSchema('draft');
export const SkillsStepComplete = skillsSchema('complete');
export const BioStepDraft = bioSchema('draft');
export const BioStepComplete = bioSchema('complete');
export const RateStepDraft = rateSchema('draft');
export const RateStepComplete = rateSchema('complete');

export type AboutStepFields = z.infer<typeof AboutStepDraft>;
export type SkillsStepFields = z.infer<typeof SkillsStepDraft>;
export type BioStepFields = z.infer<typeof BioStepDraft>;
export type RateStepFields = z.infer<typeof RateStepDraft>;

/** Body of `PUT /me/mentor-profile/steps/{step}` — one member per step E2-S2 lets the mentor fill. */
export const SaveProfileStepInput = z.discriminatedUnion('step', [
  z.object({ step: z.literal('about'), expectedVersion: z.number().int(), fields: AboutStepDraft }),
  z.object({
    step: z.literal('skills'),
    expectedVersion: z.number().int(),
    fields: SkillsStepDraft,
  }),
  z.object({ step: z.literal('bio'), expectedVersion: z.number().int(), fields: BioStepDraft }),
  z.object({ step: z.literal('rate'), expectedVersion: z.number().int(), fields: RateStepDraft }),
]);
export type SaveProfileStepInput = z.infer<typeof SaveProfileStepInput>;

export const DRAFT_STEP_KEYS = ['about', 'skills', 'bio', 'rate'] as const;
export type DraftStepKey = (typeof DRAFT_STEP_KEYS)[number];

/** Full (complete) schema per step, used by "Zapisz i dalej" in the browser. */
export const COMPLETE_STEP_SCHEMAS = {
  about: AboutStepComplete,
  skills: SkillsStepComplete,
  bio: BioStepComplete,
  rate: RateStepComplete,
} as const satisfies Record<DraftStepKey, z.ZodType>;
