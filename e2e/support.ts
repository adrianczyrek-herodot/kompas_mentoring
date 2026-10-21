// Pomocnicze akcje testów: rola demo, nawigacja klienta, odczekanie stanu „loading”.
import { expect, type Page } from "@playwright/test";

type Role = "guest" | "student" | "mentor" | "admin";

declare global {
  interface Window {
    next: { router: { push(href: string): void } };
  }
}

/** Czeka, aż zniknie sztuczne „loading” (280 ms) i szkielety. */
export async function settle(page: Page): Promise<void> {
  // `main[data-path]` = ścieżka wyrenderowanej strony — czekamy, aż nowa trasa faktycznie się zamontuje.
  const pathname = new URL(page.url()).pathname;
  await page.waitForSelector(`main[data-path="${pathname}"]`);
  await page.waitForTimeout(350);
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
}

/** Pełne wejście na adres (stan demo zaczyna się od nowa — rola: gość). */
export async function open(page: Page, path = "/"): Promise<void> {
  await page.goto(path);
  await page.waitForSelector("[data-role]");
  await settle(page);
}

/**
 * Nawigacja klienta (router Next.js) — zachowuje stan demo w pamięci.
 * `page.goto()` przeładowałoby stronę i zresetowało rolę.
 */
export async function go(page: Page, path: string): Promise<void> {
  await page.evaluate((p) => window.next.router.push(p), path);
  // Porównanie po normalizacji przez URL (np. `?f=próbny` w adresie jest zakodowane procentowo).
  const want = new URL(path, "http://x");
  await page.waitForURL((u) => u.pathname + u.search + u.hash === want.pathname + want.search + want.hash);
  await settle(page);
}

/** Przełącza rolę w pasku mockupu (przenosi na domyślny ekran roli). */
export async function asRole(page: Page, role: Role): Promise<void> {
  const select = page.locator("[data-role]").first();
  if ((await select.inputValue()) === role) return;
  await select.selectOption(role);
  await page.waitForTimeout(300);
  await page.waitForSelector("[data-role]");
  await settle(page);
}

/** Bieżąca ścieżka z query i hashem. */
export const path = (page: Page): string => {
  const u = new URL(page.url());
  return u.pathname + u.search + u.hash;
};

/** Komunikaty `toast` widoczne na ekranie (strony: `role=status`, panel: sonner). */
export const toasts = (page: Page) => page.locator('[role="status"], [data-sonner-toast]');

/** Czeka na komunikat `toast` z tekstem (kolejność w DOM zależy od biblioteki — sonner wstawia najnowszy na górę). */
export async function expectToast(page: Page, text: string | RegExp): Promise<void> {
  await expect(toasts(page).filter({ hasText: text }).first()).toBeVisible();
}
