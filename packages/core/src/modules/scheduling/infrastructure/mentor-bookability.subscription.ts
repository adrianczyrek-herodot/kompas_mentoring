import { DOMAIN_EVENTS } from '@kompas/contracts/events';
import type { MikroORM } from '@mikro-orm/postgresql';
import { Temporal } from 'temporal-polyfill';
import { MentorId, money } from '../../../shared/domain/index.ts';
import { withInbox } from '../../../shared/infrastructure/events/inbox.ts';
import type { EventSubscription } from '../../../shared/infrastructure/events/subscriptions.ts';
import type { MentorBookability } from '../application/ports.ts';
import { MikroOrmMentorBookabilityRepository } from './mikro-orm-mentor-bookability.repository.ts';

const EVENT = 'catalog.mentor_bookability_changed.v1';

type BookabilityPayload = ReturnType<(typeof DOMAIN_EVENTS)[typeof EVENT]['parse']>['payload'];

/** Q13: the mirrored mentor, completed with the event's own timestamp for `updated_at`. */
const toBookability = (
  payload: BookabilityPayload,
  occurredAt: Temporal.Instant,
): MentorBookability => ({
  mentorId: MentorId.parse(payload.mentorUserId),
  mentorProfileId: payload.mentorProfileId,
  bookable: payload.bookable,
  acceptingNew: payload.acceptingNew,
  rate60: payload.rate60 === null ? null : money.of(BigInt(payload.rate60.amountMinorUnits)),
  updatedAt: occurredAt,
});

/**
 * Consumer of `catalog.mentor_bookability_changed.v1` (spec "Projekcja mentor_bookability"): the
 * event is parsed with its contract schema and applied exactly once — the inbox records the
 * `event_id` and runs the upsert in one transaction, so a redelivered job has no second effect and
 * a failing write leaves no marker behind (spec §4.6).
 */
export const makeMentorBookabilitySubscription = ({
  orm,
}: {
  /** Typed as MikroORM, not as `orm.ts`: that file imports module `di.ts` (no cycle). */
  orm: MikroORM;
}): EventSubscription => ({
  event: EVENT,
  consumer: 'scheduling',
  handle: async (data: unknown): Promise<void> => {
    const event = DOMAIN_EVENTS[EVENT].parse(data);
    const bookability = toBookability(event.payload, Temporal.Instant.from(event.occurredAt));
    await withInbox(orm.em.fork(), 'scheduling', event.eventId, (em) =>
      new MikroOrmMentorBookabilityRepository({ em }).upsert(bookability),
    );
  },
});
