import { Temporal } from 'temporal-polyfill';
import { isAdmin, type Role } from '../role.ts';
import { ADMIN_SESSION_TTL } from './config.ts';

/**
 * Q5 (F1): sessions renew on use for 30 days (Better Auth `expiresIn`), but an admin session
 * ends 12 h after sign-in no matter how often it was renewed.
 */
export const sessionExpiresAt = (
  roles: readonly Role[],
  session: { createdAt: Temporal.Instant; expiresAt: Temporal.Instant },
): Temporal.Instant => {
  if (!isAdmin(roles)) return session.expiresAt;
  const absolute = session.createdAt.add(ADMIN_SESSION_TTL);
  return Temporal.Instant.compare(absolute, session.expiresAt) < 0 ? absolute : session.expiresAt;
};

/** Q4 (F1): an admin must have 2FA set up before reaching any admin route. */
export const mustSetUpTwoFactor = (roles: readonly Role[], twoFactorEnabled: boolean): boolean =>
  isAdmin(roles) && !twoFactorEnabled;
