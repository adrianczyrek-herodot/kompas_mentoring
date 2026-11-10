import { describe, expect, it } from 'vitest';
import { hasPermission, isAdmin } from '../role.ts';
import { mustSetUpTwoFactor, sessionTtlFor } from './session.policy.ts';

describe('roles, sessions and 2FA (F1 Q4–Q5)', () => {
  it('gives users 30-day and admins 12-hour sessions', () => {
    expect(sessionTtlFor(['student']).total('hours')).toBe(30 * 24);
    expect(sessionTtlFor(['mentor', 'admin_trust']).total('hours')).toBe(12);
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
