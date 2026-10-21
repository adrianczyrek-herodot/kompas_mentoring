// Regresja wizualna: zrzut każdego ekranu (w roli, w której jest używany) porównywany z wzorcem
// w e2e/__screenshots__/. Zamierzona zmiana wyglądu → `npm run e2e:update` i przegląd różnic w commicie.
import { expect, test, type Page } from "@playwright/test";
import { asRole, go, open } from "./support";

type Role = "guest" | "student" | "mentor" | "admin";

const SCREENS: Record<Role, string[]> = {
  guest: [
    "/", "/mentorzy", "/mentorzy?topic=React&sort=ocena", "/mentorzy?state=empty", "/mentorzy?state=error", "/mentorzy/m1", "/mentorzy/zz",
    "/logowanie", "/rejestracja", "/rezerwacja/m1", "/sesje", "/mapa",
  ],
  student: [
    "/sesje", "/sesje?tab=minione", "/sesje?state=empty", "/sesje/s1", "/sesje/s2", "/sesje/s4", "/sesje/s1/pokoj", "/sesje/s1/pokoj?krok=pokoj",
    "/sesje/s5/ocena", "/rezerwacja/m1", "/plany", "/plany?m=m1", "/plany?state=error", "/postepy", "/postepy?state=empty",
    "/wiadomosci", "/wiadomosci/t1", "/powiadomienia", "/konto",
  ],
  mentor: ["/app#/mentor", "/app#/mentor/kalendarz", "/app#/mentor/uczniowie", "/app#/mentor/uczniowie/st1", "/app#/mentor/zarobki", "/app#/mentor/onboarding/1"],
  admin: ["/app#/admin/weryfikacja", "/app#/admin/spory"],
};

const fileName = (role: Role, path: string) => `${role}${path.replace(/[^a-z0-9]+/gi, "_").replace(/_$/, "")}.png`;

async function shoot(page: Page, role: Role, path: string) {
  await expect(page).toHaveScreenshot(fileName(role, path), {
    fullPage: true,
    // Liczniki czasu (pokój sesji, blokada terminu) zmieniają się co sekundę.
    mask: [page.locator("[data-timer]"), page.locator("[data-countdown]")],
  });
}

for (const [role, paths] of Object.entries(SCREENS) as [Role, string[]][]) {
  test.describe(`ekrany — ${role}`, () => {
    for (const p of paths) {
      test(p, async ({ page }) => {
        await open(page, "/");
        await asRole(page, role);
        await go(page, p);
        await shoot(page, role, p);
      });
    }
  });
}
