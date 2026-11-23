import type { Page } from '@playwright/test';
import {
  expect,
  expectNoSeriousA11yViolations,
  requireDatabase,
  signUpViaApi,
  test,
} from './support.ts';

/** A signed-in mentor on M3 (the session cookie comes from the API sign-up). */
const openMentorCalendar = async (page: Page) => {
  await signUpViaApi(page.request, undefined, 'Marta', 'mentor');
  await page.goto('/mentor/kalendarz');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Kalendarz i dostępność' }),
  ).toBeVisible();
};

test.beforeEach(() => {
  requireDatabase();
});

test('a fresh calendar warns that students cannot book yet', async ({ page }) => {
  await openMentorCalendar(page);
  await expect(page.getByTestId('empty-availability')).toContainText(
    'Uczniowie nie mogą cię zarezerwować',
  );
});

test('the mentor paints Tuesday 18:00–20:00 with the keyboard only and saves it', async ({
  page,
}) => {
  await openMentorCalendar(page);

  // Keyboard-only: focus the start cell and extend the range with Shift+Arrow (WCAG 2.1.1).
  const tuesday1800 = page.getByRole('gridcell', { name: 'Wtorek 18:00' });
  await tuesday1800.focus();
  for (let step = 0; step < 3; step += 1) {
    await page.keyboard.press('Shift+ArrowRight');
  }
  await expect(page.getByText('Suma tygodniowa:')).toContainText('2 h');
  await expect(page.getByRole('gridcell', { name: 'Wtorek 18:00' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('gridcell', { name: 'Wtorek 19:30' })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  await page.getByTestId('template-save').click();
  await expect(page.getByText('Zapisano')).toBeVisible();

  // The template survives a reload and the empty-availability banner is gone.
  await page.reload();
  await expect(page.getByRole('gridcell', { name: 'Wtorek 18:00' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByTestId('empty-availability')).toBeHidden();
});

test('M3 has no serious accessibility violations', async ({ page }) => {
  await openMentorCalendar(page);
  await expectNoSeriousA11yViolations(page);
});
