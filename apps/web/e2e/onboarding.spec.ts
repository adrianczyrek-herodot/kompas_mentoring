import path from 'node:path';
import type { Page } from '@playwright/test';
import {
  expect,
  expectNoSeriousA11yViolations,
  requireDatabase,
  signUpViaApi,
  test,
} from './support.ts';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');

/** A signed-in mentor on the mentor home (the session cookie comes from the API sign-up). */
const openMentorHome = async (page: Page) => {
  await signUpViaApi(page.request, undefined, 'Ola', 'mentor');
  await page.goto('/mentor');
  await expect(page.getByRole('heading', { level: 1, name: 'Panel mentora' })).toBeVisible();
};

test.beforeEach(() => {
  requireDatabase();
});

test('a student has no access to the mentor area', async ({ page }) => {
  await signUpViaApi(page.request);
  await page.goto('/mentor');
  await expect(page.getByRole('heading', { name: 'Brak dostępu' })).toBeVisible();
});

test('the onboarding opens the first step that is not done yet', async ({ page }) => {
  await openMentorHome(page);
  await page.getByRole('link', { name: 'Wróć do onboardingu' }).click();
  await expect(page).toHaveURL(/\/mentor\/onboarding\/o-mnie$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Onboarding mentora' })).toBeVisible();
  await expect(page.getByLabel('Kraj')).toBeVisible();
});

test('a guest is sent to the sign-in page and comes back', async ({ page }) => {
  await page.goto('/mentor/onboarding/o-mnie');
  await expect(page).toHaveURL(/\/logowanie\?returnTo=/);
});

test('the step is not saved when a field is wrong (inline error, focus on the first error)', async ({
  page,
}) => {
  await openMentorHome(page);
  await page.goto('/mentor/onboarding/opis-i-wideo');
  await page.getByLabel('Nagłówek').fill('Za krótki');
  await page.getByRole('button', { name: 'Zapisz i dalej' }).click();
  await expect(page.getByTestId('step-problems')).toContainText('Nagłówek');
  await expect(page.getByLabel('Nagłówek')).toBeFocused();
});

test('the draft of every step survives a reload and the mentor returns to the first open step', async ({
  page,
}) => {
  await openMentorHome(page);

  // Step 1: country (the default), one language and a photo.
  await page.goto('/mentor/onboarding/o-mnie');
  await page.getByRole('combobox', { name: 'Języki sesji' }).click();
  await page.getByRole('option', { name: 'polski' }).click();
  await page.keyboard.press('Escape');
  await page.locator('input[type="file"]').setInputFiles(path.join(FIXTURES, 'photo-400.png'));
  await expect(page.getByTestId('photo-uploader-preview-image')).toBeVisible();
  // The upload and the confirmation of the dimensions must finish before the step is saved.
  await expect(page.getByText('Wysyłam zdjęcie…')).toBeHidden();
  await page.getByRole('button', { name: 'Zapisz i dalej' }).click();
  await expect(page).toHaveURL(/\/mentor\/onboarding\/kompetencje$/);

  // Step 2: one category and three tags.
  await page.getByRole('checkbox', { name: 'IT i programowanie' }).click();
  const tags = page.getByRole('textbox', { name: 'Tagi' });
  for (const tag of ['typescript', 'react', ' mentoring ']) {
    await tags.fill(tag);
    await tags.press('Enter');
  }
  await page.getByLabel('Lata doświadczenia').fill('9');
  await page.getByRole('button', { name: 'Zapisz i dalej' }).click();
  await expect(page).toHaveURL(/\/mentor\/onboarding\/opis-i-wideo$/);

  // Step 3: headline, description and a video link.
  await page
    .getByLabel('Nagłówek')
    .fill('Pomagam frontendowcom przejść z juniora na mida w sześć miesięcy');
  await page
    .getByLabel('Opis')
    .fill(
      'Pracuję z frontendem od dziewięciu lat i przez ostatnie cztery prowadzę mentoring indywidualny. Na sesjach rozkładamy problem na części, robimy plan i sprawdzamy go na kodzie. Zależy mi na tym, żeby wychodzący z rozmowy mentor miał jeden konkretny następny krok, a nie listę życzeń. Najczęściej pracujemy z TypeScriptem, Reactem i testami, ale ważniejsze od technologii jest pytanie, co właściwie chcesz zmienić w swojej pracy.',
    );
  await page.getByLabel('Link do wideo').fill('https://youtu.be/dQw4w9WgXcQ');
  await page.getByRole('button', { name: 'Zapisz i dalej' }).click();
  await expect(page).toHaveURL(/\/mentor\/onboarding\/stawka$/);

  // Step 4: the rate.
  await page.getByLabel('Stawka za 60 minut').fill('150');
  await page.getByRole('button', { name: 'Zapisz i dalej' }).click();
  await expect(page).toHaveURL(/\/mentor$/);

  // The data is in the database: after a reload the mentor comes back to the first open step.
  await page.reload();
  await expect(page.getByTestId('profile-status')).toHaveText('Szkic');
  await page.getByRole('link', { name: 'Wróć do onboardingu' }).click();
  await expect(page).toHaveURL(
    /\/mentor\/onboarding\/(o-mnie|kompetencje|opis-i-wideo|stawka|dostepnosc|weryfikacja)$/,
  );
});

test('a photo that is too small is refused', async ({ page }) => {
  await openMentorHome(page);
  await page.goto('/mentor/onboarding/o-mnie');
  await page.locator('input[type="file"]').setInputFiles(path.join(FIXTURES, 'photo-399.png'));
  await expect(page.locator('[data-slot="photo-uploader-error"]')).toContainText('400');
});

test('a file that is not a JPG or a PNG is refused', async ({ page }) => {
  await openMentorHome(page);
  await page.goto('/mentor/onboarding/o-mnie');
  await page.locator('input[type="file"]').setInputFiles(path.join(FIXTURES, 'photo.gif'));
  await expect(page.locator('[data-slot="photo-uploader-error"]')).toContainText('JPG');
});

test('M1 has no serious accessibility violations', async ({ page }) => {
  await openMentorHome(page);
  await page.goto('/mentor/onboarding/o-mnie');
  await expect(page.getByRole('heading', { level: 1, name: 'Onboarding mentora' })).toBeVisible();
  await expectNoSeriousA11yViolations(page);
});
