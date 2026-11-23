import type { MentorId } from '../../../shared/domain/index.ts';

/**
 * Domain events of the catalog: past tense, versioned names (spec §4.7). Payloads carry IDs, not
 * personal data; their wire schemas live in `packages/contracts/events`.
 */
interface MentorProfileUpdatedV1 {
  readonly name: 'catalog.mentor_profile_updated.v1';
  readonly mentorProfileId: MentorId;
}

interface MentorProfilePublishedV1 {
  readonly name: 'catalog.mentor_profile_published.v1';
  readonly mentorProfileId: MentorId;
}

interface MentorProfileUnpublishedV1 {
  readonly name: 'catalog.mentor_profile_unpublished.v1';
  readonly mentorProfileId: MentorId;
}

export type MentorProfileDomainEvent =
  | MentorProfileUpdatedV1
  | MentorProfilePublishedV1
  | MentorProfileUnpublishedV1;
