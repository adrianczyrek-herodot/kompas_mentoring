import { defineConfig, devices } from '@playwright/test';

// E2E_PORT overrides the port when 3100 is taken (e.g. by another worktree's dev server).
const PORT = Number(process.env['E2E_PORT'] ?? 3100);

export default defineConfig({
  testDir: './e2e',
  forbidOnly: process.env['CI'] === 'true',
  retries: process.env['CI'] === 'true' ? 1 : 0,
  reporter: process.env['CI'] === 'true' ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: 'retain-on-failure' },
  // Spec §7: every screen at 360 px and 1280 px.
  projects: [
    {
      name: 'mobile-360',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 780 } },
    },
    {
      name: 'desktop-1280',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `pnpm exec next start --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    // Reuse only on request: silently reusing whatever listens on PORT tests a foreign app.
    reuseExistingServer: process.env['E2E_REUSE_SERVER'] === '1',
    timeout: 120_000,
    // Defaults to the docker-compose database (.env.example), so the app boots without a local .env.
    env: {
      DATABASE_URL: process.env['DATABASE_URL'] ?? 'postgres://kompas:kompas@localhost:5432/kompas',
    },
  },
});
