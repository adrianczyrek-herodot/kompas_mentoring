import { z } from 'zod';

/**
 * Wire shape of every domain event between modules (spec §4.6–4.7): the outbox job's data. The
 * consumer dedupes by `eventId` in its module's inbox, so a redelivered job has no second effect.
 */
export const eventEnvelope = <Name extends string, Payload extends z.ZodType>(
  name: Name,
  payload: Payload,
) =>
  z.object({
    eventId: z.uuid(),
    name: z.literal(name),
    occurredAt: z.iso.datetime({ offset: true }),
    payload,
  });

/** Payloads carry IDs, not personal data (spec §4.7). */
export const MentorProfileRef = z.object({ mentorProfileId: z.uuid() });
