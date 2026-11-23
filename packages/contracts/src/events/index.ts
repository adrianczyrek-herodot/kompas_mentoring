import { z } from 'zod';
import { eventEnvelope, MentorProfileRef } from './envelope.ts';

// Events of the F2 spec ("Zdarzenia"). A new event = a new schema here + a row in DOMAIN_EVENTS;
// breaking payload changes get a new version (`….v2`), see BACKWARD_COMPATIBILITY.md.

/** catalog → trust: the mentor sent the profile for verification (E2-S3). */
export const MentorApplicationSubmittedV1 = eventEnvelope(
  'catalog.mentor_application_submitted.v1',
  z.object({
    mentorProfileId: z.uuid(),
    userId: z.uuid(),
    submittedAt: z.iso.datetime({ offset: true }),
    /** Profile as sent — A1 reviews this, not the live profile. */
    snapshot: z.record(z.string(), z.unknown()),
  }),
);

/** trust → catalog: an admin decided the application (E2-S4). */
export const MentorApplicationDecidedV1 = eventEnvelope(
  'trust.mentor_application_decided.v1',
  z.object({
    applicationId: z.uuid(),
    mentorProfileId: z.uuid(),
    decision: z.enum(['approved', 'changes_requested', 'rejected']),
    requestedFields: z.array(z.string()).optional(),
  }),
);

/** trust → catalog: suspension or reinstatement by admin_trust (Q8). */
export const MentorSuspensionChangedV1 = eventEnvelope(
  'trust.mentor_suspension_changed.v1',
  z.object({ mentorProfileId: z.uuid(), suspended: z.boolean() }),
);

/** catalog → catalog (worker): refresh the search read model and the P3 cache tag. */
export const MentorProfilePublishedV1 = eventEnvelope(
  'catalog.mentor_profile_published.v1',
  MentorProfileRef,
);
export const MentorProfileUpdatedV1 = eventEnvelope(
  'catalog.mentor_profile_updated.v1',
  MentorProfileRef,
);
export const MentorProfileUnpublishedV1 = eventEnvelope(
  'catalog.mentor_profile_unpublished.v1',
  MentorProfileRef,
);

/**
 * catalog → scheduling (Q13): the profile became (un)bookable, the mentor paused new trial
 * students or changed the rate. `bookable` is "approved" in the profile state machine; `rate60`
 * travels in minor units because JSON has no bigint (`Money` stays bigint inside the domain).
 */
export const MentorBookabilityChangedV1 = eventEnvelope(
  'catalog.mentor_bookability_changed.v1',
  z.object({
    mentorUserId: z.uuid(),
    mentorProfileId: z.uuid(),
    bookable: z.boolean(),
    acceptingNew: z.boolean(),
    rate60: z
      .object({ amountMinorUnits: z.number().int().min(0), currency: z.literal('PLN') })
      .nullable(),
  }),
);

/** Registry: event name → envelope schema, used by publishers and consumers alike. */
export const DOMAIN_EVENTS = {
  'catalog.mentor_application_submitted.v1': MentorApplicationSubmittedV1,
  'trust.mentor_application_decided.v1': MentorApplicationDecidedV1,
  'trust.mentor_suspension_changed.v1': MentorSuspensionChangedV1,
  'catalog.mentor_profile_published.v1': MentorProfilePublishedV1,
  'catalog.mentor_profile_updated.v1': MentorProfileUpdatedV1,
  'catalog.mentor_profile_unpublished.v1': MentorProfileUnpublishedV1,
  'catalog.mentor_bookability_changed.v1': MentorBookabilityChangedV1,
} as const;

export type DomainEventName = keyof typeof DOMAIN_EVENTS;
export type DomainEventEnvelope<Name extends DomainEventName = DomainEventName> = z.infer<
  (typeof DOMAIN_EVENTS)[Name]
>;
