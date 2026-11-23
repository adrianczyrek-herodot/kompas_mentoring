import type { EntityManager } from '@mikro-orm/postgresql';
import { fromKysely, type PgBoss } from 'pg-boss';

/** MikroORM 7 runs transactions on Kysely, which pg-boss can write through directly. */
type KyselyTransaction = Parameters<typeof fromKysely>[0];

/**
 * Event as it travels between modules (schemas: `packages/contracts/events`). Core stays generic;
 * module adapters build and parse the concrete events with the contract schemas.
 */
export interface OutboxEvent {
  readonly eventId: string;
  readonly name: string;
  /** ISO 8601 instant. */
  readonly occurredAt: string;
  readonly payload: object;
}

/**
 * Publishes events as pg-boss jobs on the transaction of the change itself (spec §4.6 "outbox"):
 * a rolled back change leaves no job behind, a committed one always has its jobs.
 */
export interface EventPublisher {
  publish(em: EntityManager, events: readonly OutboxEvent[]): Promise<void>;
}

/** pg-boss pub/sub: each consumer subscribes its own queue (`<consumer>/<event>`) to the event name. */
export class PgBossEventPublisher implements EventPublisher {
  readonly #boss: PgBoss;
  #started: Promise<unknown> | undefined;

  constructor({ boss }: { boss: PgBoss }) {
    this.#boss = boss;
  }

  async publish(em: EntityManager, events: readonly OutboxEvent[]): Promise<void> {
    if (events.length === 0) return;
    const transaction = em.getTransactionContext<KyselyTransaction>();
    if (transaction === undefined) {
      throw new Error(
        'publish() must run inside em.transactional() — the outbox needs the change transaction',
      );
    }
    // Web only sends jobs (spec §1.4): its boss neither migrates nor supervises, it just needs a pool.
    this.#started ??= this.#boss.start();
    await this.#started;
    const db = fromKysely(transaction);
    for (const event of events) {
      await this.#boss.publish(event.name, event, { db });
    }
  }
}
