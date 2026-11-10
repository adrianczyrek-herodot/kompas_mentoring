---
title: Migracja aplikacji Kompas do monorepo — faza 1
date: 2026-10-20
agent: Claude Code (claude-opus-5-5) przez cezar
status: done
spec: .ai/specs/2026-10-20-migracja-mockupu-do-monorepo.md
branch: cez/d24e11ee
---

# Migracja aplikacji Kompas do monorepo — faza 1

## Zadanie
Wdrożyć migrację projektu do monorepo zgodnie z `AGENTS.md`/`README.md`: zapisać plan z fazami, zrealizować pierwszą nieukończoną fazę (przeniesienie aplikacji do `packages/app`, wydzielenie `core`/`db`/`ui`), zachować działanie, zweryfikować.

## Przebieg
- Przeczytano `.ai/lessons.md` i specyfikację szkieletu (wdrożona, bez planu migracji) → nowa specyfikacja z fazami 1–5.
- Aplikacja do migracji = mockup `kompas-mentoring/mockupy` (vanilla TS, 2546 linii, 22 ekrany).
- Decyzja: faza 1 = przeniesienie strukturalne bez przepisywania widoków (ekrany HTML montowane w Next.js); React/Tailwind/shadcn i baza w fazach 2–5.
- Baseline: Playwright, 29 tras × 4 role na starym `index.html` (1280 px), potem 360 px z kopii przez `git archive`.
- `git mv` źródeł: `main/store/ui/screens` → `packages/app/src/legacy/`, `domain.ts` → `core/src/domain/rules.ts`, `mocks.ts` → `db/src/fixtures/demo.ts`, `styles.css` → `ui/src/styles/kompas.css`; reszta `kompas-mentoring/mockupy` usunięta.
- Typy z `mocks.ts` → `core/src/domain/types.ts`, `CATEGORIES`/`PLAN_OPTIONS` → `catalog.ts`; reguły z wymaganym `now` (13 wywołań w ekranach przekazuje `NOW` z fixtures).
- `ui`: `lib/format.ts`, `lib/icons.ts` wydzielone z `legacy/ui.ts` (który je reeksportuje — importy ekranów bez zmian).
- `main.ts` → `startKompasApp(root)` z funkcją sprzątającą; komponent `KompasApp` ładuje go dynamicznie; root layouty `(legacy)` i `(backend)`.
- Typecheck: 35 błędów `noUncheckedIndexedAccess` w kodzie mockupu + nieaktualne `.next/dev/types` (usunięte) → poprawione bez zmiany zachowania.
- Pierwszy skrypt przepływu źle zakładał walidację celu w rezerwacji planu (pole opcjonalne) — poprawiony; wynik identyczny dla starej i nowej wersji.

## Wynik
- Nowe/zmienione w pakietach: `core/src/domain/{types,catalog,rules,index}.ts` (+ eksport `./domain`), `db/src/fixtures/{demo,index}.ts` (+ eksport `./fixtures`), `ui/src/lib/{format,icons}.ts`, `ui/src/styles/kompas.css` (+ eksport `./kompas.css`), `app/src/legacy/*` (+ `kompas-app.tsx`), `app/src/app/(legacy)/{layout,page}.tsx`, `app/src/app/(backend)/layout.tsx`; usunięte `app/src/app/layout.tsx`, `(frontend)/{layout,page}.tsx`, `kompas-mentoring/mockupy/`.
- Dokumentacja: `README.md`, `AGENTS.md` (podścieżki dla przeglądarki, zasady dla `src/legacy`), `kompas-mentoring/README.md`; specyfikacja z planem faz 1–5 (faza 1 odhaczona).

## Weryfikacja
- `npm run typecheck` — 4 pakiety bez błędów.
- `npm run build` — Next.js 16.4.2: `/` (legacy), `/admin`, `/api/health`.
- Zrzuty `next start` vs stary mockup: 29/29 identycznych przy 1280 px i 29/29 przy 360 px (pixelmatch, próg 0.1), bez błędów JS.
- Przepływy (stan error → retry, strażnik gościa, strażnik roli + przełączenie, wybór terminu → checkout → rezerwacja → potwierdzenie, przyciski sesji, mapa ekranów): log identyczny na starym mockupie, `next start` i `next dev` (StrictMode).
- `next dev`: zrzuty różnią się tylko wskaźnikiem dev Next.js w rogu; `/admin` 200; `/api/health` 503 bez bazy (oczekiwane).
- Granice pakietów sprawdzone grepem importów: `core` → tylko awilix; `db` → `@devmentor/core(/domain)`; `ui` → brak pakietów wewnętrznych; `legacy` → tylko podścieżki bezpieczne dla przeglądarki.

## Problemy i otwarte kwestie
- Nie przeklikano ręcznie każdego wariantu formularza (sesja próbna z kartą, KOMPAS10, symulacje 409/odrzuconej płatności) — pokryte pośrednio: kod ekranów bez zmian poza poprawkami typów.
- Utracono możliwość otwarcia mockupu offline z `index.html` — teraz `npm run dev`.
- Skrypty zrzutów są poza repo; jeśli fazy 2–4 mają je używać, warto dodać je jako skrypt/skill w repo (wymaga `playwright` jako devDependency).
- Następny etap: faza 2 (P1–P4 w React + Tailwind w `(frontend)`, prawdziwe URL-e).

## Wnioski
- `.ai/lessons.md` → „Kod i mockupy”: regresje zrzutami ekranu (Playwright + pixelmatch, `git archive`, wskaźnik dev); osobne root layouty i dynamiczny import `legacy`.
