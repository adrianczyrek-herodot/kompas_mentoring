import { defineEntity, p } from '@mikro-orm/core';

/** Persistence shape of the mentor profile (table `catalog.mentor_profile`). */
export const MentorProfileRecord = defineEntity({
  name: 'MentorProfileRecord',
  tableName: 'mentor_profile',
  schema: 'catalog',
  properties: {
    id: p.uuid().primary(),
    userId: p.string(),
    status: p.string(),
    slug: p.string(),
    headline: p.text().nullable(),
    bio: p.text().nullable(),
    photoKey: p.string().nullable(),
    videoProvider: p.string().nullable(),
    videoId: p.string().nullable(),
    country: p.string().nullable(),
    languages: p.array(),
    yearsExperience: p.integer().nullable(),
    experience: p.json<unknown>(),
    rate60Amount: p.bigint('bigint').fieldName('rate_60_amount').nullable(),
    currency: p.string(),
    completedSteps: p.array(),
    requestedFields: p.array(),
    submittedAt: p.datetime().nullable(),
    publishedAt: p.datetime().nullable(),
    version: p.integer(),
    createdAt: p.datetime(),
    updatedAt: p.datetime(),
  },
});

/** Ordered categories of a profile (table `catalog.mentor_profile_category`). */
export const MentorProfileCategoryRecord = defineEntity({
  name: 'MentorProfileCategoryRecord',
  tableName: 'mentor_profile_category',
  schema: 'catalog',
  properties: {
    mentorProfileId: p.uuid().primary(),
    categorySlug: p.string().primary(),
    position: p.integer(),
  },
});

/** One row per normalised tag (table `catalog.tag`), shared by all profiles. */
export const TagRecord = defineEntity({
  name: 'TagRecord',
  tableName: 'tag',
  schema: 'catalog',
  properties: {
    id: p.uuid().primary(),
    label: p.string(),
    normalized: p.string(),
  },
});

/** Ordered tags of a profile with the label as the mentor typed it (table `catalog.mentor_profile_tag`). */
export const MentorProfileTagRecord = defineEntity({
  name: 'MentorProfileTagRecord',
  tableName: 'mentor_profile_tag',
  schema: 'catalog',
  properties: {
    mentorProfileId: p.uuid().primary(),
    tagId: p.uuid().primary(),
    label: p.string(),
    position: p.integer(),
  },
});

/** Presigned photo upload awaiting (or past) confirmation (table `catalog.upload`). */
export const UploadRecord = defineEntity({
  name: 'UploadRecord',
  tableName: 'upload',
  schema: 'catalog',
  properties: {
    key: p.string().primary(),
    ownerUserId: p.string(),
    mentorProfileId: p.uuid(),
    contentType: p.string(),
    sizeBytes: p.integer(),
    createdAt: p.datetime(),
    confirmedAt: p.datetime().nullable(),
  },
});

export const catalogRecords = [
  MentorProfileRecord,
  MentorProfileCategoryRecord,
  TagRecord,
  MentorProfileTagRecord,
  UploadRecord,
];
