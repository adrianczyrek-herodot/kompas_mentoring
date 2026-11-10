import { Temporal } from 'temporal-polyfill';
import type { Clock, UserId } from '../../../shared/domain/index.ts';
import { sessionExpiresAt } from '../domain/policies/session.policy.ts';
import type { Role } from '../domain/role.ts';

export interface CurrentUser {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly twoFactorEnabled: boolean;
  readonly roles: readonly Role[];
}

export interface AuthSession {
  readonly user: CurrentUser;
  readonly createdAt: Temporal.Instant;
  readonly expiresAt: Temporal.Instant;
}

/** Port: reads the session behind the request's cookie (Better Auth adapter in `infrastructure/`). */
export interface SessionReader {
  read(headers: Headers): Promise<AuthSession | null>;
}

/** Signed-in user of the request, or `null` — also when an admin session passed its 12 h (Q5). */
export const makeGetCurrentUser =
  ({ clock, sessionReader }: { clock: Clock; sessionReader: SessionReader }) =>
  async (headers: Headers): Promise<CurrentUser | null> => {
    const session = await sessionReader.read(headers);
    if (session === null) return null;
    const expiresAt = sessionExpiresAt(session.user.roles, session);
    return Temporal.Instant.compare(expiresAt, clock.now()) > 0 ? session.user : null;
  };

export type GetCurrentUser = ReturnType<typeof makeGetCurrentUser>;
