---
title: Testy Playwright w repo i migracja do monorepo — faza 4 (panel mentora i admina na shadcn/ui)
date: 2026-10-21
agent: Claude Code (claude-opus-5-5) przez cezar
status: done
spec: .ai/specs/2026-10-20-migracja-mockupu-do-monorepo.md
branch: cez/d24e11ee
---

# Testy Playwright w repo i faza 4 migracji

## Zadanie
Użytkownik: „dodaj playwright, a później przejdź do fazy 4”. Najpierw skrypty regresji i przepływów jako testy w repo, potem M1–M5 i A1–A2 na shadcn/ui, usunięcie `src/legacy` i `kompas.css`.

## Przebieg
- Playwright: `@playwright/test` 1.64.1 w korzeniu, `playwright.config.ts` (`next start` na porcie 3100, projekty `desktop`/`mobile`), `e2e/support.ts`, `e2e/visual.spec.ts` (39 ekranów × 2 szerokości), `e2e/flows/{public,student}.spec.ts` (przepływy z faz 2–3), skrypty `e2e`, `e2e:update`, typecheck `e2e/`.
- Pierwsze wzorce okazały się błędne: wszystkie ekrany mentora (i oba admina) identyczne — `router.push('/app#/…')` na `/app` nie wywołuje `hashchange`. Poprawione w `go()`; dodatkowo zrzut pokoju sesji przy 360 px złapał stan „łączenie…” — stany ładowania dostały `aria-busy`, `settle()` czeka na `networkidle`. Wzorce wygenerowane od nowa: 78 plików, 0 duplikatów, dwa kolejne przebiegi 93/93.
- cezar zrobił po poprzedniej turze commit „autosave” z pierwszą (błędną) wersją wzorców — poprawione w kolejnym commicie.
- Faza 4: projekt dopisany do specyfikacji (jeden root layout, motyw shadcn w `.backend`, trasy panelu). Komponenty shadcn z CLI — poprawione importy `cn`, usunięty pakiet `cn`, dodane `lucide-react`, `tw-animate-css`, sonner bez `next-themes`.
- Usunięte `src/legacy`, `/app`, `kompas.css`, `frontend.css`; wspólny arkusz `styles.css`; `(site)` + `(panel)`. Zrzuty stron: najpierw wszystkie różne — przyczyny: `antialiased` na `body` (usunięte), style bazowe pod `:where()` przegrywające z preflightem (podniesiona specyficzność), `networkidle` w testach nigdy nie osiągane przez prefetch Next (zastąpione `main[data-path]`). Ostatecznie 40/62 identycznych, 22 z drobnymi zmianami natywnych kontrolek — przyjęte.
- Reguły w `core` (onboarding, zarobki, moderacja), dane panelu w fixtures, akcje panelu, widoki M1–M5, A1–A2 na shadcn/ui, strony `(panel)`.
- Testy: `e2e/flows/panel.spec.ts` (7 przepływów); poprawki harnessu: `expectToast` (sonner wstawia najnowszy na górę), normalizacja URL w `go()` (`?f=próbny`).
- Przerwa na limicie dostawcy; po wznowieniu (prośba o PR) dokończona dokumentacja i lekcje.

## Wynik
- Commity: `8f0607e` (Playwright), `134b26e` (autosave cezar z kodem fazy 4), commit z dokumentacją fazy 4; PR do `main`.
- Wszystkie ekrany w React: strony frontendowe (Tailwind) i panel (shadcn/ui) w jednym root layoucie.

## Weryfikacja
- `npm run typecheck` — 4 pakiety + `e2e`, bez błędów.
- `npm run build` — 30 tras.
- `npx playwright test` — 118 passed (30 przepływów, 88 zrzutów desktop + mobile), wzorce bez duplikatów.

## Problemy i otwarte kwestie
- Panel nie odwzorowuje wyglądu mockupu (świadomie — shadcn/ui); zgodność funkcjonalna potwierdzona testami.
- Faza 5 (dane w PostgreSQL, serwisy w Awilix zamiast akcji stanu demo) przed nami.

## Wnioski
- `.ai/lessons.md`: specyficzność stylów bazowych vs preflight, scoping tokenów shadcn/Kompas, poprawki po `shadcn add`, sonner w testach + `antialiased`; usunięte lekcje o warstwie `legacy` (nieaktualne), uogólniona lekcja o nawigacji klienta.
