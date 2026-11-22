import {
  expect,
  expectNoSeriousA11yViolations,
  requireDatabase,
  resetSeededAdmin,
  SEEDED_ADMINS,
  signInAdminViaApi,
  signUpViaApi,
  test,
  totpCode,
} from './support.ts';

/** One seeded admin per Playwright project, so parallel projects never touch the same account. */
const adminFor = (projectName: string) =>
  projectName === 'mobile-360' ? SEEDED_ADMINS['mobile-360'] : SEEDED_ADMINS['desktop-1280'];

test.beforeEach(() => {
  requireDatabase();
});

test('s07 — an admin without 2FA sets up TOTP and then reaches /admin', async ({
  page,
}, testInfo) => {
  const admin = adminFor(testInfo.project.name);
  resetSeededAdmin(admin.email);
  await signInAdminViaApi(page.request, admin);

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/konto\/2fa\?reason=2fa/);
  await expect(page.getByText('Skonfiguruj 2FA, aby kontynuować.')).toBeVisible();

  await page.getByLabel('Obecne hasło').fill(admin.password);
  await page.getByRole('button', { name: 'Włącz 2FA' }).click();
  const secret = await page.getByTestId('totp-secret').innerText();
  await page.getByLabel('Kod z aplikacji').fill(totpCode(secret));
  await page.getByRole('button', { name: 'Zweryfikuj i włącz' }).click();

  await expect(page.getByText('2FA jest aktywne.')).toBeVisible();
  await expectNoSeriousA11yViolations(page);

  await page.goto('/admin');
  await expect(page.getByRole('heading', { level: 1, name: 'Panel administratora' })).toBeVisible();
});

test('a signed-in student does not reach /admin (403)', async ({ page }) => {
  await signUpViaApi(page.request);
  const response = await page.goto('/admin');
  expect(response?.status()).toBe(403);
  await expect(page.getByRole('heading', { level: 1, name: 'Brak dostępu' })).toBeVisible();
});

test('s01 — the 12 h admin session expiry has its own message', async ({ page }) => {
  await page.goto('/logowanie?reason=admin-session-expired');
  await expect(
    page.getByText('Sesja administratora wygasła (12 h) — zaloguj się ponownie.'),
  ).toBeVisible();
});
