import { describe, expect, it } from 'vitest';
import { money } from '../../../../shared/domain/index.ts';
import {
  type AboutFields,
  type BioInput,
  checkAbout,
  checkBio,
  checkRate,
  checkSkills,
  type SkillsFields,
} from './profile-fields.policy.ts';

const text = (length: number) => 'a'.repeat(length);
const issuesOf = (result: { isErr(): boolean; _unsafeUnwrapErr(): unknown }) =>
  result.isErr() ? (result._unsafeUnwrapErr() as { issues: unknown[] }).issues : [];

const about: AboutFields = { country: 'PL', languages: ['pl'] };
const skills: SkillsFields = {
  categories: ['it-programowanie'],
  tags: ['react', 'typescript', 'node'],
  yearsExperience: 5,
  experience: [],
};
const bio: BioInput = { headline: text(20), bio: text(300), videoUrl: null };

describe('step 1 — about', () => {
  it('needs a country and 1–5 known languages when complete', () => {
    expect(checkAbout(about, 'complete').isOk()).toBe(true);
    expect(issuesOf(checkAbout({ country: null, languages: [] }, 'complete'))).toEqual([
      { field: 'country', problem: 'required' },
      { field: 'languages', problem: 'required' },
    ]);
    expect(checkAbout({ country: null, languages: [] }, 'draft').isOk()).toBe(true);
  });

  it('normalises and rejects unknown options or more than 5 languages', () => {
    expect(
      checkAbout({ country: ' pl ', languages: ['PL', 'pl'] }, 'draft')._unsafeUnwrap(),
    ).toEqual({
      country: 'PL',
      languages: ['pl'],
    });
    expect(issuesOf(checkAbout({ country: 'XX', languages: ['xx'] }, 'draft'))).toEqual([
      { field: 'country', problem: 'unknown_option' },
      { field: 'languages', problem: 'unknown_option' },
    ]);
    const six = ['pl', 'en', 'de', 'uk', 'es', 'fr'];
    expect(issuesOf(checkAbout({ country: 'PL', languages: six }, 'draft'))).toEqual([
      { field: 'languages', problem: 'too_many' },
    ]);
    expect(checkAbout({ country: 'PL', languages: six.slice(0, 5) }, 'complete').isOk()).toBe(true);
  });
});

describe('step 2 — skills', () => {
  it.each([
    [2, 'too_few'],
    [3, null],
    [15, null],
    [16, 'too_many'],
  ] as const)('%i tags → %s', (count, problem) => {
    const tags = Array.from({ length: count }, (_, i) => `tag-${i}`);
    const issues = issuesOf(checkSkills({ ...skills, tags }, 'complete'));
    expect(issues).toEqual(problem === null ? [] : [{ field: 'tags', problem }]);
  });

  it('allows fewer tags in a draft but never more than 15', () => {
    expect(checkSkills({ ...skills, tags: ['react'] }, 'draft').isOk()).toBe(true);
  });

  it('dedupes tags case-insensitively and checks their length 2–30', () => {
    const result = checkSkills(
      { ...skills, tags: [' React ', 'react', 'Node  JS', 'go'] },
      'draft',
    );
    expect(result._unsafeUnwrap().tags).toEqual(['React', 'Node JS', 'go']);
    expect(issuesOf(checkSkills({ ...skills, tags: ['a', text(30)] }, 'draft'))).toEqual([
      { field: 'tags', problem: 'invalid' },
    ]);
    expect(issuesOf(checkSkills({ ...skills, tags: [text(31)] }, 'draft'))).toEqual([
      { field: 'tags', problem: 'invalid' },
    ]);
  });

  it('needs 1–5 categories from the closed list', () => {
    expect(issuesOf(checkSkills({ ...skills, categories: [] }, 'complete'))).toEqual([
      { field: 'categories', problem: 'required' },
    ]);
    expect(issuesOf(checkSkills({ ...skills, categories: ['astrologia'] }, 'draft'))).toEqual([
      { field: 'categories', problem: 'unknown_option' },
    ]);
    const six = [
      'it-programowanie',
      'data-ai',
      'produkt-ux',
      'kariera-rekrutacja',
      'biznes-zarzadzanie',
      'marketing-sprzedaz',
    ];
    expect(issuesOf(checkSkills({ ...skills, categories: six }, 'draft'))).toEqual([
      { field: 'categories', problem: 'too_many' },
    ]);
  });

  it.each([
    [-1, 'out_of_range'],
    [0, null],
    [50, null],
    [51, 'out_of_range'],
    [2.5, 'out_of_range'],
  ] as const)('%d years of experience → %s', (years, problem) => {
    const issues = issuesOf(checkSkills({ ...skills, yearsExperience: years }, 'complete'));
    expect(issues).toEqual(problem === null ? [] : [{ field: 'yearsExperience', problem }]);
  });

  it('requires years of experience only when complete', () => {
    expect(issuesOf(checkSkills({ ...skills, yearsExperience: null }, 'complete'))).toEqual([
      { field: 'yearsExperience', problem: 'required' },
    ]);
    expect(checkSkills({ ...skills, yearsExperience: null }, 'draft').isOk()).toBe(true);
  });

  it('checks companies and roles (2–80), years in order and at most 10 entries', () => {
    const entry = { company: 'Allegro', role: 'Senior dev', fromYear: 2018, toYear: 2022 };
    expect(checkSkills({ ...skills, experience: [entry] }, 'complete').isOk()).toBe(true);
    const bad = { company: 'A', role: text(81), fromYear: 2022, toYear: 2018 };
    expect(issuesOf(checkSkills({ ...skills, experience: [bad] }, 'draft'))).toEqual([
      { field: 'experience.0.company', problem: 'too_short' },
      { field: 'experience.0.role', problem: 'too_long' },
      { field: 'experience.0.toYear', problem: 'out_of_range' },
    ]);
    const empty = { company: ' ', role: 'Dev', fromYear: 1900, toYear: null };
    expect(issuesOf(checkSkills({ ...skills, experience: [empty] }, 'draft'))).toEqual([
      { field: 'experience.0.company', problem: 'required' },
      { field: 'experience.0.fromYear', problem: 'out_of_range' },
    ]);
    const eleven = Array.from({ length: 11 }, () => entry);
    expect(issuesOf(checkSkills({ ...skills, experience: eleven }, 'draft'))).toEqual([
      { field: 'experience', problem: 'too_many' },
    ]);
  });
});

describe('step 3 — bio', () => {
  it.each([
    [19, 'too_short'],
    [20, null],
    [80, null],
    [81, 'too_long'],
  ] as const)('headline of %i characters → %s', (length, problem) => {
    const issues = issuesOf(checkBio({ ...bio, headline: text(length) }, 'complete'));
    expect(issues).toEqual(problem === null ? [] : [{ field: 'headline', problem }]);
  });

  it.each([
    [299, 'too_short'],
    [300, null],
    [2000, null],
    [2001, 'too_long'],
  ] as const)('bio of %i characters → %s', (length, problem) => {
    const issues = issuesOf(checkBio({ ...bio, bio: text(length) }, 'complete'));
    expect(issues).toEqual(problem === null ? [] : [{ field: 'bio', problem }]);
  });

  it('counts Polish letters once and keeps paragraphs', () => {
    const result = checkBio(
      { ...bio, headline: `  ${'ż'.repeat(20)}  `, bio: `${text(150)}\r\n\r\n${text(150)}` },
      'complete',
    );
    expect(result._unsafeUnwrap()).toMatchObject({
      headline: 'ż'.repeat(20),
      bio: `${text(150)}\n\n${text(150)}`,
    });
  });

  it('keeps empty fields in a draft and requires them when complete', () => {
    const empty = { headline: '', bio: null, videoUrl: '' };
    expect(checkBio(empty, 'draft')._unsafeUnwrap()).toEqual({
      headline: null,
      bio: null,
      video: null,
    });
    expect(issuesOf(checkBio(empty, 'complete'))).toEqual([
      { field: 'headline', problem: 'required' },
      { field: 'bio', problem: 'required' },
    ]);
  });

  it('stores a video link as { provider, videoId } and rejects other URLs', () => {
    const withVideo = checkBio({ ...bio, videoUrl: 'https://youtu.be/dQw4w9WgXcQ' }, 'complete');
    expect(withVideo._unsafeUnwrap().video).toEqual({
      provider: 'youtube',
      videoId: 'dQw4w9WgXcQ',
    });
    expect(issuesOf(checkBio({ ...bio, videoUrl: 'https://example.com/film' }, 'draft'))).toEqual([
      { field: 'videoUrl', problem: 'invalid' },
    ]);
  });
});

describe('step 4 — rate', () => {
  it.each([
    [3_900n, 'out_of_range'],
    [4_000n, null],
    [100_000n, null],
    [100_100n, 'out_of_range'],
    [12_050n, 'not_whole_zloty'],
  ] as const)('%s grosze → %s', (amount, problem) => {
    const issues = issuesOf(checkRate({ rate60: money.of(amount) }, 'complete'));
    expect(issues).toEqual(problem === null ? [] : [{ field: 'rate60', problem }]);
  });

  it('allows an empty rate only in a draft', () => {
    expect(checkRate({ rate60: null }, 'draft').isOk()).toBe(true);
    expect(issuesOf(checkRate({ rate60: null }, 'complete'))).toEqual([
      { field: 'rate60', problem: 'required' },
    ]);
  });
});
