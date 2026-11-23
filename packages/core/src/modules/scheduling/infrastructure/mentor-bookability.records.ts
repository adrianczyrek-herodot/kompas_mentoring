import { defineEntity, p } from '@mikro-orm/core';

/**
 * Projection of the `catalog` mentor profile in schema `scheduling` (spec "Projekcja
 * mentor_bookability"): what a booking needs to know about a mentor, mirrored from
 * `catalog.mentor_bookability_changed.v1` so `scheduling` never calls back into `catalog`.
 */
export const MentorBookabilityRecord = defineEntity({
  name: 'MentorBookabilityRecord',
  tableName: 'mentor_bookability',
  schema: 'scheduling',
  properties: {
    mentorProfileId: p.uuid().fieldName('mentor_profile_id').primary(),
    mentorId: p.string().fieldName('mentor_id'),
    isBookable: p.boolean().fieldName('is_bookable'),
    acceptingNew: p.boolean().fieldName('accepting_new'),
    rate60Amount: p.bigint('bigint').fieldName('rate_60_amount').nullable(),
    currency: p.string(),
    updatedAt: p.datetime().fieldName('updated_at'),
  },
});
