import type { Temporal } from 'temporal-polyfill';
import { isAdmin, type Role } from '../role.ts';
import { ADMIN_SESSION_TTL, USER_SESSION_TTL } from './config.ts';

/** Q5 (F1): admins get short sessions; everyone else 30 days. */
export const sessionTtlFor = (roles: readonly Role[]): Temporal.Duration =>
  isAdmin(roles) ? ADMIN_SESSION_TTL : USER_SESSION_TTL;

/** Q4 (F1): an admin must have 2FA set up before reaching any admin route. */
export const mustSetUpTwoFactor = (roles: readonly Role[], twoFactorEnabled: boolean): boolean =>
  isAdmin(roles) && !twoFactorEnabled;
