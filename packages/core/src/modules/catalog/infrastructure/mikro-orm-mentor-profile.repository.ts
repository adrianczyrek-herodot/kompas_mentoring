import { DOMAIN_EVENTS } from '@kompas/contracts/events';
import type { EntityManager } from '@mikro-orm/postgresql';
import { v7 as uuidv7 } from 'uuid';
import { money, type UserId } from '../../../shared/domain/index.ts';
import type { EventPublisher, OutboxEvent } from '../../../shared/infrastructure/events/outbox.ts';
import type { MentorProfileRepository } from '../application/ports.ts';
import type { MentorProfile } from '../domain/mentor-profile.entity.ts';
import type { MentorProfileDomainEvent } from '../domain/mentor-profile.events.ts';
import { isBookable } from '../domain/mentor-profile.state.ts';
import { tagKey } from '../domain/policies/profile-fields.policy.ts';
import {
  MentorProfileCategoryRecord,
  MentorProfileRecord,
  MentorProfileTagRecord,
  TagRecord,
} from './catalog.records.ts';
import { toMentorProfile, toRow } from './mentor-profile.mapper.ts';

/** Every payload is completed from the stored profile, so the event never drifts from the state. */
const payloadOf = (event: MentorProfileDomainEvent, profile: MentorProfile): object =>
  event.name === 'catalog.mentor_bookability_changed.v1'
    ? {
        mentorUserId: profile.userId,
        mentorProfileId: profile.id,
        bookable: isBookable(profile.status),
        acceptingNew: profile.acceptingNew,
        // JSON has no bigint: the wire carries grosze, the domain keeps `Money` (spec §6.3).
        rate60:
          profile.rate60 === null
            ? null
            : {
                amountMinorUnits: money.toMinorUnits(profile.rate60),
                currency: profile.rate60.currency,
              },
      }
    : { mentorProfileId: event.mentorProfileId };

const toOutboxEvent = (event: MentorProfileDomainEvent, profile: MentorProfile): OutboxEvent =>
  // Parsing with the contract schema keeps what we publish identical to what consumers accept.
  DOMAIN_EVENTS[event.name].parse({
    eventId: uuidv7(),
    name: event.name,
    occurredAt: profile.updatedAt.toString(),
    payload: payloadOf(event, profile),
  });

export class MikroOrmMentorProfileRepository implements MentorProfileRepository {
  readonly #em: EntityManager;
  readonly #eventPublisher: EventPublisher;

  constructor({ em, eventPublisher }: { em: EntityManager; eventPublisher: EventPublisher }) {
    this.#em = em;
    this.#eventPublisher = eventPublisher;
  }

  async findByUserId(userId: UserId): Promise<MentorProfile | null> {
    const row = await this.#em.findOne(
      MentorProfileRecord,
      { userId },
      { disableIdentityMap: true },
    );
    if (row === null) return null;
    const where = { mentorProfileId: row.id };
    const categories = await this.#em.find(MentorProfileCategoryRecord, where, {
      orderBy: { position: 'asc' },
      disableIdentityMap: true,
    });
    const tags = await this.#em.find(MentorProfileTagRecord, where, {
      orderBy: { position: 'asc' },
      disableIdentityMap: true,
    });
    return toMentorProfile(
      row,
      categories.map((c) => c.categorySlug),
      tags.map((t) => t.label),
    );
  }

  async createIfMissing(profile: MentorProfile): Promise<MentorProfile> {
    await this.#em
      .createQueryBuilder(MentorProfileRecord)
      .insert(toRow(profile))
      .onConflict('userId')
      .ignore()
      .execute();
    const stored = await this.findByUserId(profile.userId);
    if (stored === null) throw new Error('Mentor profile vanished right after it was created');
    return stored;
  }

  save(
    profile: MentorProfile,
    expectedVersion: number,
    events: readonly MentorProfileDomainEvent[],
  ): Promise<'saved' | 'version_conflict'> {
    return this.#em.transactional(async (em) => {
      const { id, ...columns } = toRow(profile);
      const updated = await em.nativeUpdate(
        MentorProfileRecord,
        { id, version: expectedVersion },
        { ...columns, version: expectedVersion + 1 },
      );
      if (updated === 0) return 'version_conflict';
      await this.#replaceCategories(em, profile);
      await this.#replaceTags(em, profile);
      await this.#eventPublisher.publish(
        em,
        events.map((event) => toOutboxEvent(event, profile)),
      );
      return 'saved';
    });
  }

  async #replaceCategories(em: EntityManager, profile: MentorProfile): Promise<void> {
    await em.nativeDelete(MentorProfileCategoryRecord, { mentorProfileId: profile.id });
    if (profile.categories.length === 0) return;
    await em.insertMany(
      MentorProfileCategoryRecord,
      profile.categories.map((categorySlug, position) => ({
        mentorProfileId: profile.id,
        categorySlug,
        position,
      })),
    );
  }

  /** Free tags (Q3): one shared row per normalised form, the profile keeps the typed label. */
  async #replaceTags(em: EntityManager, profile: MentorProfile): Promise<void> {
    await em.nativeDelete(MentorProfileTagRecord, { mentorProfileId: profile.id });
    if (profile.tags.length === 0) return;
    const normalized = profile.tags.map(tagKey);
    await em
      .createQueryBuilder(TagRecord)
      .insert(
        profile.tags.map((label, i) => ({
          id: uuidv7(),
          label,
          normalized: normalized[i] ?? label,
        })),
      )
      .onConflict('normalized')
      .ignore()
      .execute();
    const rows = await em.find(
      TagRecord,
      { normalized: { $in: normalized } },
      { disableIdentityMap: true },
    );
    const idByKey = new Map(rows.map((row) => [row.normalized, row.id]));
    await em.insertMany(
      MentorProfileTagRecord,
      profile.tags.map((label, position) => ({
        mentorProfileId: profile.id,
        tagId: idByKey.get(tagKey(label)) ?? '',
        label,
        position,
      })),
    );
  }
}
