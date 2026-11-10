import { expect, test } from '@playwright/test';

test('home page renders Polish texts from messages/pl.json', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Kompas/);
  await expect(page.getByRole('heading', { level: 1, name: 'Kompas' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
});

test('/api/health reports the application status', async ({ request }) => {
  const response = await request.get('/api/health');
  const body = (await response.json()) as { app: string; db: string; status: string };
  expect(body.app).toBe('ok');
  // CI runs with Postgres and sets E2E_EXPECT_DB=up; locally the database may be absent.
  if (process.env['E2E_EXPECT_DB'] === 'up') {
    expect(response.status()).toBe(200);
    expect(body).toMatchObject({ status: 'ok', db: 'up' });
  } else {
    expect(['up', 'down']).toContain(body.db);
  }
});
