import type { EntityManager } from '@mikro-orm/postgresql';

export type InboxOutcome = 'processed' | 'duplicate';

const SCHEMA_NAME = /^[a-z_]+$/;

/**
 * Consumer side of an event (spec §4.6): records `eventId` in the module's
 * `<schema>.inbox_event` (primary key on `event_id`) and runs the handler in the same transaction.
 * A redelivered event hits the key and is skipped; a failing handler rolls the marker back, so the
 * retry processes it again. A concurrent duplicate waits on the key until the first one commits.
 */
export const withInbox = (
  em: EntityManager,
  schema: string,
  eventId: string,
  handle: (em: EntityManager) => Promise<void>,
): Promise<InboxOutcome> => {
  if (!SCHEMA_NAME.test(schema)) throw new Error(`Invalid inbox schema name: ${schema}`);
  return em.transactional(async (tem) => {
    const inserted = await tem
      .getConnection()
      .execute<{ event_id: string }[]>(
        `insert into "${schema}"."inbox_event" ("event_id", "processed_at") values (?, now()) on conflict ("event_id") do nothing returning "event_id"`,
        [eventId],
        'all',
        tem.getTransactionContext(),
      );
    if (inserted.length === 0) return 'duplicate';
    await handle(tem);
    return 'processed';
  });
};
