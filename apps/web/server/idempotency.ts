import {
  type IdempotencyStore,
  MikroOrmIdempotencyStore,
  type RequestScope,
  idempotencyFingerprint,
} from '@kompas/core';
import type { CurrentUser } from '@kompas/core/identity';
import { ORPCError } from '@orpc/server';

/** RFC 9457 problem for the idempotency layer, in the same shape as the domain problems. */
const problem = (status: 409 | 422, code: string): ORPCError<string, { code: string }> =>
  new ORPCError(status === 409 ? 'CONFLICT' : 'UNPROCESSABLE_CONTENT', {
    status,
    message: code,
    data: { code },
  });

export interface IdempotentRequest {
  readonly scope: RequestScope;
  readonly actor: CurrentUser;
  readonly headers: Headers;
  /** Operation path, part of the fingerprint (e.g. `['bookings', 'holds']`). */
  readonly path: readonly string[];
  /** Validated input of the procedure; the fingerprint is taken over it. */
  readonly body: unknown;
}

/**
 * oRPC layer of Idempotency-Key (spec §4.6): claim the key before the handler, replay the stored
 * response on a repeat, 422 when the same key carries a different body, 409 while another request
 * with the key is in flight. A failed handler releases its claim, so the client can retry the same
 * key (only successful answers are stored). Used by `POST /bookings/holds`, `/checkout` and the
 * `/bookings/:id` cancel/reschedule routes.
 */
export const runIdempotent = async <T>(
  request: IdempotentRequest,
  handler: () => Promise<T>,
): Promise<T> => {
  const key = request.headers.get('idempotency-key')?.trim();
  if (key === undefined || key === '') throw problem(422, 'idempotency.key_required');
  const store: IdempotencyStore = new MikroOrmIdempotencyStore({ em: request.scope.cradle.em });
  const fingerprint = idempotencyFingerprint({ path: request.path, payload: request.body });
  const claim = await store.claim({ userId: request.actor.id, key, fingerprint });
  if (claim.kind === 'replay') return claim.response as T;
  if (claim.kind === 'body_mismatch') throw problem(422, 'idempotency.key_reused');
  if (claim.kind === 'in_flight') throw problem(409, 'idempotency.in_progress');
  try {
    const output = await handler();
    await store.complete({ userId: request.actor.id, key, response: output });
    return output;
  } catch (error) {
    await store.release({ userId: request.actor.id, key });
    throw error;
  }
};
