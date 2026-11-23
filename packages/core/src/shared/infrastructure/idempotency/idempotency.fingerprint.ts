import { createHash } from 'node:crypto';

/** Recursively sorts object keys and drops `undefined`, so two equal bodies fingerprint alike. */
const canonical = (value: unknown): string => {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(',')}}`;
};

/**
 * Request fingerprint of one idempotent call (spec §4.6): the operation path plus a canonical form
 * of the body. The user is part of the key's scope, not of the fingerprint, so two users reusing a
 * key never collide. Same key with a different fingerprint is a client bug → 422
 * (`idempotency.key_reused`).
 */
export const idempotencyFingerprint = (input: {
  readonly path: readonly string[];
  readonly payload: unknown;
}): string =>
  createHash('sha256')
    .update(`${input.path.join('/')}\n${canonical(input.payload)}`)
    .digest('hex');
