import { type BetterAuthPlugin, betterAuth } from 'better-auth';
import { haveIBeenPwned } from 'better-auth/plugins/haveibeenpwned';
import { twoFactor } from 'better-auth/plugins/two-factor';
import type { Kysely } from 'kysely';
import { v7 as uuidv7 } from 'uuid';
import type { Env } from '../../../../shared/infrastructure/env.ts';
import type { EmailVerificationSender } from '../../application/email-verification-sender.port.ts';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USER_SESSION_TTL,
} from '../../domain/policies/config.ts';
import { TimestampParsingPlugin } from './timestamp-parsing.plugin.ts';

/** Better Auth tables live in the module's own schema (spec §2.3). */
const AUTH_SCHEMA = 'identity';

/** Used only outside production, where the env schema does not require a secret. */
const DEVELOPMENT_SECRET = 'kompas-development-secret-do-not-use-in-production';

export interface AuthDeps {
  /** Kysely client of the shared MikroORM pool (`orm.em.getConnection().getClient()`). */
  db: Kysely<unknown>;
  env: Env;
  emailVerificationSender: EmailVerificationSender;
  /** HIBP k-anonymity check of new passwords (Q8, `AUTH_BREACHED_PASSWORD_CHECK`). */
  checkBreachedPasswords: boolean;
  /** Framework plugins appended last, e.g. `nextCookies()` from apps/web (must stay last). */
  plugins: readonly BetterAuthPlugin[];
}

const socialProviders = (env: Env) => ({
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
    : {}),
  ...(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET
    ? { linkedin: { clientId: env.LINKEDIN_CLIENT_ID, clientSecret: env.LINKEDIN_CLIENT_SECRET } }
    : {}),
});

/** Better Auth instance of the identity module: e-mail + password, social sign-in, 2FA, roles. */
export const createAuth = (deps: AuthDeps) => {
  const db = deps.db.withPlugin(new TimestampParsingPlugin());
  return betterAuth({
    appName: 'Kompas',
    secret: deps.env.BETTER_AUTH_SECRET ?? DEVELOPMENT_SECRET,
    ...(deps.env.BETTER_AUTH_URL ? { baseURL: deps.env.BETTER_AUTH_URL } : {}),
    database: { db, type: 'postgres', schemaName: AUTH_SCHEMA, transaction: true },
    advanced: { database: { generateId: () => uuidv7() } },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
    },
    // Q2: verification is required before the first booking (F3), not before signing in.
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: ({ user, url }) =>
        deps.emailVerificationSender.sendVerificationLink({ to: user.email, url }),
    },
    socialProviders: socialProviders(deps.env),
    user: {
      additionalFields: {
        roles: { type: 'string[]', required: false, defaultValue: ['student'], input: false },
      },
    },
    // Q5: 30 days renewed on use. Better Auth renews every session by `expiresIn`, so the
    // 12 h admin limit is a policy applied when reading the session (`sessionExpiresAt`).
    session: { expiresIn: USER_SESSION_TTL.total('seconds') },
    plugins: [
      twoFactor({ issuer: 'Kompas' }),
      ...(deps.checkBreachedPasswords ? [haveIBeenPwned()] : []),
      ...deps.plugins,
    ],
  });
};

export type Auth = ReturnType<typeof createAuth>;
