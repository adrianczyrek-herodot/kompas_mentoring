import { Temporal } from 'temporal-polyfill';
import { UserId } from '../../../../shared/domain/index.ts';
import type { AuthSession, SessionReader } from '../../application/get-current-user.query.ts';
import { ROLES, type Role } from '../../domain/role.ts';
import type { Auth } from './create-auth.ts';

const parseRoles = (raw: unknown): Role[] =>
  Array.isArray(raw) ? raw.filter((role): role is Role => ROLES.includes(role as Role)) : [];

const toInstant = (date: Date) => Temporal.Instant.fromEpochMilliseconds(date.getTime());

export class BetterAuthSessionReader implements SessionReader {
  readonly #auth: Auth;

  constructor({ auth }: { auth: Auth }) {
    this.#auth = auth;
  }

  async read(headers: Headers): Promise<AuthSession | null> {
    const result = await this.#auth.api.getSession({ headers });
    if (result === null) return null;
    const { user, session } = result;
    return {
      user: {
        id: UserId.parse(user.id),
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled === true,
        roles: parseRoles(user.roles),
      },
      createdAt: toInstant(session.createdAt),
      expiresAt: toInstant(session.expiresAt),
    };
  }
}
