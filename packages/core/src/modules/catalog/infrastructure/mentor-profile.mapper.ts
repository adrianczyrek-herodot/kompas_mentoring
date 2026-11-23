import type { InferEntity } from '@mikro-orm/core';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';
import { MentorId, type Money, money, UserId } from '../../../shared/domain/index.ts';
import type { MentorProfile, ProfileStep } from '../domain/mentor-profile.entity.ts';
import type { MentorProfileStatus } from '../domain/mentor-profile.state.ts';
import { PROFILE_STEPS } from '../domain/policies/config.ts';
import type { MentorProfileRecord } from './catalog.records.ts';

export type MentorProfileRow = InferEntity<typeof MentorProfileRecord>;

const STATUSES: readonly MentorProfileStatus[] = [
  'draft',
  'submitted',
  'changes_requested',
  'approved',
  'suspended',
  'rejected',
];

const Experience = z.array(
  z.object({
    company: z.string(),
    role: z.string(),
    fromYear: z.number().int().nullable(),
    toYear: z.number().int().nullable(),
  }),
);

export const toInstant = (date: Date): Temporal.Instant =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime());

export const toDate = (instant: Temporal.Instant): Date => new Date(instant.epochMilliseconds);

const toStatus = (value: string): MentorProfileStatus => {
  const status = STATUSES.find((candidate) => candidate === value);
  if (status === undefined)
    throw new Error(`Unknown mentor profile status in the database: ${value}`);
  return status;
};

const toSteps = (values: readonly string[]): ProfileStep[] =>
  PROFILE_STEPS.filter((step) => values.includes(step));

const toRate = (amount: bigint | null | undefined): Money | null =>
  amount === null || amount === undefined ? null : money.of(amount);

/** Row + ordered categories and tags → aggregate. */
export const toMentorProfile = (
  row: MentorProfileRow,
  categories: readonly string[],
  tags: readonly string[],
): MentorProfile => ({
  id: MentorId.parse(row.id),
  userId: UserId.parse(row.userId),
  status: toStatus(row.status),
  slug: row.slug,
  photoKey: row.photoKey ?? null,
  country: row.country ?? null,
  languages: row.languages,
  categories,
  tags,
  yearsExperience: row.yearsExperience ?? null,
  experience: Experience.parse(row.experience),
  headline: row.headline ?? null,
  bio: row.bio ?? null,
  video:
    (row.videoProvider === 'youtube' || row.videoProvider === 'vimeo') && row.videoId
      ? { provider: row.videoProvider, videoId: row.videoId }
      : null,
  rate60: toRate(row.rate60Amount),
  acceptingNew: row.acceptingNew,
  completedSteps: toSteps(row.completedSteps),
  requestedFields: row.requestedFields,
  version: row.version,
  submittedAt: row.submittedAt ? toInstant(row.submittedAt) : null,
  publishedAt: row.publishedAt ? toInstant(row.publishedAt) : null,
  createdAt: toInstant(row.createdAt),
  updatedAt: toInstant(row.updatedAt),
});

/** Aggregate → row columns (categories and tags live in their own tables). */
export const toRow = (profile: MentorProfile): MentorProfileRow => ({
  id: profile.id,
  userId: profile.userId,
  status: profile.status,
  slug: profile.slug,
  headline: profile.headline,
  bio: profile.bio,
  photoKey: profile.photoKey,
  videoProvider: profile.video?.provider ?? null,
  videoId: profile.video?.videoId ?? null,
  country: profile.country,
  languages: [...profile.languages],
  yearsExperience: profile.yearsExperience,
  experience: profile.experience,
  rate60Amount: profile.rate60?.amount ?? null,
  currency: profile.rate60?.currency ?? 'PLN',
  acceptingNew: profile.acceptingNew,
  completedSteps: [...profile.completedSteps],
  requestedFields: [...profile.requestedFields],
  submittedAt: profile.submittedAt ? toDate(profile.submittedAt) : null,
  publishedAt: profile.publishedAt ? toDate(profile.publishedAt) : null,
  version: profile.version,
  createdAt: toDate(profile.createdAt),
  updatedAt: toDate(profile.updatedAt),
});
