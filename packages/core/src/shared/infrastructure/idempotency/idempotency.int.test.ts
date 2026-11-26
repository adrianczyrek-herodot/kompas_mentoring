import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createOrm, migrateUp, type Orm } from '../db/orm.ts';
import { dockerAvailable, integrationSuite, POSTGRES_IMAGE } from '../db/test-database.ts';
import { MikroOrmIdempotencyStore } from './idempotency.store.ts';

const USER = 'user-1';
const KEY = 'key-1';
const FINGERPRINT = 'fp-1';

describe.skipIf(!dockerAvailable)(
  integrationSuite('idempotency: Idempotency-Key on PostgreSQL (spec §4.6)'),
  () => {
    let database: StartedPostgreSqlContainer;
    let orm: Orm;

    const store = () => new MikroOrmIdempotencyStore({ em: orm.em.fork() });

    beforeAll(async () => {
      database = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
      orm = createOrm(database.getConnectionUri());
      await migrateUp(orm);
    });

    afterAll(async () => {
      await orm.close();
      await database.stop();
    });

    it('claims a fresh key, completes it and replays the same response', async () => {
      expect(await store().claim({ userId: USER, key: KEY, fingerprint: FINGERPRINT })).toEqual({
        kind: 'claimed',
      });
      await store().complete({ userId: USER, key: KEY, response: { bookingId: 'b1' } });
      expect(await store().claim({ userId: USER, key: KEY, fingerprint: FINGERPRINT })).toEqual({
        kind: 'replay',
        response: { bookingId: 'b1' },
      });
    });

    it('rejects the same key with a different body (422)', async () => {
      await store().claim({ userId: USER, key: 'key-2', fingerprint: FINGERPRINT });
      expect(
        await store().claim({ userId: USER, key: 'key-2', fingerprint: 'other' }),
      ).toEqual({ kind: 'body_mismatch' });
    });

    it('rejects a completed key replayed with a different body (422 before replay)', async () => {
      await store().claim({ userId: USER, key: 'key-2b', fingerprint: FINGERPRINT });
      await store().complete({ userId: USER, key: 'key-2b', response: { bookingId: 'b3' } });
      expect(
        await store().claim({ userId: USER, key: 'key-2b', fingerprint: 'other' }),
      ).toEqual({ kind: 'body_mismatch' });
    });

    it('lets exactly one of N concurrent claims win, the rest are in flight (409)', async () => {
      const results = await Promise.all(
        Array.from({ length: 5 }, () =>
          store().claim({ userId: USER, key: 'key-race', fingerprint: FINGERPRINT }),
        ),
      );
      expect(results.filter((r) => r.kind === 'claimed')).toHaveLength(1);
      expect(results.filter((r) => r.kind === 'in_flight')).toHaveLength(4);
    });

    it('frees the key after a failed handler, so the same key may be retried', async () => {
      await store().claim({ userId: USER, key: 'key-3', fingerprint: FINGERPRINT });
      await store().release({ userId: USER, key: 'key-3' });
      expect(await store().claim({ userId: USER, key: 'key-3', fingerprint: FINGERPRINT })).toEqual({
        kind: 'claimed',
      });
    });

    it('scopes the same key to its user', async () => {
      await store().claim({ userId: USER, key: 'key-shared', fingerprint: FINGERPRINT });
      await store().complete({ userId: USER, key: 'key-shared', response: { bookingId: 'b2' } });
      expect(
        await store().claim({ userId: 'user-2', key: 'key-shared', fingerprint: FINGERPRINT }),
      ).toEqual({ kind: 'claimed' });
    });

    it('reclaims an expired in-flight key and purges expired rows', async () => {
      await store().claim({ userId: USER, key: 'key-expired', fingerprint: FINGERPRINT });
      await orm.em.getConnection().execute(
        `update "platform"."idempotency_key" set "expires_at" = now() - interval '1 hour' where "key" = 'key-expired'`,
      );
      expect(
        await store().claim({ userId: USER, key: 'key-expired', fingerprint: FINGERPRINT }),
      ).toEqual({ kind: 'claimed' });
      await orm.em.getConnection().execute(
        `update "platform"."idempotency_key" set "expires_at" = now() - interval '1 hour'`,
      );
      expect(await store().purgeExpired()).toBeGreaterThan(0);
    });
  },
);
