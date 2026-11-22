import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { hasPermission, isAdmin } from '../role.ts';
import {
  mustSetUpTwoFactor,
  sessionEndedByAdminPolicy,
  sessionExpiresAt,
} from './session.policy.ts';

describe('roles, sessions and 2FA (F1 Q4–Q5)', () => {
  const createdAt = Temporal.Instant.from('2026-11-10T08:00:00Z');
  const renewed = { createdAt, expiresAt: Temporal.Instant.from('2026-12-10T08:00:00Z') };

  it('keeps renewed sessions of users and caps admin sessions 12 h after sign-in', () => {
    expect(sessionExpiresAt(['student'], renewed)).toEqual(renewed.expiresAt);
    expect(sessionExpiresAt(['mentor', 'admin_trust'], renewed).toString()).toBe(
      '2026-11-10T20:00:00Z',
    );
  });

  it('never extends an admin session past its own expiry', () => {
    const early = { createdAt, expiresAt: Temporal.Instant.from('2026-11-10T09:00:00Z') };
    expect(sessionExpiresAt(['admin_finance'], early)).toEqual(early.expiresAt);
  });

  it('flags only the 12 h admin cap, never the session own expiry or a user session', () => {
    const beforeCap = Temporal.Instant.from('2026-11-10T19:59:59Z');
    const afterCap = Temporal.Instant.from('2026-11-10T20:00:01Z');
    expect(sessionEndedByAdminPolicy(['admin_trust'], renewed, beforeCap)).toBe(false);
    expect(sessionEndedByAdminPolicy(['admin_trust'], renewed, afterCap)).toBe(true);
    expect(sessionEndedByAdminPolicy(['student'], renewed, afterCap)).toBe(false);
    // The session's own expiry is not the admin policy — the generic message applies.
    const short = { createdAt, expiresAt: Temporal.Instant.from('2026-11-10T09:00:00Z') };
    expect(sessionEndedByAdminPolicy(['admin_finance'], short, afterCap)).toBe(false);
  });

  it('requires 2FA only for admins without it', () => {
    expect(mustSetUpTwoFactor(['admin_finance'], false)).toBe(true);
    expect(mustSetUpTwoFactor(['admin_finance'], true)).toBe(false);
    expect(mustSetUpTwoFactor(['mentor'], false)).toBe(false);
  });

  it('grants admin access to admin roles only', () => {
    expect(isAdmin(['student', 'mentor'])).toBe(false);
    expect(hasPermission(['admin_trust'], 'admin.access')).toBe(true);
    expect(hasPermission(['mentor'], 'admin.access')).toBe(false);
    expect(hasPermission(['student'], 'account.manage.own')).toBe(true);
  });
});
