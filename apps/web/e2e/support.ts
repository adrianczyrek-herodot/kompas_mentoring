import AxeBuilder from '@axe-core/playwright';
import { type APIRequestContext, test as base, expect, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';

const DEFAULT_DATABASE_URL = 'postgres://kompas:kompas@localhost:5432/kompas';

const octet = () => Math.floor(Math.random() * 254) + 1;

/**
 * Better Auth limits sign-in/sign-up attempts per client IP (3 per 10 s in production mode,
 * which `next start` is). Each test acts as its own client, so tests do not throttle each other.
 */
/* eslint-disable no-empty-pattern -- Playwright requires a destructured first argument */
export const test = base.extend({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature
  extraHTTPHeaders: async ({}, provide) => {
    await provide({ 'x-forwarded-for': `10.${octet()}.${octet()}.${octet()}` });
  },
});
/* eslint-enable no-empty-pattern */
export { expect };

export const PASSWORD = 'kompas-e2e-password';

/** Flows that create accounts need Postgres (CI sets E2E_EXPECT_DB=up). */
export const requireDatabase = () => {
  test.skip(process.env['E2E_EXPECT_DB'] !== 'up', 'needs the database (E2E_EXPECT_DB=up)');
};

export const uniqueEmail = () => `e2e-${crypto.randomUUID()}@example.com`;

/**
 * Creates an account through the Better Auth API. With `page.request` the session cookie lands in
 * the page's browser context; with the `request` fixture the page stays signed out.
 */
export const signUpViaApi = async (
  request: APIRequestContext,
  email = uniqueEmail(),
  name = 'Ola',
) => {
  const response = await request.post('/api/auth/sign-up/email', {
    data: { name, email, password: PASSWORD, terms: true, privacy: true },
  });
  expect(response.ok()).toBe(true);
  return email;
};

/** WCAG 2.2 AA (spec §7): no serious or critical axe violations. */
export const expectNoSeriousA11yViolations = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(
    serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);
};

/** Seeded admins (see `db:seed`); each Playwright project resets its own account, so runs don't race. */
export const SEEDED_ADMINS = {
  'mobile-360': { email: 'admin.trust@kompas.local', password: 'kompas-admin-dev' },
  'desktop-1280': { email: 'admin.finance@kompas.local', password: 'kompas-admin-dev' },
} as const;

/** Resets one seeded admin (role, verified e-mail, no 2FA) so the s07 flow starts clean. */
export const resetSeededAdmin = (email: string) => {
  execFileSync('pnpm', ['--filter', '@kompas/core', 'run', 'db:seed'], {
    stdio: 'ignore',
    env: {
      ...process.env,
      DATABASE_URL: process.env['DATABASE_URL'] ?? DEFAULT_DATABASE_URL,
      AUTH_BREACHED_PASSWORD_CHECK: 'off',
      SEED_ADMIN_EMAIL: email,
    },
  });
};

/** Signs an admin in through the API with `page.request`, so the cookie lands in the page context. */
export const signInAdminViaApi = async (
  request: APIRequestContext,
  admin: { email: string; password: string },
) => {
  const response = await request.post('/api/auth/sign-in/email', {
    data: { email: admin.email, password: admin.password, rememberMe: true },
  });
  expect(response.ok()).toBe(true);
};

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** RFC 4648 base32 (no padding), matching the secret Better Auth puts in the `otpauth://` URI. */
const base32Decode = (value: string): Buffer => {
  const bytes: number[] = [];
  let bits = 0;
  let buffer = 0;
  for (const character of value.replace(/=+$/, '').toUpperCase()) {
    const index = BASE32.indexOf(character);
    if (index < 0) continue;
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};

/** TOTP code (SHA-1, 6 digits, 30 s) from the base32 secret shown on s07. */
export const totpCode = (secret: string): string => {
  const counter = Math.floor(Date.now() / 1000 / 30);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', base32Decode(secret)).update(buffer).digest();
  const offset = (digest[digest.length - 1] ?? 0) & 0x0f;
  const binary =
    (((digest[offset] ?? 0) & 0x7f) << 24) |
    ((digest[offset + 1] ?? 0) << 16) |
    ((digest[offset + 2] ?? 0) << 8) |
    (digest[offset + 3] ?? 0);
  return (binary % 1_000_000).toString().padStart(6, '0');
};
