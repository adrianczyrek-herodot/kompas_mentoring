import { describe, expect, it } from 'vitest';
import { DOMAIN_EVENTS, MentorApplicationDecidedV1, MentorProfileUpdatedV1 } from './index.ts';

const EVENT_ID = '0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d10';
const PROFILE_ID = '0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d11';

describe('domain event schemas', () => {
  it('accepts an envelope with its own name and rejects another name', () => {
    const event = {
      eventId: EVENT_ID,
      name: 'catalog.mentor_profile_updated.v1',
      occurredAt: '2026-11-22T12:00:00Z',
      payload: { mentorProfileId: PROFILE_ID },
    };
    expect(MentorProfileUpdatedV1.parse(event)).toEqual(event);
    expect(
      MentorProfileUpdatedV1.safeParse({ ...event, name: 'catalog.mentor_profile_published.v1' })
        .success,
    ).toBe(false);
  });

  it('validates decision payloads', () => {
    const decided = {
      eventId: EVENT_ID,
      name: 'trust.mentor_application_decided.v1',
      occurredAt: '2026-11-22T12:00:00+01:00',
      payload: {
        applicationId: EVENT_ID,
        mentorProfileId: PROFILE_ID,
        decision: 'changes_requested',
        requestedFields: ['headline', 'photo'],
      },
    };
    expect(MentorApplicationDecidedV1.safeParse(decided).success).toBe(true);
    const unknown = { ...decided, payload: { ...decided.payload, decision: 'maybe' } };
    expect(MentorApplicationDecidedV1.safeParse(unknown).success).toBe(false);
  });

  it('registers every schema under the name it validates', () => {
    for (const [name, schema] of Object.entries(DOMAIN_EVENTS)) {
      expect(schema.shape.name.value).toBe(name);
    }
  });
});
