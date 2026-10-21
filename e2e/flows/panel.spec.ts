// Panel mentora i admina (M1–M5, A1–A2): onboarding → weryfikacja, prośby, kalendarz, notatki, wypłata, spory.
import { expect, test, type Page } from "@playwright/test";
import { asRole, expectToast, go, open } from "../support";

const main = (page: Page) => page.locator("main");
const submit = (page: Page) => page.locator("main form button[type=submit]");

test("M1 → A1: onboarding w 6 krokach, zgłoszenie w kolejce admina, zatwierdzenie", async ({ page }) => {
  await open(page, "/mentor/onboarding/1");
  await submit(page).click();
  await expect(main(page)).toContainText("Dodaj zdjęcie.");
  await expect(main(page)).toContainText("To pole jest wymagane.");
  await page.click("[data-photo]");
  await page.fill("#f-name", "Ola Testowa");
  await submit(page).click();
  await expect(page).toHaveURL(/\/mentor\/onboarding\/2$/);
  await expectToast(page, "Zapisano szkic");

  await submit(page).click();
  await expect(main(page)).toContainText("Wybierz od 1 do 5 kategorii.");
  await page.locator("label", { hasText: "Frontend" }).click();
  await page.fill("#f-tags", "React, TypeScript, Code review");
  await page.fill("#f-years", "7");
  await submit(page).click();
  await expect(page).toHaveURL(/\/onboarding\/3$/);

  await page.fill("#f-headline", "Frontend Engineer · React i dostępność");
  await page.fill("#f-bio", "Pomagam juniorom wejść na poziom mid. ".repeat(10));
  await page.click("[data-preview]");
  await expect(page.getByRole("dialog")).toContainText("Ola Testowa");
  await page.keyboard.press("Escape");
  await submit(page).click();
  await expect(main(page)).toContainText("Dodaj wideo albo link");
  await page.click("[data-video-btn]");
  await submit(page).click();
  await expect(page).toHaveURL(/\/onboarding\/4$/);

  await page.fill("#f-rate", "200");
  await expect(page.locator("[data-earn]")).toContainText("134 zł");
  await expect(page.locator("[data-earn]")).toContainText("164 zł");
  await submit(page).click();
  await expect(page).toHaveURL(/\/onboarding\/5$/);

  const sum = page.locator("[data-avail-sum]");
  await expect(sum).toHaveText("5 h tygodniowo");
  await page.click('[data-cell="1-9"]');
  await expect(sum).toHaveText("6 h tygodniowo");
  await submit(page).click();
  await expect(page).toHaveURL(/\/onboarding\/6$/);

  await submit(page).click();
  await expect(main(page)).toContainText("Zweryfikuj tożsamość, zanim wyślesz profil.");
  await expect(main(page)).toContainText("Akceptacja regulaminu jest wymagana.");
  await page.fill("#f-linkedin", "https://linkedin.com/in/ola");
  await page.fill("#f-iban", "PL61 1090 1014 0000 0712 1981 2874");
  await page.click("[data-kyc]");
  await page.locator("label", { hasText: "Akceptuję regulamin dla mentorów" }).click();
  await submit(page).click();
  await expect(page).toHaveURL(/\/onboarding\/wyslano$/);
  await expect(main(page)).toContainText("Profil wysłany do weryfikacji");

  await asRole(page, "admin");
  await expect(page).toHaveURL(/\/admin\/weryfikacja$/);
  await expect(main(page)).toContainText("Ola Testowa");
  await page.locator("label", { hasText: "Zatwierdź" }).click();
  await submit(page).click();
  await expect(main(page)).toContainText("Odhacz całą checklistę przed zatwierdzeniem.");
  for (const box of await page.locator("[data-chk]").all()) await box.click();
  await submit(page).click();
  await expectToast(page, "Ola Testowa: profil opublikowany");
  await expect(page.locator("main ul a").first()).not.toContainText("Ola Testowa");
});

test("A1: zmiany wymagają pól i komentarza; brak KYC blokuje zatwierdzenie", async ({ page }) => {
  await open(page, "/");
  await asRole(page, "admin");
  await go(page, "/admin/weryfikacja?id=a3");
  await page.locator("label", { hasText: "Zatwierdź" }).click();
  await submit(page).click();
  await expect(main(page)).toContainText("Nie można zatwierdzić bez pozytywnej weryfikacji KYC.");
  await page.locator("label", { hasText: "Poproś o zmiany" }).click();
  await submit(page).click();
  await expect(main(page)).toContainText("Wskaż co najmniej jedno pole.");
  await expect(main(page)).toContainText("Komentarz jest wymagany.");
  await page.locator("[data-fields] label", { hasText: "Dokument" }).click();
  await page.fill("#f-comment", "Dokument tożsamości jest nieczytelny.");
  await submit(page).click();
  await expectToast(page, "Wysłano prośbę o zmiany");
});

test("M2: akceptacja i odrzucenie prośby o sesję próbną", async ({ page }) => {
  await open(page, "/");
  await asRole(page, "mentor");
  await expect(page.locator("[data-req]")).toHaveCount(2);
  await page.click("[data-accept=r1]");
  await expectToast(page, "Sesja próbna potwierdzona");
  await expect(page.locator("[data-req]")).toHaveCount(1);
  await page.click("[data-decline=r2]");
  const dialog = page.getByRole("dialog");
  await dialog.locator("button[type=submit]").click();
  await expect(dialog).toContainText("Wybierz powód.");
  await dialog.locator("label", { hasText: "Inny" }).click();
  await page.fill("#f-other", "krótko");
  await dialog.locator("button[type=submit]").click();
  await expect(dialog).toContainText("Wpisz co najmniej 10 znaków");
  await page.fill("#f-other", "Ten tydzień mam w całości zajęty.");
  await dialog.locator("button[type=submit]").click();
  await expectToast(page, "Prośba odrzucona");
  await expect(main(page)).toContainText("Brak nowych próśb");
});

test("M3: siatka dostępności, ustawienia i wyjątek", async ({ page }) => {
  await open(page, "/");
  await asRole(page, "mentor");
  await go(page, "/mentor/kalendarz");
  const sum = page.locator("[data-avail-sum]");
  const before = await sum.textContent();
  await page.click('[data-cell="6-12"]');
  await expect(sum).not.toHaveText(before ?? "");
  await expect(page.locator("[data-dirty]")).toBeVisible();
  await page.click("[data-save]");
  await expect(page.locator("[data-dirty]")).toHaveCount(0);
  await page.fill("#f-notice", "1");
  await page.click('button:has-text("Zapisz ustawienia")');
  await expect(main(page)).toContainText("Podaj wartość od 2 do 48 h.");
  await page.click("[data-exception]");
  const dialog = page.getByRole("dialog");
  await page.fill("#f-from", "2026-11-10");
  await page.fill("#f-to", "2026-11-01");
  await dialog.locator("button[type=submit]").click();
  await expect(dialog).toContainText("Data końca nie może być wcześniejsza.");
  await page.fill("#f-to", "2026-11-12");
  await dialog.locator("button[type=submit]").click();
  await expectToast(page, "Wyjątek dodany");
});

test("M4–M5: notatka dla ucznia, wypłata", async ({ page }) => {
  await open(page, "/");
  await asRole(page, "mentor");
  await go(page, "/mentor/uczniowie/st1");
  await page.fill("#f-covered", "za krótko");
  await page.locator('input[name="item"]').first().fill("ab");
  await submit(page).click();
  await expect(main(page)).toContainText("Wpisz co najmniej 20 znaków");
  await expect(main(page)).toContainText("Zadanie: 3–200 znaków.");
  await page.fill("#f-covered", "Omówiliśmy podział formularza na logikę i prezentację.");
  await page.locator('input[name="item"]').first().fill("Dodaj testy walidacji");
  await submit(page).click();
  await expectToast(page, "Notatka wysłana z 1 zadaniem/ami");

  await go(page, "/mentor/zarobki");
  await expect(page.locator("[data-available]")).toHaveText("432 zł");
  await page.click("[data-payout]");
  await page.getByRole("dialog").locator("[data-ok]").click();
  await expectToast(page, "Wypłata zlecona");
  await expect(page.locator("[data-available]")).toHaveText("0 zł");
  await expect(page.locator("[data-payout]")).toBeDisabled();
  await expect(main(page)).toContainText("w drodze");
});

test("A2: rozstrzygnięcie sporu ze zwrotem częściowym", async ({ page }) => {
  await open(page, "/");
  await asRole(page, "admin");
  await go(page, "/admin/spory");
  await submit(page).click();
  await expect(main(page)).toContainText("Wybierz rozstrzygnięcie.");
  await page.locator("label", { hasText: "Zwrot częściowy" }).click();
  await page.fill("#f-amount", "999");
  await page.fill("#f-why", "za krótko");
  await submit(page).click();
  await expect(main(page)).toContainText("Kwota od 1 do 260 zł.");
  await page.fill("#f-amount", "130");
  await page.fill("#f-why", "Mentor dołączył z 14-minutowym opóźnieniem — zwracamy połowę.");
  await submit(page).click();
  await expectToast(page, "Spór rozstrzygnięty");
  await expect(page.locator("main ul li")).toHaveCount(1);
});

test("panel: strażnicy dostępu i stany", async ({ page }) => {
  await open(page, "/mentor");
  await expect(main(page)).toContainText("Zaloguj się, żeby kontynuować");
  await asRole(page, "student");
  await go(page, "/admin/spory");
  await expect(main(page)).toContainText("Ten ekran jest dla roli: Admin");
  await page.click("[data-switch]");
  await expect(main(page)).toContainText("Spory i zwroty");
  await go(page, "/admin/spory?state=empty");
  await expect(main(page)).toContainText("Brak otwartych sporów");
  await go(page, "/admin/spory?state=error");
  await expect(main(page)).toContainText("Nie udało się wczytać sporów.");
});
