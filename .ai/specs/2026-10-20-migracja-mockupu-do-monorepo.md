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

### Faza 2 — ekrany publiczne w React + Tailwind
P1–P4 (strona główna, wyszukiwarka, profil, logowanie/rejestracja) jako strony Next.js w `(frontend)` z komponentami `@devmentor/ui/frontend`; prawdziwe adresy URL zamiast hasha; usunięcie odpowiedników z `legacy`.

**Projekt fazy 2**
- Trasy: `/` (P1), `/mentorzy` (P2, filtry w query: `topic`, `priceMax`, `verified`, `time`, `sort`), `/mentorzy/[id]` (P3), `/logowanie`, `/rejestracja` (P4, `?jako=mentor`). Pozostałe ekrany mockupu przechodzą pod `/app#/…` (np. `/app#/sesje`).
- Jeden root layout `(frontend)` dla stron React i `/app`: przejścia między nimi są nawigacją klienta (bez przeładowania), więc stan demo w pamięci (rola, sesje, ulubieni, `returnTo`) przeżywa przejście jak w mockupie. Grupa `(legacy)` znika. CSS: `@devmentor/ui/frontend.css` = motyw Tailwinda (tokeny Kompasu) + `kompas.css` w warstwie `kompas` + utilities — **bez preflightu**; utilities wygrywają z `kompas.css`, a `src/legacy` jest wyłączone ze skanowania Tailwinda (`@source not`).
- Stan demo: `src/legacy/store.ts` → `src/demo/store.ts` z `subscribe`/`notify` i hookiem `useDemoStore()` (React). Nawigacja mockupu (`NAV`, `ROLE_LABEL`, `DEFAULT_ROUTE`, tabela ekranów publicznych) → `src/demo/navigation.ts`; `toUrl('#/…')` zamienia trasę mockupu na adres: publiczne → prawdziwa ścieżka, reszta → `/app#/…`.
- Legacy: trasy P1–P4 i `screens/public.ts` usunięte; `render()` przekierowuje trasę publiczną przez `navigate(toUrl(…))` (router Next.js, `replace`), więc istniejące linki `#/mentorzy`, `go('#/rejestracja')`, `DEFAULT_ROUTE.guest` działają bez zmian. Stare adresy `/#/…` przekierowuje strona główna.
- Chrome dla stron React (pasek MOCKUP: rola, stany, mapa; topbar z nawigacją wg roli; bottomnav; stopka) jako komponent React w Tailwindzie; `/app` zachowuje chrome z `legacy` do fazy 4.
- `@devmentor/ui/frontend`: `Icon`, `Avatar`, `Rating`, `buttonVariants`, `Tag`, `Chip`, `Skeleton`, `EmptyState`, `ErrorState`, `Field`, `Toaster`/`toast()`. Walidatory wartości (`required`, `length`, `email`) → `@devmentor/core/validation` (używane przez React i `legacy`).
- Stany ekranu: `?state=loading|empty|error` jak w mockupie; przy wejściu na stronę 280 ms „loading”, jak w mockupie.

**Kryteria ukończenia fazy 2** — ✅ ukończona 2026-10-20 (run: `.ai/runs/2026-10-20-migracja-faza-2-ekrany-publiczne.md`)
- [x] `npm run typecheck` i `npm run build` zielone.
- [x] P1–P4 pod prawdziwymi adresami, w React + Tailwind, funkcjonalnie zgodne z mockupem — 28 automatycznych sprawdzeń przepływów (`next start` i `next dev`); wyniki wyszukiwarki identyczne z mockupem dla 8 kombinacji filtrów; zrzuty porównane wizualnie z mockupem.
- [x] Przejścia React ↔ `/app` zachowują stan demo (rola, `returnTo`, toast); przełącznik roli działa na obu; wstecz z `/mentorzy` wraca do `/app#/sesje`.
- [x] Ekrany pozostałe w `legacy` (pod `/app`) identyczne co do piksela z mockupem — 24/24 przy 1280 i 360 px.
- [x] `src/legacy` nie zawiera P1–P4; brak kolizji klas utilities z `kompas.css` (sprawdzone na zbudowanym CSS), brak preflightu.

### Faza 3 — ekrany ucznia (U1–U9) i współdzielone (S1–S3) w React (następna)
Stan klienta (rezerwacja, saldo, sesje) przeniesiony ze `store` do warstwy serwisów z DI; komponenty wspólne do `@devmentor/ui`.

### Faza 4 — panel mentora (M1–M5) i admina (A1–A2) na shadcn/ui
Ekrany backendowe w `(backend)` na komponentach `@devmentor/ui/backend`; usunięcie `src/legacy` i `kompas.css`. Przy usuwaniu `kompas.css`: przenieść do warstwy `base` w `frontend.css` style elementów, na których dziś polegają też strony React (tło i font `body`, marginesy `p`/`h*`, `font: inherit` dla kontrolek) albo włączyć preflight i sprawdzić zrzuty P1–P4.

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
- 2026-10-20 — Faza 2: strony React i `/app` w jednym root layoucie `(frontend)` (zamiast osobnych `(legacy)`), żeby przejścia były nawigacją klienta i stan demo w pamięci przeżywał je jak w mockupie. Konsekwencja: `frontend.css` bez preflightu do końca fazy 4.
- 2026-10-20 — Faza 2: przekierowanie tras przepisanych ekranów w `legacy/main.ts` (`render()` → `navigate(toUrl(hash))`, `router.replace`) zamiast przepisywania kilkudziesięciu linków `#/…` w ekranach — jedno miejsce, linki i `go()` działają bez zmian, a historia „wstecz” nie zapętla się.
- 2026-10-20 — Faza 2: logika wyszukiwarki (filtry z adresu, sortowanie, aktywne filtry, podobni mentorzy) → `@devmentor/core/domain/search.ts`; walidatory → `@devmentor/core/validation` (używa ich też `legacy`).
- 2026-10-20 — Faza 2: `/app` bez hasha prowadzi na `/` (dawne `/` mockupu = P1); stare adresy `/#/…` przekierowuje P1.
- 2026-10-20 — Faza 2: znana drobna różnica wizualna — placeholder wideo w P3 jest wyższy niż w mockupie (proporcja 16:9 z Tailwinda; w mockupie siatka spłaszczała go); poza tym strony P1–P4 wyglądają jak w mockupie.
