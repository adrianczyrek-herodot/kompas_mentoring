import type { Page } from '@playwright/test';
import {
  expect,
  expectNoSeriousA11yViolations,
  PASSWORD,
  requireDatabase,
  signUpViaApi,
  test,
} from './support.ts';

/** Signed-in student on S3 (the cookie from the API sign-up lives in the page context). */
const openAccount = async (page: Page) => {
  const email = await signUpViaApi(page.request);
  await page.goto('/konto');
  await expect(page.getByRole('heading', { level: 1, name: 'Konto i ustawienia' })).toBeVisible();
  return email;
};

test.beforeEach(() => {
  requireDatabase();
});

test('changes the name shown in the header', async ({ page }) => {
  await openAccount(page);
  await page.getByLabel('Imię').fill('Aleksandra');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByRole('status')).toHaveText('Zapisano.');
  await expect(page.getByRole('link', { name: 'Konto: Aleksandra' })).toBeVisible();
});

test('changes the password only with the current one', async ({ page }) => {
  await openAccount(page);
  await page.getByLabel('Obecne hasło').fill('not-my-password-1');
  await page.getByLabel('Nowe hasło').fill('kompas-new-password');
  await page.getByRole('button', { name: 'Zmień hasło' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'Obecne hasło jest nieprawidłowe.',
  );
  await page.getByLabel('Obecne hasło').fill(PASSWORD);
  await page.getByLabel('Nowe hasło').fill('kompas-new-password');
  await page.getByRole('button', { name: 'Zmień hasło' }).click();
  await expect(page.getByRole('status')).toHaveText('Zapisano.');
});

test('keeps the marketing decision', async ({ page }) => {
  await openAccount(page);
  const marketing = page.getByRole('checkbox', { name: 'Chcę dostawać wskazówki i oferty' });
  await expect(marketing).not.toBeChecked();
  await marketing.click();
  await expect(marketing).toBeChecked();
  // The decision is saved by a server action; wait until it settles before reloading.
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  await page.reload();
  await expect(marketing).toBeChecked();
});

test('records export and deletion requests', async ({ page }) => {
  await openAccount(page);
  await page.getByRole('button', { name: 'Pobierz moje dane' }).click();
  await expect(page.getByText('Przyjęliśmy prośbę o eksport danych')).toBeVisible();
  await page.getByRole('button', { name: 'Usuń konto' }).click();
  await page.getByRole('button', { name: 'Tak, usuń moje konto' }).click();
  await expect(page.getByText('Przyjęliśmy prośbę o usunięcie konta')).toBeVisible();
});

test('signs out on every device', async ({ page }) => {
  await openAccount(page);
  await page.getByRole('button', { name: 'Wyloguj ze wszystkich urządzeń' }).click();
  await expect(page).toHaveURL('/logowanie');
  await page.goto('/konto');
  await expect(page).toHaveURL(/\/logowanie\?returnTo=%2Fkonto$/);
});

test('S3 has no serious accessibility violations', async ({ page }) => {
  await openAccount(page);
  await expectNoSeriousA11yViolations(page);
});
