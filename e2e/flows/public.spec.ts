// P1–P4: wyszukiwanie, filtry, profil, logowanie/rejestracja, przełącznik roli i stany ekranu.
import { expect, test } from "@playwright/test";
import { asRole, go, open, path, toasts } from "../support";

test("P1: walidacja i wyszukiwanie", async ({ page }) => {
  await open(page, "/");
  await page.fill("input[name=q]", "R");
  await page.click("form[role=search] button[type=submit]");
  await expect(page.locator("main")).toContainText("Wpisz co najmniej 2 znaków (teraz: 1).");
  await page.fill("input[name=q]", "React");
  await page.click("form[role=search] button[type=submit]");
  await expect(page).toHaveURL(/\/mentorzy\?topic=React$/);
  await expect(page.locator("[data-count]")).toHaveText("1 mentor");
});

test("P2: filtry, sortowanie, czyszczenie, ulubieni, stany", async ({ page }) => {
  await open(page, "/mentorzy");
  await expect(page.locator("[data-count]")).toHaveText("6 mentorów");
  await page.selectOption("#f-sort", "cena-rosnaco");
  await expect(page).toHaveURL(/\?sort=cena-rosnaco$/);
  await expect(page.locator("article a.font-serif").first()).toContainText("Natalia Kurek");
  await page.check("input[name=verified]");
  await expect(page).toHaveURL(/verified=1/);
  await page.click('button:has-text("Zweryfikowani")');
  await expect(page).not.toHaveURL(/verified/);
  await page.click("[data-fav=m1]");
  await expect(toasts(page).last()).toContainText("ulubionych");
  await page.click('[aria-label="Stan ekranu"] button:has-text("empty")');
  await expect(page.locator("main")).toContainText("Brak mentorów dla tych filtrów");
  await page.click('[aria-label="Stan ekranu"] button:has-text("error")');
  await page.click('button:has-text("Spróbuj ponownie")');
  await expect(page).not.toHaveURL(/state=/);
});

test("P2: wyniki filtrów jak w mockupie", async ({ page }) => {
  const cases: [string, string[]][] = [
    ["topic=React", ["Kasia Nowicka"]],
    ["verified=1&sort=ocena", ["Ewa Sadowska", "Kasia Nowicka", "Natalia Kurek", "Tomasz Wierzbicki", "Marek Lis"]],
    ["time=rano", ["Kasia Nowicka", "Tomasz Wierzbicki", "Ewa Sadowska", "Natalia Kurek"]],
    ["priceMax=150", ["Natalia Kurek"]],
    ["topic=Backend&time=wieczor", ["Marek Lis"]],
  ];
  for (const [q, names] of cases) {
    await open(page, `/mentorzy?${q}`);
    await expect(page.locator("article a.font-serif")).toHaveText(names);
  }
});

test("P3: profil i nieistniejący profil", async ({ page }) => {
  await open(page, "/mentorzy/m1");
  await expect(page.locator("h1")).toContainText("Kasia Nowicka");
  await open(page, "/mentorzy/zz");
  await expect(page.locator("main")).toContainText("Ten profil jest niedostępny");
});

test("P4: logowanie — błąd, logowanie społecznościowe, stare adresy", async ({ page }) => {
  await open(page, "/logowanie");
  await page.fill("#f-email", "zajety@kompas.pl");
  await page.fill("#f-password", "x");
  await page.click("form button[type=submit]");
  await expect(page.locator("main")).toContainText("Nieprawidłowy e-mail lub hasło.");
  await page.click("[data-social]");
  await expect(page).toHaveURL(/\/sesje$/);
  await open(page, "/#/plany");
  await expect(page).toHaveURL(/\/plany$/);
});

test("P1: „Zostań mentorem” prowadzi do onboardingu", async ({ page }) => {
  await open(page, "/");
  await page.locator('a:has-text("Zostań mentorem")').last().click();
  await expect(page).toHaveURL(/\/app#\/mentor\/onboarding\/1$/);
});

test("rola zachowana przy przejściach React ↔ /app, „wstecz”", async ({ page }) => {
  await open(page, "/mentorzy");
  await asRole(page, "mentor");
  await expect(page).toHaveURL(/\/app#\/mentor$/);
  await expect(page.locator(".mockbar [data-role]")).toHaveValue("mentor");
  await page.click('.topnav a[href="#/wiadomosci"]');
  await expect(page).toHaveURL(/\/wiadomosci$/);
  await expect(page.locator("[data-role]")).toHaveValue("mentor");
  await page.goBack();
  await expect(page).toHaveURL(/\/app#\/mentor$/);
  await go(page, "/mapa");
  expect(path(page)).toBe("/mapa");
});
