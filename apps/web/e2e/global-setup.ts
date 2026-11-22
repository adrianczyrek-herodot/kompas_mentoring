import { execFileSync } from 'node:child_process';

const DEFAULT_DATABASE_URL = 'postgres://kompas:kompas@localhost:5432/kompas';

/**
 * Seeds the admin accounts once per suite (CI has no separate seed step, spec [s07]). Runs only
 * when the suite expects a database, so a database-less run stays offline.
 */
export default function globalSetup(): void {
  if (process.env['E2E_EXPECT_DB'] !== 'up') return;
  execFileSync('pnpm', ['--filter', '@kompas/core', 'run', 'db:seed'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env['DATABASE_URL'] ?? DEFAULT_DATABASE_URL,
      AUTH_BREACHED_PASSWORD_CHECK: 'off',
    },
  });
}
