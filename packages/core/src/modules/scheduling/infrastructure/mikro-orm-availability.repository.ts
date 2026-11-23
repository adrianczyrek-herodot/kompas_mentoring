import type { EntityManager } from '@mikro-orm/postgresql';
import type { Temporal } from 'temporal-polyfill';
import { v7 as uuidv7 } from 'uuid';
import type { MentorId } from '../../../shared/domain/index.ts';
import type { AvailabilityRepository } from '../application/ports.ts';
import type {
  AvailabilityException,
  AvailabilityRule,
  MentorSchedule,
} from '../domain/availability.entity.ts';
import { AVAILABILITY } from '../domain/policies/config.ts';
import { toDate, toException, toLocalString, toRule, toSchedule } from './availability.mapper.ts';
import {
  AvailabilityExceptionRecord,
  AvailabilityRuleRecord,
  MentorScheduleRecord,
} from './scheduling.records.ts';

/** Adapter: mentor availability in schema `scheduling` (spec §2.4). */
export class MikroOrmAvailabilityRepository implements AvailabilityRepository {
  readonly #em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.#em = em;
  }

  async findSchedule(mentorId: MentorId): Promise<MentorSchedule | null> {
    const row = await this.#em.findOne(
      MentorScheduleRecord,
      { mentorId },
      { disableIdentityMap: true },
    );
    return row === null ? null : toSchedule(row);
  }

  async listRules(mentorId: MentorId): Promise<AvailabilityRule[]> {
    const rows = await this.#em.find(
      AvailabilityRuleRecord,
      { mentorId },
      { orderBy: { weekday: 'asc', startLocal: 'asc' }, disableIdentityMap: true },
    );
    return rows.map(toRule);
  }

  async listExceptions(mentorId: MentorId): Promise<AvailabilityException[]> {
    const rows = await this.#em.find(
      AvailabilityExceptionRecord,
      { mentorId },
      { orderBy: { startsAt: 'asc' }, disableIdentityMap: true },
    );
    return rows.map(toException);
  }

  async findException(mentorId: MentorId, id: string): Promise<AvailabilityException | null> {
    const row = await this.#em.findOne(
      AvailabilityExceptionRecord,
      { mentorId, id },
      { disableIdentityMap: true },
    );
    return row === null ? null : toException(row);
  }

  saveTemplate(
    mentorId: MentorId,
    rules: readonly AvailabilityRule[],
    expectedVersion: number,
    now: Temporal.Instant,
  ): Promise<'saved' | 'version_conflict'> {
    return this.#em.transactional(async (em) => {
      // Inserting version 0 lets the first save match `expectedVersion: 0` while two concurrent
      // first saves still collide on the version bump.
      await this.#ensureSchedule(em, mentorId, now);
      const updated = await em.nativeUpdate(
        MentorScheduleRecord,
        { mentorId, version: expectedVersion },
        { version: expectedVersion + 1, updatedAt: toDate(now) },
      );
      if (updated === 0) return 'version_conflict';
      await em.nativeDelete(AvailabilityRuleRecord, { mentorId });
      if (rules.length > 0) {
        await em.insertMany(
          AvailabilityRuleRecord,
          rules.map((rule) => ({
            id: uuidv7(),
            mentorId,
            weekday: rule.weekday,
            startLocal: toLocalString(rule.startLocal),
            endLocal: toLocalString(rule.endLocal),
          })),
        );
      }
      return 'saved';
    });
  }

  async saveSettings(
    settings: Pick<MentorSchedule, 'timeZone' | 'minNoticeMinutes' | 'bufferMinutes'>,
    mentorId: MentorId,
    expectedVersion: number,
    now: Temporal.Instant,
  ): Promise<'saved' | 'version_conflict'> {
    return this.#em.transactional(async (em) => {
      await this.#ensureSchedule(em, mentorId, now);
      const updated = await em.nativeUpdate(
        MentorScheduleRecord,
        { mentorId, version: expectedVersion },
        {
          timeZone: settings.timeZone,
          minNoticeMinutes: settings.minNoticeMinutes,
          bufferMinutes: settings.bufferMinutes,
          version: expectedVersion + 1,
          updatedAt: toDate(now),
        },
      );
      return updated === 0 ? 'version_conflict' : 'saved';
    });
  }

  async insertException(
    mentorId: MentorId,
    exception: AvailabilityException,
    now: Temporal.Instant,
  ): Promise<void> {
    await this.#em.transactional(async (em) => {
      await this.#ensureSchedule(em, mentorId, now);
      await em.insert(AvailabilityExceptionRecord, {
        id: exception.id,
        mentorId,
        startsAt: toDate(exception.startsAt),
        endsAt: toDate(exception.endsAt),
        kind: exception.kind,
        note: exception.note,
        createdAt: toDate(now),
      });
    });
  }

  async deleteException(mentorId: MentorId, id: string): Promise<boolean> {
    const deleted = await this.#em.nativeDelete(AvailabilityExceptionRecord, { mentorId, id });
    return deleted > 0;
  }

  // E3-S2: no `booking` table yet (step 10) — the list is always empty, the command keeps the
  // conflict contract so the UI can rely on it from now on (Q11). The interface still declares the
  // mentor and the new template; step 10 adds them back when the query has a table to read.
  listConflictingBookingIds(): Promise<string[]> {
    return Promise.resolve([]);
  }

  async #ensureSchedule(
    em: EntityManager,
    mentorId: MentorId,
    now: Temporal.Instant,
  ): Promise<void> {
    await em.getConnection().execute(
      `insert into "scheduling"."mentor_schedule"
        ("mentor_id", "time_zone", "min_notice_minutes", "buffer_minutes", "version", "created_at", "updated_at")
       values (?, ?, ?, ?, 0, ?, ?)
       on conflict ("mentor_id") do nothing`,
      [
        mentorId,
        AVAILABILITY.defaultTimeZone,
        AVAILABILITY.notice.defaultMinutes,
        AVAILABILITY.buffer.defaultMinutes,
        toDate(now),
        toDate(now),
      ],
      'all',
      em.getTransactionContext(),
    );
  }
}
