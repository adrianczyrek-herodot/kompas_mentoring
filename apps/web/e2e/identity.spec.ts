import { expect, test } from '@playwright/test';

test('signed-in routes send guests to sign-in with returnTo', async ({ page }) => {
  await page.goto('/konto?tab=dane');
  await expect(page).toHaveURL(/\/logowanie\?returnTo=%2Fkonto%3Ftab%3Ddane$/);
});

test('header offers sign-in and sign-up to guests', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Główna nawigacja' });
  await expect(nav.getByRole('link', { name: 'Zaloguj się' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Załóż konto' })).toBeVisible();
});

test('header shows the account of a signed-in user and signs out', async ({ page }) => {
  test.skip(process.env['E2E_EXPECT_DB'] !== 'up', 'needs the database (E2E_EXPECT_DB=up)');
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  // Sign-up through the Better Auth API signs in and stores the cookie in the page context.
  const response = await page.request.post('/api/auth/sign-up/email', {
    data: { name: 'Ola', email, password: 'kompas-e2e-password' },
  });
  expect(response.ok()).toBe(true);

  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Główna nawigacja' });
  await expect(nav.getByRole('link', { name: 'Konto: Ola' })).toBeVisible();

  await nav.getByRole('button', { name: 'Wyloguj' }).click();
  await expect(nav.getByRole('link', { name: 'Zaloguj się' })).toBeVisible();
});
