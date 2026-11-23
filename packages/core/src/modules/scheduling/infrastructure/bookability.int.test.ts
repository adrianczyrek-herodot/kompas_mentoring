import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { PgBoss } from 'pg-boss';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type AppContainer, createAppContainer, createRequestScope } from '../../../container.ts';
import { UserId } from '../../../shared/domain/index.ts';
import { migrateUp } from '../../../shared/infrastructure/db/orm.ts';
import {
  dockerAvailable,
  integrationSuite,
  POSTGRES_IMAGE,
} from '../../../shared/infrastructure/db/test-database.ts';
import { parseEnv } from '../../../shared/infrastructure/env.ts';
import type { OutboxEvent } from '../../../shared/infrastructure/events/outbox.ts';
import { queueFor } from '../../../shared/infrastructure/events/subscriptions.ts';
import { createBoss } from '../../../shared/infrastructure/jobs/boss.ts';
import { createLogger } from '../../../shared/infrastructure/logger.ts';
import type { CurrentUser } from '../../identity/index.ts';

const PASSWORD = 'correct-horse-battery';
const EVENT = 'catalog.mentor_bookability_changed.v1';
const QUEUE = queueFor({ consumer: 'scheduling', event: EVENT });

describe.skipIf(!dockerAvailable)(
  integrationSuite('scheduling: catalog.mentor_bookability_changed.v1 → mentor_bookability'),
  () => {
    let database: StartedPostgreSqlContainer;
    let container: AppContainer;
    let worker: PgBoss;

    const rows = <T>(sql: string, params: unknown[] = []) =>
      container.cradle.orm.em.getConnection().execute<T[]>(sql, params);

    const jobs = async () => (await worker.findJobs<OutboxEvent>(QUEUE)).map((job) => job.data);

    const mentorWithProfile = async (): Promise<CurrentUser> => {
      const email = `bookability-${crypto.randomUUID()}@example.com`;
      const body = {
        name: 'Marta',
        email,
        password: PASSWORD,
        terms: true,
        privacy: true,
        as: 'mentor',
      };
      const { user } = await container.cradle.auth.api.signUpEmail({ body });
      return {
        id: UserId.parse(user.id),
        name: user.name,
        email,
        emailVerified: true,
        twoFactorEnabled: false,
        timeZone: null,
        roles: ['mentor'],
      };
    };

    beforeAll(async () => {
      database = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
      const url = database.getConnectionUri();
      container = createAppContainer({
        env: parseEnv({ DATABASE_URL: url, AUTH_BREACHED_PASSWORD_CHECK: 'off' }),
        logger: createLogger({ level: 'silent' }),
      });
      await migrateUp(container.cradle.orm);
      // The worker owns the queues: `scheduling` subscribes its own queue to the catalog event.
      worker = createBoss('worker', url);
      await worker.start();
      await worker.createQueue(QUEUE);
      await worker.subscribe(EVENT, QUEUE);
    });

    afterAll(async () => {
      await worker.stop({ graceful: false });
      // The web-side publisher opened its own pg-boss pool on the first publish (spec §1.4).
      await container.cradle.boss.stop({ graceful: false });
      await container.cradle.orm.close();
      await database.stop();
    });

    it('publishes the bookability change in the transaction of the profile save (outbox)', async () => {
      const mentor = await mentorWithProfile();
      const scope = createRequestScope(container, { requestId: 'int-bookability-1' });
      const profile = (await scope.cradle.openMyMentorProfile(mentor))._unsafeUnwrap();
      await scope.cradle.setAcceptingNew(mentor, {
        acceptingNew: false,
        expectedVersion: profile.version,
      });

      const published = (await jobs()).filter((job) => job.name === EVENT);
      const event = published.at(-1);
      expect(event?.payload).toMatchObject({
        mentorUserId: mentor.id,
        mentorProfileId: profile.id,
        bookable: false,
        acceptingNew: false,
        rate60: null,
      });
    });

    it('applies the event to mentor_bookability exactly once (inbox dedupe by event_id)', async () => {
      const mentor = await mentorWithProfile();
      const scope = createRequestScope(container, { requestId: 'int-bookability-2' });
      const profile = (await scope.cradle.openMyMentorProfile(mentor))._unsafeUnwrap();
      await scope.cradle.saveProfileStep(
        mentor,
        { step: 'rate', fields: { rate60: { amount: 15_000n, currency: 'PLN' } } },
        profile.version,
      );
      const event = (await jobs()).filter((job) => job.name === EVENT).at(-1);
      if (event === undefined) throw new Error('the rate save published nothing');

      const subscription = container.cradle.eventSubscriptions.find((s) => s.event === EVENT);
      if (subscription === undefined) throw new Error('scheduling subscribes the catalog event');
      await subscription.handle(event);
      await subscription.handle(event); // a redelivered job

      const stored = await rows<{
        mentor_id: string;
        is_bookable: boolean;
        rate_60_amount: string;
      }>(
        'select "mentor_id", "is_bookable", "rate_60_amount" from "scheduling"."mentor_bookability" where "mentor_profile_id" = ?',
        [profile.id],
      );
      expect(stored).toEqual([
        { mentor_id: mentor.id, is_bookable: false, rate_60_amount: '15000' },
      ]);
      const inbox = await rows<{ count: string }>(
        'select count(*)::text as count from "scheduling"."inbox_event" where "event_id" = ?',
        [event.eventId],
      );
      expect(inbox[0]?.count).toBe('1');

      // The projection is what the availability query reads (a draft is still not bookable).
      const projection = await scope.cradle.mentorBookabilityRepository.findByProfileId(profile.id);
      expect(projection?.bookable).toBe(false);
      expect(projection?.rate60?.amount).toBe(15_000n);
    });

    it('keeps one row per mentor profile and overwrites it with the newest state', async () => {
      const mentor = await mentorWithProfile();
      const scope = createRequestScope(container, { requestId: 'int-bookability-3' });
      const profile = (await scope.cradle.openMyMentorProfile(mentor))._unsafeUnwrap();
      const subscription = container.cradle.eventSubscriptions.find((s) => s.event === EVENT);
      if (subscription === undefined) throw new Error('scheduling subscribes the catalog event');

      const anEvent = (bookable: boolean, acceptingNew: boolean, eventId: string): OutboxEvent => ({
        eventId,
        name: EVENT,
        occurredAt: '2026-11-24T09:00:00Z',
        payload: {
          mentorUserId: mentor.id,
          mentorProfileId: profile.id,
          bookable,
          acceptingNew,
          rate60: { amountMinorUnits: 12_000, currency: 'PLN' },
        },
      });
      await subscription.handle(anEvent(true, true, '0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d20'));
      await subscription.handle(anEvent(false, false, '0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d21'));

      const projection = await scope.cradle.mentorBookabilityRepository.findByProfileId(profile.id);
      expect(projection).toMatchObject({ bookable: false, acceptingNew: false });
      const count = await rows<{ count: string }>(
        'select count(*)::text as count from "scheduling"."mentor_bookability" where "mentor_profile_id" = ?',
        [profile.id],
      );
      expect(count[0]?.count).toBe('1');
    });
  },
);
