import { execFileSync } from 'node:child_process';

const DEFAULT_DATABASE_URL = 'postgres://kompas:kompas@localhost:5432/kompas';

/**
 * Prepares the database once per suite (CI has no separate seed step, spec [s07]): the pg-boss
 * schema — the e2e suite starts only the web app, while in production the worker installs it on its
 * own start (spec §1.4) — and the admin accounts. Runs only when the suite expects a database, so a
 * database-less run stays offline.
 */
export default function globalSetup(): void {
  if (process.env['E2E_EXPECT_DB'] !== 'up') return;
  const env = {
    ...process.env,
    DATABASE_URL: process.env['DATABASE_URL'] ?? DEFAULT_DATABASE_URL,
    AUTH_BREACHED_PASSWORD_CHECK: 'off',
  };
  execFileSync('pnpm', ['--filter', '@kompas/core', 'run', 'db:jobs:install'], {
    stdio: 'inherit',
    env,
  });
  execFileSync('pnpm', ['--filter', '@kompas/core', 'run', 'db:seed'], { stdio: 'inherit', env });
}
