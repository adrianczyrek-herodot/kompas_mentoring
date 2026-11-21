---
title: Design system Kompasu z dokumentacją w Storybooku (etapy 0–5)
date: 2026-11-11
agent: Claude Code (claude-opus-5-5) przez cezar
status: in-progress
spec: .ai/specs/2026-11-11-design-system-storybook.md
branch: cez/54b7d378
---

# Design system Kompasu z dokumentacją w Storybooku

## Zadanie
Zbudować design system `packages/ui` z dokumentacją w Storybooku jako instrukcją obsługi (prompt z lekcji 06, wariant „do uzupełnienia”). Praca etapami 0–5 z zatrzymaniem po każdym; postęp w `packages/ui/POSTEP.md`.

## Przebieg
- Etap 0 — prompt przyszedł z niewypełnionymi polami `{{…}}`. Materiały ustalone z repozytorium: brief, backlog, KONCEPCJA, spec stacku, spec F1, `lekcja-06/referencje.md`. Brak `lekcja-06/tokeny.md` i `audyt.md`.
- Etap 0 — inwentaryzacja `packages/ui` (shadcn Base UI, Tailwind 4.3.3, 8 komponentów, tokeny z mockupu, motyw `.dark`), sprawdzone wersje Storybook 10.6.7 (zgodny z Vite 8 i Vitest 5 z repo). Policzony kontrast obecnych tokenów: ramka pola 1,35 : 1, `warning` na `warning-soft` 4,46 : 1, biały na `signal` 2,98 : 1.
- Etap 0 — konflikt: spec stacku ma „Storybook — nie w MVP”. Zapisane jako pytanie Q4.
- Etap 0 — zapisany `packages/ui/POSTEP.md` (plan, propozycje zmian Z1–Z9, pytania Q1–Q5).
- Właściciel: tokeny proponuje agent, ciepły akcent zamiast zieleni, IBM Plex, Storybook z ADR 0006, Now E1–E3 w obu motywach.
- Etap 1 — ADR 0006, wpis w spec stacku, specyfikacja `2026-11-11-design-system-storybook.md`. Tabela tokenów policzona (wszystkie pary ≥ progów w obu motywach; akcent jasny `#d4702a` dobrany tak, by tekst atramentowy miał ≥ 4,5 : 1, a przycisk względem tła ≥ 3 : 1). Właściciel zatwierdził tabelę.
- Etap 1 — `lekcja-06/tokeny.md`; Storybook 10.6.6 + docs/a11y/vitest + remark-gfm; `tokens.css` (3 warstwy, 2 motywy), `globals.css` (Tailwind tylko z tokenów, fonty Plex z @fontsource), przełącznik motywu na `<html>`, 7 stron Podstaw z blokami czytającymi żywe zmienne, `check:tokens`, testy stories w obu motywach.
- Etap 1 — błędy znalezione i naprawione w trakcie: motyw nie działał na stronach MDX (dekorator) → kanał globals; aliasy shadcn nie przełączały się w poddrzewie `.dark` → deklaracja na `:root, .light, .dark`; tabele 320 px; kod inline i spis treści nieczytelne w ciemnym motywie; `.storybook` poza typecheckiem (dot-dir w `include`); lint skanował `storybook-static`.
- Etap 1 — jednorazowo `test:stories:themes` padł przy zbieraniu testów zaraz po podziale plików bloków; 3 kolejne przebiegi (w tym z wyczyszczoną pamięcią podręczną) przechodzą — prawdopodobnie przeładowanie optymalizacji zależności Vite.
- 2026-11-21 — nowa sesja (poprzednie padły: wygasłe OAuth, błąd modelu). Etap 2 rozpoczęty: lista różnic R1–R10 względem shadcn ze źródłami i pytania D1–D6, Z6, Z8 w `POSTEP.md`. `apps/web` nie używa rozmiarów przycisku < 44 px ani `secondary`, a `role="alert"` przekazuje jawnie — Z6/Z8/D6 nie wymagają zmian w aplikacji. Czeka na decyzje właściciela.
- 2026-11-21 — Właściciel: D1–D5 tak, Z6 „zostaw `sm` dla gęstych wierszy”, Z8 tak, D6 „usuń `secondary`”. Partia 1 (Button, Link, Input, Textarea, Field, Checkbox): komponenty na tokenach, 6 stron MDX × 13 sekcji, stories z macierzą stanów i testami interakcji. Naprawione: `cn()` gubił `text-label` (tailwind-merge), przeładowanie Vite w Vitest (`optimizeDeps.entries`), bloki Storybooka w ciemnym motywie, łamanie słów w tabelach na 320 px. Lint, typecheck, test, build, `test:stories:themes` (35 × 2) przechodzą; `check:tokens` — 5 wartości w Card/Alert (kolejne partie).

- 2026-11-21 — Właściciel: P-T11, P-T12 tak, „dalej”. Partia 2 (Select, Combobox, RadioGroup, Switch, ToggleGroup, Slider): komponenty, 6 stron MDX, stories, testy. Naprawione: przeładowanie Vite przy istniejącej pamięci podręcznej (`optimizeDeps.force`), testy nakładek czekają na koniec animacji, chipy Comboboxa w kolumnie, ToggleGroup za szeroki na 320 px, długi kod w tekście dokumentacji, ostrzeżenie Biome w CSS z partii 1 (raport partii 1 podawał „0 ostrzeżeń” — błąd filtra). Lint 0/0, typecheck, test, build, `test:stories:themes` 66 × 2 przechodzą.

- 2026-11-21 — Właściciel: P-T13, P-T14 tak, „dalej”. Partia 3 (Card, Separator, Badge, Avatar, Table, Tabs): Card bez wartości spoza tokenów (zostaje 1 w Alert). Naprawione: zmyślone liczby w przykładzie (zasada 7), sporadyczny test zakładek (dwa panele w animacji), 404 w konsoli od story błędu zdjęcia. Lint 0/0, typecheck, test, build, `test:stories:themes` 96 × 2 (3× z rzędu w każdym motywie).
- 2026-11-21 — Właściciel: P-T15 tak, zablokowane zakładki bez kłódki, partie 4 i 5 połączone w celu oszczędności tokenów, „continue”.
- 2026-11-21 — Partie 4 i 5 zrobione i zweryfikowane:
  - Partia 4: Dialog, AlertDialog, Sheet, Menu, Popover, Tooltip (nakładki na Base UI, portale, focus trap, klawiatura i Escape).
  - Partia 5: Alert (przepisany, Z8 — rola alert tylko dla błędów po akcji), Toast (ToastProvider, hook useToast), Skeleton, Spinner, EmptyState, ErrorState.
  - Dokumentacja: 12 nowych stron MDX z 13 sekcjami (komplet 30 komponentów bazowych ma dedykowane strony MDX).
  - Naprawione: 2 błędy lint `@typescript-eslint/no-confusing-void-expression`, formatowanie Biome, usunięte samowolne klasy palety w przykładzie `alert.mdx`.
  - Weryfikacja: `pnpm lint` (0 błędów, 0 ostrzeżeń), `pnpm typecheck`, `pnpm test`, `pnpm build`, `build-storybook` — wszystko na zielono. `check:tokens` zwrócił 0 błędów (czyste tokeny w całym pakiecie). `test:stories:themes` — 31 plików, 156/156 testów w motywie jasnym i 156/156 w ciemnym z a11y `test: 'error'`. Etap 2 ukończony.

## Wynik
Etap 0, 1 i 2 w pełni ukończone. Komplet 30 komponentów bazowych gotowy, ostylowany na tokenach, przetestowany w obu motywach i udokumentowany w Storybooku.

## Weryfikacja
Etap 0: tylko dokumenty.
Etap 1: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` — przechodzą; `build-storybook` — przechodzi; `test:stories:themes` — 2/2 w obu motywach; zrzuty 7 stron Podstaw (2 motywy × 320/768/1440) obejrzane.
Etap 2: `pnpm lint` (ESLint 0 błędów, Biome 0 błędów/ostrzeżeń), `pnpm typecheck` (6/6), `pnpm test` (4/4), `pnpm build` (web + packages), `pnpm --filter @kompas/ui check:tokens` (0 wartości spoza tokenów), `test:stories:themes` (156 testów × 2 motywy, 31 plików stories z testami interakcji i regułami a11y 'error'), `build-storybook` (kompilacja statyczna bez błędów).

## Problemy i otwarte kwestie
P-T16 (tokeny tła i tekstu odwróconego dla Tooltip) — do zatwierdzenia przez właściciela. Następny krok: Etap 3 po otrzymaniu „dalej”.

## Wnioski
4 wpisy w `.ai/lessons.md` (2026-11-11: dot-dir w tsconfig, motyw na stronach MDX, aliasy CSS w poddrzewie motywu, `storybook-static` w lincie).
