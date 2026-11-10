import { Temporal } from 'temporal-polyfill';

// Business constants of the identity module, each linked to its decision (spec §4.1).

/** Spec §8 / P4: passwords of at least 10 characters (upper bound guards hashing cost). */
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

/** Q5 (F1): user sessions last 30 days and renew on use; admin sessions expire after 12 h. */
export const USER_SESSION_TTL = Temporal.Duration.from({ days: 30 });
export const ADMIN_SESSION_TTL = Temporal.Duration.from({ hours: 12 });

/** Q6 (F1): current versions of the consent documents, recorded with every consent. */
export const CONSENT_DOCUMENT_VERSIONS = {
  terms: '2026-11-10',
  privacy: '2026-11-10',
  marketing: '2026-11-10',
} as const;

/** Where to land after login when no (valid) `returnTo` was given. */
export const DEFAULT_RETURN_TO = '/';
