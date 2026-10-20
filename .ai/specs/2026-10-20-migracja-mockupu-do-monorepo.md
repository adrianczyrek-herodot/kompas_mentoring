---
title: Migracja aplikacji Kompas (mockup) do monorepo DevMentor
status: in-progress
created: 2026-10-20
implemented:
related: [.ai/specs/implemented/2026-10-20-monorepo-devmentor.md, .ai/runs/2026-10-20-migracja-mockupu-do-monorepo.md]
---

# Migracja aplikacji Kompas (mockup) do monorepo DevMentor

## Kontekst i cel
Jedyną działającą aplikacją w repo jest klikalny mockup `kompas-mentoring/mockupy/` (TypeScript bez frameworka, router na hashu, stan w pamięci, 22 ekrany, własny CSS, bundle esbuild). Szkielet monorepo (`packages/app|core|db|ui`) już istnieje. Celem jest przeniesienie aplikacji do monorepo zgodnie z `AGENTS.md`: najpierw strukturalnie, z zachowaniem dotychczasowego działania, potem stopniowo na React + Tailwind/shadcn i prawdziwe dane.

## Zakres
- W zakresie: przeniesienie kodu do pakietów, uruchamianie aplikacji przez Next.js, podział odpowiedzialności między `core`/`db`/`ui`/`app`, skrypty i importy, potem przepisanie ekranów na React i podpięcie danych.
- Poza zakresem tej specyfikacji: płatności, wideo, uwierzytelnianie produkcyjne (osobne specyfikacje).

## Wymagania
1. Po każdej fazie aplikacja działa jak przed nią (te same ekrany, przepływy, role, stany, mapa ekranów) — weryfikowane zrzutami ekranu.
2. Reguły domenowe żyją w `@devmentor/core` jako czyste funkcje z jawnym `now` (bez ukrytego „teraz”).
3. Dane demo żyją w `@devmentor/db` (fixtures), typy domenowe w `@devmentor/core`.
4. Formatowanie, ikony i style wielokrotnego użytku żyją w `@devmentor/ui`.
5. Kierunek zależności z `AGENTS.md` bez wyjątków; kod uruchamiany w przeglądarce importuje tylko moduły bez zależności serwerowych (podścieżki `@devmentor/core/domain`, `@devmentor/db/fixtures`).
6. Jeden zestaw poleceń z korzenia: `npm run dev|build|typecheck`; stary projekt `kompas-mentoring/mockupy` usunięty.

## Plan wdrożenia (fazy)

### Faza 1 — przeniesienie strukturalne z zachowaniem działania
- `core`: `src/domain/` — typy (Role, Mentor, Session, …), stałe katalogowe (kategorie, warianty planu), reguły z `domain.ts` z wymaganym `now`; eksport `@devmentor/core/domain`.
- `db`: `src/fixtures/` — dane z `mocks.ts` (w tym `DEMO_NOW`); eksport `@devmentor/db/fixtures` (czyste dane, bez MikroORM).
- `ui`: `lib/format.ts` (daty, kwoty, inicjały), `lib/icons.ts` (ścieżki SVG), `styles/kompas.css` (dotychczasowy system wizualny); eksport `@devmentor/ui/kompas.css`.
- `app`: `src/legacy/` — router, store, widoki HTML i ekrany mockupu; start przez `startKompasApp(root)` z funkcją sprzątającą; montowane przez komponent kliencki na `/` w grupie tras `(legacy)` z własnym root layoutem (tylko `kompas.css`, bez Tailwinda). Panel `/admin` (shadcn) i `/api/health` w grupie `(backend)` z root layoutem Tailwinda.
- Usunięcie `kompas-mentoring/mockupy/`, aktualizacja `README.md`, `AGENTS.md`, `kompas-mentoring/README.md`.

**Kryteria ukończenia fazy 1** — ✅ ukończona 2026-10-20 (run: `.ai/runs/2026-10-20-migracja-mockupu-do-monorepo.md`)
- [x] `npm run typecheck` i `npm run build` zielone.
- [x] Zrzuty ekranów kluczowych tras (gość, uczeń, mentor, admin, stany loading/empty/error, mapa) zgodne z mockupem sprzed migracji — 29 tras × 1280 px i 360 px identyczne co do piksela; przepływy (stany, strażnik roli, rezerwacja → płatność → potwierdzenie) dają identyczny log.
- [x] Brak odwołań do `kompas-mentoring/mockupy` w kodzie i dokumentacji poza historią (`.ai/runs`, specyfikacje wdrożone).
- [x] `core` nie importuje `db`/`ui`; `ui` nie importuje `db`/`core`; `db` nie importuje React.

### Faza 2 — ekrany publiczne w React + Tailwind (następna)
P1–P4 (strona główna, wyszukiwarka, profil, logowanie/rejestracja) jako strony Next.js w `(frontend)` z komponentami `@devmentor/ui/frontend`; prawdziwe adresy URL zamiast hasha; usunięcie odpowiedników z `legacy`.
**Kryteria:** ekrany zgodne funkcjonalnie z mockupem, stany loading/empty/error, typecheck/build.

### Faza 3 — ekrany ucznia (U1–U9) i współdzielone (S1–S3) w React
Stan klienta (rezerwacja, saldo, sesje) przeniesiony ze `store` do warstwy serwisów z DI; komponenty wspólne do `@devmentor/ui`.

### Faza 4 — panel mentora (M1–M5) i admina (A1–A2) na shadcn/ui
Ekrany backendowe w `(backend)` na komponentach `@devmentor/ui/backend`; usunięcie `src/legacy` i `kompas.css`.

### Faza 5 — dane w PostgreSQL
Encje MikroORM i migracje dla mentorów, sesji, planów, wiadomości; seeder z `@devmentor/db/fixtures`; serwisy w `core`/`db` rejestrowane w Awilix; ekrany czytają dane przez `getRequestScope()`.

## Decyzje i zmiany
- 2026-10-20 — Faza 1 zachowuje widoki jako stringi HTML (`src/legacy`) zamiast przepisywać 22 ekrany naraz: migracja strukturalna i przepisanie na React to osobne ryzyka; zrzuty ekranów potwierdzają brak regresji przed portowaniem.
- 2026-10-20 — Oddzielne root layouty `(legacy)` i `(backend)`: `kompas.css` i preflight Tailwinda nie mogą działać na tej samej stronie bez regresji wyglądu.
- 2026-10-20 — Wyjątek przejściowy od zasady „`@devmentor/db` tylko na serwerze”: `@devmentor/db/fixtures` to czyste dane demo, importowane przez kliencki `legacy` do czasu fazy 5.
- 2026-10-20 — Faza 1: kod kliencki ładuje `src/legacy` przez dynamiczny `import()` w `useEffect` — moduły ekranów dotykają `window`/`document` przy ładowaniu i nie mogą być wykonane przy SSR.
- 2026-10-20 — Faza 1: `noUncheckedIndexedAccess` z `tsconfig.base.json` objął kod mockupu — ~35 miejsc poprawionych jawnie (`!` tam, gdzie mockup zakładał obecność elementu, `?? 0`/`?? ''` przy wartościach domyślnych); bez zmiany zachowania (zrzuty identyczne). Lookupi `mentorById`/`sessionById` przyjmują `string | undefined`.
- 2026-10-20 — Faza 1: walidacja formularzy (`req`, `len`, `validate`…) zostaje w `src/legacy/ui.ts` — jest związana z DOM (`HTMLFormElement`); przeniesienie razem z ekranami w fazach 2–4.
- 2026-10-20 — Faza 1: komponenty `@devmentor/ui/frontend` (`Container`, `Hero`) chwilowo nieużywane (strona `/` to teraz aplikacja z `legacy`); zostają jako baza fazy 2.
