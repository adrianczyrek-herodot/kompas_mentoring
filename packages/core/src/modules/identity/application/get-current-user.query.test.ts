import { FakeClock } from '@kompas/testing';
import { describe, expect, it } from 'vitest';
import { newId, UserId } from '../../../shared/domain/index.ts';
import type { Role } from '../domain/role.ts';
import { type AuthSession, makeGetCurrentUser } from './get-current-user.query.ts';

const clock = new FakeClock();
const sessionOf = (roles: Role[], signedInHoursAgo: number): AuthSession => ({
  user: {
    id: newId(UserId),
    name: 'Ola',
    email: 'ola@example.com',
    emailVerified: true,
    twoFactorEnabled: true,
    roles,
  },
  createdAt: clock.now().subtract({ hours: signedInHoursAgo }),
  expiresAt: clock.now().add({ hours: 24 * 29 }),
});
const getCurrentUser = (session: AuthSession | null) =>
  makeGetCurrentUser({ clock, sessionReader: { read: () => Promise.resolve(session) } })(
    new Headers(),
  );

describe('getCurrentUser', () => {
  it('returns null without a session', async () => {
    expect(await getCurrentUser(null)).toBeNull();
  });

  it('returns the user of a renewed session', async () => {
    const session = sessionOf(['student'], 24 * 10);
    expect(await getCurrentUser(session)).toBe(session.user);
  });

  it('ends admin sessions 12 h after sign-in even when renewed', async () => {
    expect(await getCurrentUser(sessionOf(['admin_trust'], 11))).not.toBeNull();
    expect(await getCurrentUser(sessionOf(['admin_trust'], 13))).toBeNull();
  });
});
