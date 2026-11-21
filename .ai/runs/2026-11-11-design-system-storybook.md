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

## Wynik
W toku.

## Weryfikacja
Etap 0: tylko dokumenty.
Etap 1: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` — przechodzą; `build-storybook` — przechodzi; `test:stories:themes` — 2/2 w obu motywach; zrzuty 7 stron Podstaw (2 motywy × 320/768/1440) obejrzane; `check:tokens` — 32 wartości w istniejących komponentach shadcn (etap 2). Niesprawdzone: ekrany `apps/web` w przeglądarce i e2e (brak Dockera/Postgresa).

## Problemy i otwarte kwestie
Z6, Z8, CI dla testów stories i `check:tokens` — w `packages/ui/POSTEP.md`.

## Wnioski
4 wpisy w `.ai/lessons.md` (2026-11-11: dot-dir w tsconfig, motyw na stronach MDX, aliasy CSS w poddrzewie motywu, `storybook-static` w lincie).
