import {
  emailVerificationToken,
  expect,
  expectNoSeriousA11yViolations,
  requireDatabase,
  signUpUserViaApi,
  test,
} from './support.ts';

test.beforeEach(() => {
  requireDatabase();
});

test('s10 — a valid link verifies the e-mail and shows the success page', async ({ page }) => {
  const { email, id } = await signUpUserViaApi(page.request);
  const token = emailVerificationToken(email, id);

  const response = await page.goto(
    `/api/auth/verify-email?token=${token}&callbackURL=%2Fweryfikacja-email`,
  );
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/weryfikacja-email$/);
  await expect(page.getByRole('heading', { level: 1, name: 'E-mail zweryfikowany' })).toBeVisible();
  await expectNoSeriousA11yViolations(page);
});

test('s10 — an expired link offers a new one', async ({ page }) => {
  const { email, id } = await signUpUserViaApi(page.request);
  const token = emailVerificationToken(email, id, -60);

  await page.goto(`/api/auth/verify-email?token=${token}&callbackURL=%2Fweryfikacja-email`);
  await expect(page).toHaveURL(/\/weryfikacja-email\?error=/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Link wygasł lub jest nieprawidłowy' }),
  ).toBeVisible();

  await page.getByLabel('E-mail').fill(email);
  await page.getByRole('button', { name: 'Wyślij nowy link' }).click();
  await expect(page.getByText('Wysłaliśmy nowy link weryfikacyjny.')).toBeVisible();
  await expectNoSeriousA11yViolations(page);
});
