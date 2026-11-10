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

const nav = (page: Page) => page.getByRole('navigation', { name: 'Główna nawigacja' });

test.describe('P4 — sign-up', () => {
  test('validates the form before sending', async ({ page }) => {
    await page.goto('/rejestracja');
    await page.getByRole('button', { name: 'Załóż konto' }).click();
    await expect(page.getByText('To pole jest wymagane.')).toHaveCount(3);
    await expect(page.getByText('Akceptacja regulaminu jest wymagana.')).toBeVisible();
    await expect(page.getByLabel('Imię')).toBeFocused();
    await page.getByLabel('Hasło').fill('krotkie');
    await page.getByRole('button', { name: 'Załóż konto' }).click();
    await expect(page.getByText('Hasło musi mieć od 10 do 128 znaków.')).toBeVisible();
  });

  test('creates an account and signs in', async ({ page }) => {
    requireDatabase();
    await page.goto('/rejestracja');
    await page.getByLabel('Imię').fill('Ola');
    await page.getByLabel('E-mail').fill(uniqueEmail());
    await page.getByLabel('Hasło').fill(PASSWORD);
    await page
      .getByRole('checkbox', { name: 'Akceptuję regulamin i politykę prywatności' })
      .click();
    await page.getByRole('button', { name: 'Załóż konto' }).click();
    await expect(page).toHaveURL('/');
    await expect(nav(page).getByRole('link', { name: 'Konto: Ola' })).toBeVisible();
  });

  test('tells that the account already exists', async ({ page, request }) => {
    requireDatabase();
    const email = await signUpViaApi(request);
    await page.goto('/rejestracja');
    await page.getByLabel('Imię').fill('Ola');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Hasło').fill(PASSWORD);
    await page
      .getByRole('checkbox', { name: 'Akceptuję regulamin i politykę prywatności' })
      .click();
    await page.getByRole('button', { name: 'Załóż konto' }).click();
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(/To konto już istnieje/);
  });

  test('preselects mentoring from ?jako=mentor and keeps it across tabs', async ({ page }) => {
    await page.goto('/logowanie?jako=mentor');
    await page.getByRole('link', { name: 'Rejestracja' }).click();
    await expect(page).toHaveURL('/rejestracja?jako=mentor');
    await expect(page.getByRole('radio', { name: 'mentorować' })).toBeChecked();
  });
});

test.describe('P4 — sign-in', () => {
  test('rejects wrong credentials without naming the field', async ({ page }) => {
    requireDatabase();
    await page.goto('/logowanie');
    await page.getByLabel('E-mail').fill(uniqueEmail());
    await page.getByLabel('Hasło').fill(PASSWORD);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(
      'Nieprawidłowy e-mail lub hasło.',
    );
  });

  test('limits failed attempts', async ({ page }) => {
    requireDatabase();
    await page.goto('/logowanie');
    await page.getByLabel('E-mail').fill(uniqueEmail());
    await page.getByLabel('Hasło').fill(PASSWORD);
    const alert = page.getByRole('main').getByRole('alert');
    // Better Auth: 3 sign-in attempts per 10 s per client.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.getByRole('button', { name: 'Zaloguj się' }).click();
      await expect(alert).toHaveText('Nieprawidłowy e-mail lub hasło.');
    }
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(alert).toHaveText('Za dużo nieudanych prób. Spróbuj ponownie za kilka minut.');
  });

  test('returns to the protected page after signing in', async ({ page, request }) => {
    requireDatabase();
    const email = await signUpViaApi(request);
    await page.goto('/konto');
    await expect(page).toHaveURL('/logowanie?returnTo=%2Fkonto');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Hasło').fill(PASSWORD);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page).toHaveURL('/konto');
  });

  test('ignores an external returnTo', async ({ page, request }) => {
    requireDatabase();
    const email = await signUpViaApi(request);
    await page.goto('/logowanie?returnTo=https://evil.example/');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Hasło').fill(PASSWORD);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page).toHaveURL('/');
  });
});

test('P4 pages have no serious accessibility violations', async ({ page }) => {
  await page.goto('/logowanie');
  await expectNoSeriousA11yViolations(page);
  await page.goto('/rejestracja');
  await page.getByRole('button', { name: 'Załóż konto' }).click();
  await expectNoSeriousA11yViolations(page);
});
