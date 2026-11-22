import { defineConfig, devices } from '@playwright/test';

/**
 * Navigation and accessibility tests for the clickable prototype. They run against the production
 * build (`vite preview`), served on its own port so they never touch a running dev server.
 *
 * Spec §7 wants every screen at a narrow and a wide viewport; the prototype brief names 320 and
 * 1440 px. Dark mode is exercised inside the tests (the review bar toggles `.dark`).
 */
const PORT = Number(process.env['PROTO_E2E_PORT'] ?? 4173);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: process.env['CI'] === 'true',
  retries: process.env['CI'] === 'true' ? 1 : 0,
  reporter: process.env['CI'] === 'true' ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'mobile-320',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 780 } },
    },
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `pnpm exec vite preview --host 127.0.0.1 --port ${String(PORT)} --strictPort`,
    url: baseURL,
    reuseExistingServer: process.env['E2E_REUSE_SERVER'] === '1',
    timeout: 120_000,
  },
});
