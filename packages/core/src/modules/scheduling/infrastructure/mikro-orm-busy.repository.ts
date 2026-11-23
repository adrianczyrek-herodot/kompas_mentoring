import type { EntityManager } from '@mikro-orm/postgresql';
import { Temporal } from 'temporal-polyfill';
import type { MentorId } from '../../../shared/domain/index.ts';
import type { BusyRepository } from '../application/ports.ts';
import type { Interval } from '../domain/policies/slots-for.policy.ts';

/**
 * Adapter: time that blocks booking although the template is open (spec §4.4, Q17).
 *
 * Bookings in a calendar-occupying state block the mentor's slot for their `during` range
 * (`[starts_at, ends_at + buffer)`); an expired hold does not, because slot reads filter
 * `hold_expires_at > now()`. Google `external_busy` joins in E3-S10.
 */
export class MikroOrmBusyRepository implements BusyRepository {
  readonly #em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.#em = em;
  }

  async listBusy(
    mentorId: MentorId,
    range: { from: Temporal.Instant; to: Temporal.Instant },
  ): Promise<Interval[]> {
    // Raw SQL returns `timestamptz` as text on this pool (lesson backend 2026-11-23), so the query
    // asks PostgreSQL for epoch milliseconds and the adapter turns the numbers into instants.
    const rows = await this.#em.getConnection().execute<{ startMs: string; endMs: string }[]>(
      `select (extract(epoch from lower("during")) * 1000)::bigint as "startMs",
              (extract(epoch from upper("during")) * 1000)::bigint as "endMs"
        from "scheduling"."booking"
        where "mentor_id" = ?
          and "status" in ('hold', 'pending_payment', 'requested', 'scheduled', 'in_progress')
          and "during" && tstzrange(?, ?, '[)')
          and ("status" <> 'hold' or "hold_expires_at" > ?)`,
      [
        mentorId,
        new Date(range.from.epochMilliseconds),
        new Date(range.to.epochMilliseconds),
        new Date(range.from.epochMilliseconds),
      ],
      'all',
    );
    return rows.map((row) => ({
      start: Temporal.Instant.fromEpochMilliseconds(Number(row.startMs)),
      end: Temporal.Instant.fromEpochMilliseconds(Number(row.endMs)),
    }));
  }
}
