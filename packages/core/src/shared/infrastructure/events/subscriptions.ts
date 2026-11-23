import type { PgBoss } from 'pg-boss';
import type { OutboxEvent } from './outbox.ts';

/**
 * A module reacting to another module's event. `handle` parses the job data with the contract
 * schema and wraps its effect in `withInbox`, so retries and redeliveries stay harmless.
 */
export interface EventSubscription {
  /** Event name, e.g. `trust.mentor_application_decided.v1`. */
  readonly event: string;
  /** Consuming module, e.g. `catalog`. */
  readonly consumer: string;
  handle(data: unknown): Promise<void>;
}

/** One queue per consumer and event, so each consumer retries and dead-letters on its own. */
export const queueFor = (subscription: Pick<EventSubscription, 'consumer' | 'event'>): string =>
  `${subscription.consumer}/${subscription.event}`;

/** Worker: declares the queues, subscribes them to their events and starts processing. */
export const startEventSubscriptions = async (
  boss: PgBoss,
  subscriptions: readonly EventSubscription[],
): Promise<void> => {
  for (const subscription of subscriptions) {
    const queue = queueFor(subscription);
    await boss.createQueue(queue);
    await boss.subscribe(subscription.event, queue);
    await boss.work<OutboxEvent>(queue, async (jobs) => {
      for (const job of jobs) await subscription.handle(job.data);
    });
  }
};
