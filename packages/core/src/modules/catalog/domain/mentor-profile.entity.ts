import type { Temporal } from 'temporal-polyfill';
import { err, type MentorId, ok, type Result, type UserId } from '../../../shared/domain/index.ts';
import type { InvalidFields, ProfileLocked } from './catalog.errors.ts';
import { isEditable, type MentorProfileStatus } from './mentor-profile.state.ts';
import { DEFAULT_COUNTRY, DRAFT_STEPS, PROFILE_STEPS } from './policies/config.ts';
import {
  type AboutFields,
  type BioFields,
  type BioInput,
  checkAbout,
  checkBio,
  checkRate,
  checkSkills,
  type RateFields,
  type SkillsFields,
} from './policies/profile-fields.policy.ts';
import { profileSlug } from './policies/slug.policy.ts';

export type ProfileStep = (typeof PROFILE_STEPS)[number];
export type DraftStep = (typeof DRAFT_STEPS)[number];

/** Mentor profile aggregate (pure domain shape); persistence mapping lives in infrastructure/. */
export interface MentorProfile extends AboutFields, SkillsFields, BioFields, RateFields {
  readonly id: MentorId;
  readonly userId: UserId;
  readonly status: MentorProfileStatus;
  readonly slug: string;
  readonly photoKey: string | null;
  readonly completedSteps: readonly ProfileStep[];
  /** Fields the admin asked to change (A1 "changes_requested"), highlighted in M1. */
  readonly requestedFields: readonly string[];
  /** Optimistic lock (spec: conflict → 409 "odśwież"). */
  readonly version: number;
  readonly submittedAt: Temporal.Instant | null;
  readonly publishedAt: Temporal.Instant | null;
  readonly createdAt: Temporal.Instant;
  readonly updatedAt: Temporal.Instant;
}

/** A step save from M1 — one union member per step the mentor fills in during E2-S2. */
export type StepInput =
  | { readonly step: 'about'; readonly fields: AboutFields }
  | { readonly step: 'skills'; readonly fields: SkillsFields }
  | { readonly step: 'bio'; readonly fields: BioInput }
  | { readonly step: 'rate'; readonly fields: RateFields };

/** The profile is created lazily on the mentor's first visit to M1 (draft, step 1). */
export const createDraftProfile = (params: {
  id: MentorId;
  userId: UserId;
  displayName: string;
  now: Temporal.Instant;
}): MentorProfile => ({
  id: params.id,
  userId: params.userId,
  status: 'draft',
  slug: profileSlug(params.displayName, params.id),
  photoKey: null,
  country: DEFAULT_COUNTRY,
  languages: [],
  categories: [],
  tags: [],
  yearsExperience: null,
  experience: [],
  headline: null,
  bio: null,
  video: null,
  rate60: null,
  completedSteps: [],
  requestedFields: [],
  version: 1,
  submittedAt: null,
  publishedAt: null,
  createdAt: params.now,
  updatedAt: params.now,
});

const isDraftStepComplete = (profile: MentorProfile, step: DraftStep): boolean => {
  switch (step) {
    case 'about':
      return profile.photoKey !== null && checkAbout(profile, 'complete').isOk();
    case 'skills':
      return checkSkills(profile, 'complete').isOk();
    case 'bio':
      return checkBio({ ...profile, videoUrl: null }, 'complete').isOk();
    case 'rate':
      return checkRate(profile, 'complete').isOk();
  }
};

/** Steps 1–4 are derived from the data; steps 5–6 keep what their own commands recorded (E2-S3). */
const withCompletedSteps = (profile: MentorProfile): MentorProfile => {
  const done = new Set<ProfileStep>(
    profile.completedSteps.filter((step) => !(DRAFT_STEPS as readonly string[]).includes(step)),
  );
  for (const step of DRAFT_STEPS) if (isDraftStepComplete(profile, step)) done.add(step);
  return { ...profile, completedSteps: PROFILE_STEPS.filter((step) => done.has(step)) };
};

/** Where "back to onboarding" lands: the first step not done yet (requirement 1); `null` when all are. */
export const firstIncompleteStep = (profile: MentorProfile): ProfileStep | null =>
  PROFILE_STEPS.find((step) => !profile.completedSteps.includes(step)) ?? null;

const ensureEditable = (profile: MentorProfile): Result<MentorProfile, ProfileLocked> =>
  isEditable(profile.status)
    ? ok(profile)
    : err({ code: 'catalog.profile_locked', status: profile.status });

const checkStep = (input: StepInput): Result<Partial<MentorProfile>, InvalidFields> => {
  switch (input.step) {
    case 'about':
      return checkAbout(input.fields, 'draft');
    case 'skills':
      return checkSkills(input.fields, 'draft');
    case 'bio':
      return checkBio(input.fields, 'draft');
    case 'rate':
      return checkRate(input.fields, 'draft');
  }
};

/**
 * Saves one M1 step as a draft: empty fields are kept empty, invalid ones are rejected, and the
 * step counts as completed only when its full rules hold. Locked while under review (Q6).
 */
export const saveStep = (
  profile: MentorProfile,
  input: StepInput,
  now: Temporal.Instant,
): Result<MentorProfile, ProfileLocked | InvalidFields> =>
  ensureEditable(profile).andThen((editable) =>
    checkStep(input).map((fields) =>
      withCompletedSteps({ ...editable, ...fields, updatedAt: now }),
    ),
  );

/** Pins a confirmed photo (requirement 2) and re-derives step 1. */
export const attachPhoto = (
  profile: MentorProfile,
  photoKey: string,
  now: Temporal.Instant,
): Result<MentorProfile, ProfileLocked> =>
  ensureEditable(profile).map((editable) =>
    withCompletedSteps({ ...editable, photoKey, updatedAt: now }),
  );
