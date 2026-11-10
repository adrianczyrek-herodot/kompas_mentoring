import AxeBuilder from '@axe-core/playwright';
import { type APIRequestContext, test as base, expect, type Page } from '@playwright/test';

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

const PASSWORD = 'kompas-e2e-password';

/** Flows that create accounts need Postgres (CI sets E2E_EXPECT_DB=up). */
export const requireDatabase = () => {
  test.skip(process.env['E2E_EXPECT_DB'] !== 'up', 'needs the database (E2E_EXPECT_DB=up)');
};

const uniqueEmail = () => `e2e-${crypto.randomUUID()}@example.com`;

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
