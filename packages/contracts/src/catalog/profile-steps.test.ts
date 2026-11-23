import { describe, expect, it } from 'vitest';
import {
  AboutStepComplete,
  BioStepComplete,
  BioStepDraft,
  RateStepComplete,
  SaveProfileStepInput,
  SkillsStepComplete,
  SkillsStepDraft,
} from './profile-steps.ts';

const fieldsOf = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  (result.error?.issues ?? []).map((issue) => issue.path.join('.'));

/** Field path → the problem code of the domain (the browser shows the same text as the server). */
const problemsOf = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  (result.error?.issues ?? []).map((issue) => `${issue.path.join('.')}:${issue.message}`);

describe('M1 step schemas', () => {
  it('accepts empty fields in a draft but not invalid ones', () => {
    expect(BioStepDraft.safeParse({ headline: '', bio: null, videoUrl: '' }).success).toBe(true);
    expect(
      fieldsOf(BioStepDraft.safeParse({ headline: 'za krótki', bio: null, videoUrl: null })),
    ).toEqual(['headline']);
    expect(
      fieldsOf(
        BioStepDraft.safeParse({ headline: null, bio: null, videoUrl: 'https://example.com' }),
      ),
    ).toEqual(['videoUrl']);
  });

  it('requires every field of a complete step', () => {
    expect(fieldsOf(BioStepComplete.safeParse({ headline: '', bio: '', videoUrl: null }))).toEqual([
      'headline',
      'bio',
    ]);
    expect(fieldsOf(AboutStepComplete.safeParse({ country: null, languages: [] }))).toEqual([
      'country',
      'languages',
    ]);
  });

  it.each([
    [19, false],
    [20, true],
    [80, true],
    [81, false],
  ])('headline of %i characters → valid: %s', (length, valid) => {
    const bio = { headline: 'h'.repeat(length), bio: 'b'.repeat(300), videoUrl: null };
    expect(BioStepComplete.safeParse(bio).success).toBe(valid);
  });

  it.each([
    [3_900, false],
    [4_000, true],
    [100_000, true],
    [100_100, false],
    [12_050, false],
  ])('rate %i grosze → valid: %s', (rate60Amount, valid) => {
    expect(RateStepComplete.safeParse({ rate60Amount }).success).toBe(valid);
  });

  it.each([
    [2, false],
    [3, true],
    [15, true],
    [16, false],
  ])('%i tags → valid: %s', (count, valid) => {
    const skills = {
      categories: ['data-ai'],
      tags: Array.from({ length: count }, (_, i) => `tag-${i}`),
      yearsExperience: 3,
      experience: [],
    };
    expect(SkillsStepComplete.safeParse(skills).success).toBe(valid);
  });

  it('checks the order of experience years and accepts YouTube and Vimeo links', () => {
    const entry = { company: 'Allegro', role: 'Dev', fromYear: 2022, toYear: 2018 };
    const skills = { categories: [], tags: [], yearsExperience: null, experience: [entry] };
    expect(fieldsOf(SkillsStepDraft.safeParse(skills))).toEqual(['experience.0.toYear']);
    for (const videoUrl of [
      'https://youtu.be/dQw4w9WgXcQ',
      'vimeo.com/76979871',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    ]) {
      expect(BioStepDraft.safeParse({ headline: null, bio: null, videoUrl }).success).toBe(true);
    }
  });

  it('names the problems with the codes of the domain', () => {
    expect(
      problemsOf(SkillsStepComplete.safeParse({ categories: [], tags: [], yearsExperience: null, experience: [] })),
    ).toEqual(['categories:too_few', 'tags:too_few', 'yearsExperience:required']);
    expect(problemsOf(RateStepComplete.safeParse({ rate60Amount: null }))).toEqual([
      'rate60Amount:required',
    ]);
    expect(problemsOf(RateStepComplete.safeParse({ rate60Amount: 12_050 }))).toEqual([
      'rate60Amount:not_whole_zloty',
    ]);
  });

  it('routes a step save by its step key', () => {
    const input = { step: 'rate', expectedVersion: 3, fields: { rate60Amount: 15_000 } };
    expect(SaveProfileStepInput.parse(input)).toEqual(input);
    expect(SaveProfileStepInput.safeParse({ ...input, step: 'availability' }).success).toBe(false);
  });
});
