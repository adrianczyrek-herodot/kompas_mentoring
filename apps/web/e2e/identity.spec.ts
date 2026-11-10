import {
  expect,
  expectNoSeriousA11yViolations,
  requireDatabase,
  signUpViaApi,
  test,
} from './support.ts';

test('signed-in routes send guests to sign-in with returnTo', async ({ page }) => {
  await page.goto('/konto?tab=dane');
  await expect(page).toHaveURL(/\/logowanie\?returnTo=%2Fkonto%3Ftab%3Ddane$/);
});

test('header offers sign-in and sign-up to guests', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Główna nawigacja' });
  await expect(nav.getByRole('link', { name: 'Zaloguj się' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Załóż konto' })).toBeVisible();
  await expectNoSeriousA11yViolations(page);
});

test('header shows the account of a signed-in user and signs out', async ({ page }) => {
  requireDatabase();
  await signUpViaApi(page.request);

  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Główna nawigacja' });
  await expect(nav.getByRole('link', { name: 'Konto: Ola' })).toBeVisible();

  await nav.getByRole('button', { name: 'Wyloguj' }).click();
  await expect(nav.getByRole('link', { name: 'Zaloguj się' })).toBeVisible();
});
