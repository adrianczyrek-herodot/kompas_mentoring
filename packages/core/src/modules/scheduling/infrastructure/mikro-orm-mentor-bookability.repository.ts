import type { InferEntity } from '@mikro-orm/core';
import type { EntityManager } from '@mikro-orm/postgresql';
import { Temporal } from 'temporal-polyfill';
import { MentorId, money } from '../../../shared/domain/index.ts';
import type { MentorBookability, MentorBookabilityRepository } from '../application/ports.ts';
import { MentorBookabilityRecord } from './mentor-bookability.records.ts';

type MentorBookabilityRow = InferEntity<typeof MentorBookabilityRecord>;

const toInstant = (date: Date): Temporal.Instant =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime());

const toDate = (instant: Temporal.Instant): Date => new Date(instant.epochMilliseconds);

const toBookability = (row: MentorBookabilityRow): MentorBookability => ({
  mentorId: MentorId.parse(row.mentorId),
  mentorProfileId: row.mentorProfileId,
  bookable: row.isBookable,
  acceptingNew: row.acceptingNew,
  rate60:
    row.rate60Amount === null || row.rate60Amount === undefined ? null : money.of(row.rate60Amount),
  updatedAt: toInstant(row.updatedAt),
});

/**
 * Adapter: the `catalog` projection in schema `scheduling` (spec "Projekcja mentor_bookability").
 * MikroORM returns `datetime` as `Date` (lesson backend 2026-11-23), so the boundary converts.
 */
export class MikroOrmMentorBookabilityRepository implements MentorBookabilityRepository {
  readonly #em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.#em = em;
  }

  async findByProfileId(mentorProfileId: string): Promise<MentorBookability | null> {
    const row = await this.#em.findOne(
      MentorBookabilityRecord,
      { mentorProfileId },
      { disableIdentityMap: true },
    );
    return row === null ? null : toBookability(row);
  }

  async upsert(bookability: MentorBookability): Promise<void> {
    await this.#em.getConnection().execute(
      `insert into "scheduling"."mentor_bookability"
        ("mentor_profile_id", "mentor_id", "is_bookable", "accepting_new", "rate_60_amount", "currency", "updated_at")
       values (?, ?, ?, ?, ?, ?, ?)
       on conflict ("mentor_profile_id") do update set
         "mentor_id" = excluded."mentor_id",
         "is_bookable" = excluded."is_bookable",
         "accepting_new" = excluded."accepting_new",
         "rate_60_amount" = excluded."rate_60_amount",
         "currency" = excluded."currency",
         "updated_at" = excluded."updated_at"`,
      [
        bookability.mentorProfileId,
        bookability.mentorId,
        bookability.bookable,
        bookability.acceptingNew,
        bookability.rate60?.amount ?? null,
        bookability.rate60?.currency ?? 'PLN',
        toDate(bookability.updatedAt),
      ],
      'all',
      this.#em.getTransactionContext(),
    );
  }
}
