// `pnpm db:seed` — seed data for local and preview environments (spec §3).
// Admin accounts come from the seed/CLI only (F1 Q4); the seed stays offline (no HIBP calls).
import { createAppContainer } from '../../../../container.ts';
import { parseEnv } from '../../env.ts';
import { createLogger } from '../../logger.ts';
import { checkDatabase } from '../orm.ts';

/** Fallback password for local dev and tests only — never used when `NODE_ENV=production`. */
const DEV_ADMIN_SEED_PASSWORD = 'kompas-admin-dev';

const ADMINS = [
  { email: 'admin.trust@kompas.local', name: 'Admin Trust (seed)', role: 'admin_trust' },
  { email: 'admin.finance@kompas.local', name: 'Admin Finance (seed)', role: 'admin_finance' },
] as const;

// Force HIBP off for the script sign-up without mutating the process environment globally.
const env = parseEnv({ ...process.env, AUTH_BREACHED_PASSWORD_CHECK: 'off' });
const logger = createLogger({ level: env.LOG_LEVEL, module: 'db' });

/**
 * Seeding admin accounts is a local/test convenience. In production (incl. shared preview) the
 * password must be supplied explicitly (`ADMIN_SEED_PASSWORD`), so the repo-known dev default can
 * never create an admin account on a shared database (F1 Q4: admins come from the seed/CLI only).
 */
const adminSeedPassword =
  process.env['ADMIN_SEED_PASSWORD'] ??
  (env.NODE_ENV === 'production' ? undefined : DEV_ADMIN_SEED_PASSWORD);
if (adminSeedPassword === undefined) {
  throw new Error(
    'ADMIN_SEED_PASSWORD is required outside development/test — refusing to seed admin accounts.',
  );
}

const container = createAppContainer({ env, logger });
const { auth, orm } = container.cradle;
const db = orm.em.getConnection();

/** Enrols the account through Better Auth (hashed password) and resets it to a usable admin state. */
const upsertAdmin = async (admin: (typeof ADMINS)[number]): Promise<void> => {
  const existing = await db.execute<{ id: string }[]>(
    'select "id" from "identity"."user" where "email" = ?',
    [admin.email],
  );
  if (existing.length === 0) {
    // A script sign-up: Better Auth hashes the password and creates the credential account.
    const body = {
      name: admin.name,
      email: admin.email,
      password: adminSeedPassword,
      terms: true,
      privacy: true,
    };
    await auth.api.signUpEmail({ body });
    logger.info(`seed: created admin ${admin.email} (${admin.role})`);
  }
  // Role, verified e-mail and a clean 2FA state (the admin sets 2FA up on s07).
  await db.execute(
    `update "identity"."user"
        set "roles" = ?::jsonb, "emailVerified" = true, "twoFactorEnabled" = false
      where "email" = ?`,
    [JSON.stringify([admin.role]), admin.email],
  );
  await db.execute(
    `delete from "identity"."twoFactor"
      where "userId" = (select "id" from "identity"."user" where "email" = ?)`,
    [admin.email],
  );
};

try {
  const status = await checkDatabase(orm);
  if (status === 'down') {
    throw new Error(
      'Database is not reachable — run `docker compose up -d` and `pnpm db:migrate`.',
    );
  }
  for (const admin of ADMINS) {
    // `SEED_ADMIN_EMAIL` narrows a run to one account (E2E resets per project).
    if (process.env['SEED_ADMIN_EMAIL'] === undefined || process.env['SEED_ADMIN_EMAIL'] === admin.email) {
      await upsertAdmin(admin);
    }
  }
  logger.info('seed: done');
} finally {
  await orm.close();
}
