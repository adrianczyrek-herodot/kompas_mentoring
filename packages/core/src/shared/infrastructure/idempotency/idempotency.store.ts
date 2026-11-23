import type { EntityManager } from '@mikro-orm/postgresql';

/** Outcome of claiming one Idempotency-Key before the handler runs (spec §4.6). */
export type IdempotencyClaim =
  | { readonly kind: 'claimed' }
  /** The same request already succeeded: replay its stored response (§4.6). */
  | { readonly kind: 'replay'; readonly response: unknown }
  /** Same key, different body → 422 `idempotency.key_reused`. */
  | { readonly kind: 'body_mismatch' }
  /** Another request with the same key is still running → 409 `idempotency.in_progress`. */
  | { readonly kind: 'in_flight' };

/** Port: the `platform.idempotency_key` table (spec §4.6). */
export interface IdempotencyStore {
  claim(input: {
    readonly userId: string;
    readonly key: string;
    readonly fingerprint: string;
  }): Promise<IdempotencyClaim>;
  /** Stores the successful response so a repeat returns exactly the same answer. */
  complete(input: { readonly userId: string; readonly key: string; readonly response: unknown }): Promise<void>;
  /** Drops an unfinished claim after a failed handler, so the client may retry the same key. */
  release(input: { readonly userId: string; readonly key: string }): Promise<void>;
  /** Housekeeping: removes keys older than the 24 h retention (worker cron). */
  purgeExpired(): Promise<number>;
}

/** §4.6: a key is kept 24 h — long enough to cover a retry, short enough not to grow forever. */
const RETENTION = '24 hours';

const parseResponse = (value: unknown): unknown =>
  typeof value === 'string' ? (JSON.parse(value) as unknown) : value;

/**
 * Adapter: `platform.idempotency_key`. All SQL is raw because the table is cross-module
 * infrastructure, not a domain entity of any module. The composite primary key `(user_id, key)`
 * makes the claim race-free: exactly one concurrent insert wins, the others observe the row.
 */
export class MikroOrmIdempotencyStore implements IdempotencyStore {
  readonly #em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.#em = em;
  }

  async claim({ userId, key, fingerprint }: {
    userId: string;
    key: string;
    fingerprint: string;
  }): Promise<IdempotencyClaim> {
    const connection = this.#em.getConnection();
    // A stale in-flight claim (process died, TTL passed) is reclaimable.
    await connection.execute(
      `delete from "platform"."idempotency_key"
        where "user_id" = ? and "key" = ? and "expires_at" <= now()`,
      [userId, key],
      'all',
    );
    const inserted = await connection.execute<{ key: string }[]>(
      `insert into "platform"."idempotency_key"
        ("user_id", "key", "fingerprint", "response", "created_at", "updated_at", "expires_at")
       values (?, ?, ?, null, now(), now(), now() + interval '${RETENTION}')
       on conflict ("user_id", "key") do nothing
       returning "key"`,
      [userId, key, fingerprint],
      'all',
    );
    if (inserted.length > 0) return { kind: 'claimed' };
    const rows = await connection.execute<{ fingerprint: string; response: unknown }[]>(
      `select "fingerprint", "response" from "platform"."idempotency_key"
        where "user_id" = ? and "key" = ?`,
      [userId, key],
      'all',
    );
    const row = rows[0];
    // Deleted between the insert and the select: treat as a fresh claim rather than guessing.
    if (row === undefined) return { kind: 'claimed' };
    if (row.response !== null && row.response !== undefined) {
      return { kind: 'replay', response: parseResponse(row.response) };
    }
    return row.fingerprint === fingerprint ? { kind: 'in_flight' } : { kind: 'body_mismatch' };
  }

  async complete({ userId, key, response }: {
    userId: string;
    key: string;
    response: unknown;
  }): Promise<void> {
    await this.#em.getConnection().execute(
      `update "platform"."idempotency_key"
        set "response" = ?::jsonb, "updated_at" = now()
        where "user_id" = ? and "key" = ?`,
      [JSON.stringify(response ?? null), userId, key],
      'all',
    );
  }

  async release({ userId, key }: { userId: string; key: string }): Promise<void> {
    await this.#em.getConnection().execute(
      `delete from "platform"."idempotency_key"
        where "user_id" = ? and "key" = ? and "response" is null`,
      [userId, key],
      'all',
    );
  }

  async purgeExpired(): Promise<number> {
    const rows = await this.#em.getConnection().execute<{ removed: string }[]>(
      `with deleted as (
        delete from "platform"."idempotency_key" where "expires_at" <= now() returning 1
      ) select count(*)::text as "removed" from deleted`,
      [],
      'all',
    );
    return Number(rows[0]?.removed ?? '0');
  }
}
