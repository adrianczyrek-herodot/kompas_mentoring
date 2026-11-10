import type { Page } from '@playwright/test';
import {
  expect,
  expectNoSeriousA11yViolations,
  PASSWORD,
  requireDatabase,
  signUpViaApi,
  test,
  uniqueEmail,
} from './support.ts';
import { createAdminViaCli, totp } from './totp.ts';

const signIn = async (page: Page, email: string) => {
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Hasło').fill(PASSWORD);
  await page.getByRole('button', { name: 'Zaloguj się' }).click();
};

test.beforeEach(() => {
  requireDatabase();
});

test('an admin sets up 2FA first and then signs in with a code', async ({ page }) => {
  const email = uniqueEmail();
  createAdminViaCli(email, PASSWORD);

  await page.goto('/admin');
  await signIn(page, email);
  await expect(page).toHaveURL('/admin/2fa');
  await page.getByLabel('Hasło').fill(PASSWORD);
  await page.getByRole('button', { name: 'Dalej' }).click();
  const secret = (await page.getByTestId('totp-secret').textContent()) ?? '';
  await page.getByLabel('Kod z aplikacji').fill(totp(secret));
  await page.getByRole('button', { name: 'Włącz weryfikację' }).click();
  await expect(page.getByRole('status')).toHaveText('Weryfikacja dwuetapowa jest włączona.');
  await page.getByRole('link', { name: 'Przejdź do panelu administracyjnego' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Panel administracyjny' }),
  ).toBeVisible();
  await expectNoSeriousA11yViolations(page);

  await page.getByRole('button', { name: 'Wyloguj' }).click();
  await expect(page.getByRole('link', { name: 'Zaloguj się' })).toBeVisible();
  await page.goto('/admin');
  await signIn(page, email);
  await expect(page).toHaveURL('/logowanie/2fa?returnTo=%2Fadmin');
  await page.getByLabel('Kod z aplikacji').fill('000000');
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(/Nieprawidłowy kod/);
  await page.getByLabel('Kod z aplikacji').fill(totp(secret));
  await page.getByRole('button', { name: 'Potwierdź' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Panel administracyjny' }),
  ).toBeVisible();
});

test('other roles get 403 on admin routes', async ({ page }) => {
  await signUpViaApi(page.request);
  const response = await page.goto('/admin');
  expect(response?.status()).toBe(403);
  await expect(page.getByRole('heading', { level: 1, name: 'Brak dostępu' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Administracja' })).toHaveCount(0);
});
