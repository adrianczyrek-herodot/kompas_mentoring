import { Temporal } from 'temporal-polyfill';
import { UserId } from '../../../../shared/domain/index.ts';
import type { AuthSession, SessionReader } from '../../application/get-current-user.query.ts';
import { ROLES, type Role } from '../../domain/role.ts';
import type { Auth } from './create-auth.ts';

const parseRoles = (raw: unknown): Role[] =>
  Array.isArray(raw) ? raw.filter((role): role is Role => ROLES.includes(role as Role)) : [];

const toInstant = (date: Date) => Temporal.Instant.fromEpochMilliseconds(date.getTime());

/**
 * Q12: the browser writes `timeZone` through Better Auth (`input: true`), so the value is client
 * input — anything that is not an IANA zone reads as "unknown" instead of breaking date formatting.
 */
const parseTimeZone = (raw: unknown): string | null => {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 64) return null;
  try {
    return new Intl.DateTimeFormat('en', { timeZone: raw }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
};

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
        timeZone: parseTimeZone(user.timeZone),
      },
      createdAt: toInstant(session.createdAt),
      expiresAt: toInstant(session.expiresAt),
    };
  }
}
