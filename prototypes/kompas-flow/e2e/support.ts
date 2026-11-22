import { expect, test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

export { expect };

/**
 * Every test collects page errors and console errors; a screen that throws is a failure even when
 * the assertion beneath it passes.
 */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

/** Move inside the prototype without a full reload, so the in-memory demo state is preserved. */
export async function goHash(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.location.hash = `#${target}`;
  }, path);
  await page.waitForFunction((target) => window.location.hash === `#${target}`, path);
}

/** Switch the demo account through the review bar (the only way — state is not persisted). */
export async function switchAccount(page: Page, name: RegExp): Promise<void> {
  await page.getByRole('combobox', { name: 'Konto demo' }).click();
  await page.getByRole('option', { name }).click();
  await expect(page.getByRole('combobox', { name: 'Konto demo' })).toContainText(name);
}

/**
 * Toggle the demo theme the way the review bar does (`.dark` on `<html>`). Waits for the webfonts
 * and the colour transition to settle — axe measures text contrast, which depends on the loaded
 * font and on the final token colour, so analysing mid-transition gives false positives.
 */
export async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.evaluate(async (mode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }, theme);
}

export const test = base;

export const ACCOUNTS = [
  { id: 'guest', name: /Gość/ },
  { id: 'adrian', name: /Adrian C\./ },
  { id: 'julia', name: /Julia M\./ },
  { id: 'pawel', name: /Paweł R\./ },
  { id: 'kasia', name: /Kasia Nowicka/ },
  { id: 'adam', name: /Adam Górski/ },
  { id: 'admin', name: /Zespół zaufania/ },
] as const;
