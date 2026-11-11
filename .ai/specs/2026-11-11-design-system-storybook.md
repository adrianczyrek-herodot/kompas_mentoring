---
title: Design system Kompasu z dokumentacją w Storybooku
status: in-progress
created: 2026-11-11
implemented:
related:
  - packages/ui/POSTEP.md
  - .ai/runs/2026-11-11-design-system-storybook.md
  - docs/decisions/0006-design-system-storybook.md
  - lekcja-06/referencje.md
  - .ai/specs/product-brief.md
  - .ai/specs/backlog.md
  - kompas-mentoring/KONCEPCJA.md
---

# Design system Kompasu z dokumentacją w Storybooku

## Kontekst i cel

Ekrany Kompasu budują developerzy i agenci AI. Bez jednej instrukcji obsługi każdy zgaduje komponent, tokeny, stany i zachowanie, a obecne `packages/ui` to 8 komponentów shadcn z paletą z mockupu. Cel: design system w `packages/ui` z dokumentacją w Storybooku, z której developer albo agent zbuduje nowy ekran bez zgadywania, a designer sprawdzi zgodność ekranu z systemem. Styl wynika z `lekcja-06/referencje.md` (R01–R06, A01–A04, K1–K6), briefu i KONCEPCJI.

## Zakres

- W zakresie: tokeny w trzech warstwach (jasny i ciemny motyw), fonty IBM Plex w projekcie, Storybook 10 w `packages/ui/.storybook`, Podstawy, ok. 30 komponentów bazowych, komponenty produktu, wzorce i ekrany epików Now (E1–E3), strony przewodnika, `docs/design-system.md` dla agentów, skrypt `check:tokens`, testy stories (a11y + interakcje) w obu motywach.
- Poza zakresem: ekrany Later (L1–L3: U2, U3, U6–U9, S1, M4, M5, A2) — tylko na stronie „Czego brakuje”; przebudowa ekranów `apps/web` (poza tym, co wynika z aliasów tokenów); publikacja Storybooka; ekran E2-S8 „Ulubieni mentorzy” (zostawiony na test agentem).

## Wymagania

1. Proces etapami 0–5 z zatrzymaniem po każdym (prompt zadania); postęp w `packages/ui/POSTEP.md`.
2. Każda wartość w komponentach z tokenu; brak hex/rgb/hsl/oklch poza plikiem tokenów, brak klas palety Tailwinda i wartości arbitralnych — pilnuje `pnpm --filter @kompas/ui check:tokens` (kod wyjścia ≠ 0).
3. Tokeny: surowe → znaczeniowe (nazwy według przeznaczenia, z komentarzem o źródle) → komponentów (tylko gdy potrzebne). Nazwy shadcn (`--primary`, `--muted`…) zostają jako aliasy, żeby `apps/web` działało bez zmian (`BACKWARD_COMPATIBILITY.md`).
4. Kontrast każdej używanej pary ≥ 4,5 : 1 (tekst) i ≥ 3 : 1 (elementy interfejsu, fokus) w obu motywach (WCAG 1.4.3, 1.4.11).
5. Storybook: addon-docs z `remark-gfm`, addon-a11y z `a11y: { test: 'error' }`, addon-vitest; przełącznik motywu na `document.documentElement`; tylko nazwa „Kompas” w UI Storybooka; wyłączone onboarding/checklista i komunikaty o nowej wersji.
6. Każdy komponent: strona z 13 sekcjami, Playground, warianty, macierz stanów (`data-preview-state`), długa treść i wąski ekran, play function dla głównego zachowania.
7. Każda reguła w dokumentacji ze źródłem (R…, A…, K…, brief, specyfikacja, WCAG, WAI-ARIA); bez źródła — oznaczona jako propozycja.
8. Dane w przykładach z briefu i KONCEPCJI; bez lorem ipsum i zmyślonych ocen, liczb klientów czy opinii.
9. Nowe zależności tylko z listy w „Projekt rozwiązania”.

## Kryteria akceptacji

- [ ] `pnpm --filter @kompas/ui build-storybook`, `typecheck`, `pnpm lint` przechodzą.
- [ ] `check:tokens` nie znajduje wartości spoza tokenów.
- [ ] Testy stories przechodzą w motywie jasnym i ciemnym, bez naruszeń a11y albo z opisanym wyjątkiem.
- [ ] Każdy komponent ma stronę z 13 sekcjami i macierz stanów.
- [ ] Każdy wzorzec ma wszystkie stany danych, formularz — stany odpowiedzi API.
- [ ] Każdy kluczowy ekran E1–E3 ma story i mapę stanów.
- [ ] Oba motywy działają także w dialogach, menu i popoverach.
- [ ] `docs/design-system.md` istnieje i `AGENTS.md` do niego odsyła.
- [ ] `apps/web` buduje się i wygląda poprawnie po zmianie tokenów (`pnpm build`, e2e).
- [ ] Test agentem (osobna sesja) wykonany, luki uzupełnione albo wpisane do „Czego brakuje”.

## Projekt rozwiązania

Szczegółowe listy komponentów, wzorców, ekranów i drzewo menu: `packages/ui/POSTEP.md` → „Plan”.

- **Pliki:** `packages/ui/src/styles/tokens.css` (jedyny plik z surowymi wartościami), `globals.css` (Tailwind `@theme`, aliasy shadcn, base), `src/components/*` (+ `*.stories.tsx`, `*.mdx` obok), `.storybook/` (`main.ts`, `preview.tsx`, `manager.ts`, `pages/*.mdx`, `blocks/*`), `scripts/check-tokens.mjs`, `vitest.config.ts`.
- **Zależności (devDependencies `@kompas/ui`):** `storybook`, `@storybook/react-vite`, `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-vitest`, `vitest` (5.0.5), `@vitest/browser-playwright`, `playwright`, `vite` (8.3.4), `@tailwindcss/vite` (4.3.3), `react-dom`, `remark-gfm`. **dependencies:** `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`, `@fontsource/ibm-plex-serif`.
- **API w stories:** bez MSW — komponenty nie wołają API; wzorce dostają asynchroniczne funkcje (`onSubmit` itp.), stories symulują sukces, oczekiwanie, błąd pola, błąd serwera, brak sieci.
- **Motywy:** klasa `dark` na `<html>` (istniejący `@custom-variant dark`); testy w obu motywach przez zmienną środowiskową czytaną w `preview`.

## Plan wdrożenia

1. Etap 0 — inwentaryzacja i plan (zrobione, decyzje Q1–Q5).
2. Etap 1 — tabela tokenów do zatwierdzenia → `lekcja-06/tokeny.md`; Storybook i dodatki; tokeny w kodzie; fonty; przełącznik motywu; strony Podstaw; `check:tokens`.
3. Etap 2 — różnice kształtu, gęstości i stanów względem shadcn; komponenty bazowe partiami po ~6.
4. Etap 3 — komponenty produktu E1–E3, wzorce, ekrany z mapą stanów.
5. Etap 4 — strony przewodnika i `docs/design-system.md`.
6. Etap 5 — sprawdzenie, raport, przygotowanie testu agentem.

## Decyzje i zmiany

- 2026-11-11 — Właściciel (etap 0): tokeny proponuje agent w etapie 1 (brak `tokeny.md`); **ciepły akcent zamiast zieleni** dla akcji głównej i stanów (K4, R06.2) — zieleń zostaje najwyżej jako kolor sukcesu; krój **IBM Plex** (Sans, Mono, Serif); Storybook mimo „nie w MVP” — wpis w spec stacku i [ADR-0006](../../docs/decisions/0006-design-system-storybook.md); zakres **Now (E1–E3), oba motywy**; dokumentacja po polsku.
