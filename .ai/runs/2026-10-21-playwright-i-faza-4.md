---
title: Testy Playwright w repo i migracja do monorepo — faza 4 (panel mentora i admina na shadcn/ui)
date: 2026-10-21
agent: Claude Code (claude-opus-5-5) przez cezar
status: in-progress
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

## Wynik

## Weryfikacja

## Problemy i otwarte kwestie

## Wnioski
