import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PgBoss } from 'pg-boss';
import { v7 as uuidv7 } from 'uuid';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createOrm, migrateUp, type Orm } from '../db/orm.ts';
import { dockerAvailable, integrationSuite, POSTGRES_IMAGE } from '../db/test-database.ts';
import { createBoss } from '../jobs/boss.ts';
import { withInbox } from './inbox.ts';
import { type OutboxEvent, PgBossEventPublisher } from './outbox.ts';
import { queueFor } from './subscriptions.ts';

const EVENT = 'test.something_happened.v1';
const QUEUE = queueFor({ consumer: 'test', event: EVENT });

const anEvent = (): OutboxEvent => ({
  eventId: uuidv7(),
  name: EVENT,
  occurredAt: '2026-11-22T12:00:00Z',
  payload: { value: 1 },
});

describe.skipIf(!dockerAvailable)(
  integrationSuite('events: outbox in the change transaction, inbox'),
  () => {
    let database: StartedPostgreSqlContainer;
    let orm: Orm;
    let worker: PgBoss;
    let web: PgBoss;
    let publisher: PgBossEventPublisher;

    const jobsInQueue = async () =>
      (await worker.findJobs<OutboxEvent>(QUEUE)).map((job) => job.data);

    beforeAll(async () => {
      database = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
      const url = database.getConnectionUri();
      orm = createOrm(url);
      await migrateUp(orm);
      // The worker owns the pg-boss schema and the consumer queues (spec §1.4).
      worker = new PgBoss({
        connectionString: url,
        migrate: true,
        supervise: false,
        schedule: false,
      });
      await worker.start();
      await worker.createQueue(QUEUE);
      await worker.subscribe(EVENT, QUEUE);
      web = createBoss('web', url);
      publisher = new PgBossEventPublisher({ boss: web });
      const connection = orm.em.getConnection();
      await connection.execute('create schema "events_test"');
      await connection.execute(
        'create table "events_test"."inbox_event" ("event_id" uuid primary key, "processed_at" timestamptz not null)',
      );
    });

    afterAll(async () => {
      await web.stop({ graceful: false });
      await worker.stop({ graceful: false });
      await orm.close();
      await database.stop();
    });

    it('leaves no job behind when the change rolls back', async () => {
      const event = anEvent();
      await expect(
        orm.em.fork().transactional(async (em) => {
          await publisher.publish(em, [event]);
          throw new Error('change failed');
        }),
      ).rejects.toThrow('change failed');
      expect((await jobsInQueue()).map((job) => job.eventId)).not.toContain(event.eventId);
    });

    it('enqueues the event for every subscribed consumer when the change commits', async () => {
      const event = anEvent();
      await orm.em.fork().transactional((em) => publisher.publish(em, [event]));
      expect(await jobsInQueue()).toContainEqual(event);
    });

    it('refuses to publish outside a transaction', async () => {
      await expect(publisher.publish(orm.em.fork(), [anEvent()])).rejects.toThrow(
        /em\.transactional/,
      );
    });

    it('applies a duplicate event only once', async () => {
      const { eventId } = anEvent();
      let effects = 0;
      const handle = () => {
        effects += 1;
        return Promise.resolve();
      };
      const first = await withInbox(orm.em.fork(), 'events_test', eventId, handle);
      const second = await withInbox(orm.em.fork(), 'events_test', eventId, handle);
      expect([first, second, effects]).toEqual(['processed', 'duplicate', 1]);
    });

    it('processes the event again after a failed attempt (the inbox marker rolls back)', async () => {
      const { eventId } = anEvent();
      await expect(
        withInbox(orm.em.fork(), 'events_test', eventId, () =>
          Promise.reject(new Error('handler failed')),
        ),
      ).rejects.toThrow('handler failed');
      expect(await withInbox(orm.em.fork(), 'events_test', eventId, () => Promise.resolve())).toBe(
        'processed',
      );
    });
  },
);
