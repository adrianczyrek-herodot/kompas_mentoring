import {
  expect,
  expectNoSeriousA11yViolations,
  requireDatabase,
  signUpViaApi,
  test,
} from './support.ts';

test.beforeEach(() => {
  requireDatabase();
});

test('s08 — a student cannot open /mentor (403 with a link to own home)', async ({ page }) => {
  await signUpViaApi(page.request, undefined, 'Ola', 'student');
  const response = await page.goto('/mentor');
  expect(response?.status()).toBe(403);
  await expect(page.getByRole('heading', { level: 1, name: 'Brak dostępu' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Przejdź do konta' })).toBeVisible();
  await expectNoSeriousA11yViolations(page);
});

test('s08 — a mentor cannot open /admin (403)', async ({ page }) => {
  await signUpViaApi(page.request, undefined, 'Mentor', 'mentor');
  const response = await page.goto('/admin');
  expect(response?.status()).toBe(403);
  await expect(page.getByRole('heading', { level: 1, name: 'Brak dostępu' })).toBeVisible();
});

test('s09 — an unknown route is 404 without disclosing anything', async ({ page }) => {
  const response = await page.goto('/nie-istnieje-taki-adres');
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
  ).toBeVisible();
  await expectNoSeriousA11yViolations(page);
});
