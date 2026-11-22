import { SCREENS } from '../src/screens/registry';
import { ACCOUNTS, expect, goHash, setTheme, switchAccount, test, trackErrors } from './support';

test('każdy ekran z mapy renderuje się bez błędu na każdym koncie', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/');
  for (const account of ACCOUNTS) {
    await goHash(page, '/');
    await switchAccount(page, account.name);
    for (const screen of SCREENS) {
      await goHash(page, screen.sample);
      const section = page.locator(`section#${screen.id}`);
      await expect(section).toBeVisible();
      await expect(section.locator('.frame')).not.toBeEmpty();
    }
  }
  expect(errors).toEqual([]);
});

test('bramka „zaloguj się” pamięta, dokąd wrócić', async ({ page }) => {
  await page.goto('/#/sesje');
  await expect(
    page.getByRole('heading', { name: 'Zaloguj się, żeby zobaczyć tę stronę' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Zaloguj się' }).click();
  await expect(page.getByRole('heading', { name: 'Zaloguj się' }).first()).toBeVisible();
  expect(page.url()).toContain(encodeURIComponent('/sesje'));
});

test('bramka roli: uczeń nie wchodzi na ekran admina', async ({ page }) => {
  await page.goto('/');
  await switchAccount(page, /Adrian C\./);
  await goHash(page, '/admin/weryfikacja');
  await expect(page.getByRole('heading', { name: 'Ta strona wymaga innej roli' })).toBeVisible();
});

test('bramka weryfikacji: mentor bez zatwierdzenia nie wchodzi do panelu', async ({ page }) => {
  await page.goto('/');
  await switchAccount(page, /Adam Górski/);
  await goHash(page, '/mentor');
  await expect(page.getByRole('heading', { name: 'Twój profil czeka na weryfikację' })).toBeVisible();
});

test('F1: gość wybiera termin, a loguje się dopiero przy płatności', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/#/rezerwacja/m1');
  const slot = page.locator('section#U1 [data-slot="slot-grid"] button[aria-pressed]').first();
  await slot.click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await expect(page.getByRole('heading', { name: 'Zaloguj się' }).first()).toBeVisible();
  expect(page.url()).toContain('logowanie');
  expect(errors).toEqual([]);
});

test('F1 (uczeń): P1 → P2 → P3 → U1 → U2 → U3 bez błędów', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/#/');
  await switchAccount(page, /Adrian C\./);
  await goHash(page, '/mentorzy');
  await goHash(page, '/mentorzy/m1');
  await goHash(page, '/rezerwacja/m1');
  await page.locator('section#U1 [data-slot="slot-grid"] button[aria-pressed]').first().click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await expect(page.locator('section#U2')).toBeVisible();
  await page.getByRole('button', { name: /Zarezerwuj z salda|Zapłać/ }).first().click();
  await expect(page.locator('section#U3')).toBeVisible();
  expect(errors).toEqual([]);
});

test('kontrolki scenariuszy: każda odpowiada', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /^Scenariusze/ });
  await trigger.click();
  const menu = page.locator('[data-slot="popover-content"]');

  for (const label of ['Ładowanie', 'Pusto', 'Błąd', 'Dane']) {
    await menu.getByRole('button', { name: label, exact: true }).click();
  }
  for (const label of [
    'Odrzucona przez bank',
    '3-D Secure przerwane',
    'Potwierdzenie opóźnione (webhook)',
    'Sukces',
  ]) {
    await menu.getByRole('radio', { name: label }).click();
  }
  for (const label of ['Brak sieci', 'Błąd serwera', 'Brak']) {
    await menu.getByRole('radio', { name: label, exact: true }).click();
  }
  await menu.getByRole('switch', { name: 'Następna blokada terminu: konflikt 409' }).click();
  await menu.getByRole('switch', { name: 'Następne żądanie: sesja logowania wygasła' }).click();
  await menu.getByRole('switch', { name: 'Mentor nie dołącza do pokoju (U6)' }).click();
  await menu.getByRole('radio', { name: /15:10/ }).click();
  await menu.getByRole('button', { name: 'Przywróć domyślne scenariusze' }).click();

  await expect(trigger).toHaveText(/^Scenariusze$/);
  expect(errors).toEqual([]);
});

test('silnik przeglądu: tryby i przycisk „Back”', async ({ page }) => {
  await page.goto('/#/mentorzy');
  await goHash(page, '/sesje');

  const panel = page.locator('.anno-panel');

  // Threads toggles the comments panel; comment mode opens it on its own, so check it first.
  await page.getByRole('button', { name: 'Threads' }).click();
  await expect(panel).toHaveClass(/open/);
  // On a 320 px viewport the open panel covers the toolbar, so close it with Escape.
  await page.keyboard.press('Escape');
  await expect(panel).not.toHaveClass(/open/);

  await page.getByRole('button', { name: 'Comment' }).click();
  await expect(page.locator('body')).toHaveClass(/proto-comment/);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Clickable' }).click();
  await expect(page.locator('body')).not.toHaveClass(/proto-comment/);

  await page.getByRole('button', { name: 'Hide pins' }).click();
  await expect(page.locator('body')).toHaveClass(/anno-hidden/);
  await page.getByRole('button', { name: 'Show pins' }).click();

  await page.getByRole('button', { name: 'Show hotspots' }).click();
  await expect(page.locator('body')).toHaveClass(/proto-hints/);
  await page.getByRole('button', { name: 'Hide hotspots' }).click();

  await page.getByRole('button', { name: 'Presentation' }).click();
  await expect(page.locator('body')).toHaveClass(/proto-focus/);
  await page.getByRole('button', { name: '← Back' }).click();
  await page.waitForFunction(() => window.location.hash === '#/mentorzy');
  await page.getByRole('button', { name: 'Presentation' }).click();
  await expect(page.locator('body')).not.toHaveClass(/proto-focus/);
});

test('klawiatura: pierwszy Tab trafia w pasek, slot i menu scenariuszy działają z klawiatury', async ({
  page,
}) => {
  await page.goto('/#/rezerwacja/m1');

  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() => document.activeElement?.closest('.doc-toolbar') !== null),
  ).toBe(true);

  const slot = page.locator('section#U1 [data-slot="slot-grid"] button[aria-pressed]').first();
  await slot.focus();
  await page.keyboard.press('Enter');
  await expect(slot).toHaveAttribute('aria-pressed', 'true');

  const trigger = page.getByRole('button', { name: /^Scenariusze/ });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const menu = page.locator('[data-slot="popover-content"]');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('320 i 1440 px: strona nie przewija się w poziomie', async ({ page }) => {
  await page.goto('/');
  for (const screen of SCREENS) {
    for (const theme of ['light', 'dark'] as const) {
      await setTheme(page, theme);
      await goHash(page, screen.sample);
      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(overflow.scroll, `${screen.id} (${theme})`).toBeLessThanOrEqual(overflow.client + 1);
    }
  }
});
