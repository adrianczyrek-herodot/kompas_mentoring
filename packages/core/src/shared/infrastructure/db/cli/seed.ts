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

/** E2E booking fixtures (E3-S4): one bookable mentor with availability and one verified student. */
const E2E_MENTOR_EMAIL = 'mentor.e2e@kompas.local';
const E2E_STUDENT_EMAIL = 'student.e2e@kompas.local';
// One mentor per Playwright project, so the 360 px and 1280 px runs never race for the same slot.
const E2E_MENTOR_PROFILES = [
  '018f0000-0000-7000-8000-0000000000a1',
  '018f0000-0000-7000-8000-0000000000a2',
] as const;

const ensureUser = async (email: string, name: string, role: string): Promise<string> => {
  const existing = await db.execute<{ id: string }[]>(
    'select "id" from "identity"."user" where "email" = ?',
    [email],
  );
  if (existing.length === 0) {
    // A variable keeps `terms`/`privacy` out of the excess-property check (hooks validate them).
    const body = { name, email, password: adminSeedPassword, terms: true, privacy: true };
    await auth.api.signUpEmail({ body });
    logger.info(`seed: created ${role} ${email}`);
  }
  await db.execute(
    `update "identity"."user"
        set "roles" = ?::jsonb, "emailVerified" = true, "time_zone" = 'Europe/Warsaw'
      where "email" = ?`,
    [JSON.stringify([role]), email],
  );
  const rows = await db.execute<{ id: string }[]>(
    'select "id" from "identity"."user" where "email" = ?',
    [email],
  );
  return rows[0]?.id ?? '';
};

/**
 * E2E needs a mentor the projection knows as bookable and whose weekly template has slots — trust
 * approval (E2-S4) does not exist yet, so the fixture writes the mirror directly. Test-only data.
 */
const seedBookingFixtures = async (): Promise<void> => {
  if (process.env['SEED_ADMIN_EMAIL'] !== undefined) return;
  await ensureUser(E2E_STUDENT_EMAIL, 'Student E2E', 'student');
  for (const [index, profileId] of E2E_MENTOR_PROFILES.entries()) {
    const email = index === 0 ? E2E_MENTOR_EMAIL : `mentor${index + 1}.e2e@kompas.local`;
    const mentorId = await ensureUser(email, `Mentor E2E ${index + 1}`, 'mentor');
    await db.execute(
      `insert into "scheduling"."mentor_bookability"
          ("mentor_profile_id", "mentor_id", "is_bookable", "accepting_new", "rate_60_amount", "currency", "updated_at")
        values (?, ?, true, true, 12000, 'PLN', now())
        on conflict ("mentor_profile_id") do update set
          "mentor_id" = excluded."mentor_id",
          "is_bookable" = true,
          "accepting_new" = true,
          "rate_60_amount" = excluded."rate_60_amount",
          "currency" = excluded."currency",
          "updated_at" = now()`,
      [profileId, mentorId],
    );
    await db.execute(
      `insert into "scheduling"."mentor_schedule"
          ("mentor_id", "time_zone", "min_notice_minutes", "buffer_minutes", "version", "created_at", "updated_at")
        values (?, 'Europe/Warsaw', 120, 0, 1, now(), now())
        on conflict ("mentor_id") do update set "time_zone" = excluded."time_zone", "min_notice_minutes" = 120`,
      [mentorId],
    );
    await db.execute('delete from "scheduling"."availability_rule" where "mentor_id" = ?', [
      mentorId,
    ]);
    for (const weekday of [1, 2, 3, 4, 5, 6, 7]) {
      await db.execute(
        `insert into "scheduling"."availability_rule" ("id", "mentor_id", "weekday", "start_local", "end_local")
          values (?, ?, ?, '09:00', '17:00')`,
        [crypto.randomUUID(), mentorId, weekday],
      );
    }
  }
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
  await seedBookingFixtures();
  logger.info('seed: done');
} finally {
  await orm.close();
}
