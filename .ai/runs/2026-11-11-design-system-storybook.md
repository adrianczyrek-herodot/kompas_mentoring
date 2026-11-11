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
- Etap 1 — ADR 0006, wpis w spec stacku, specyfikacja `2026-11-11-design-system-storybook.md`. Tabela tokenów policzona (wszystkie pary ≥ progów w obu motywach; akcent jasny `#d4702a` dobrany tak, by tekst atramentowy miał ≥ 4,5 : 1, a przycisk względem tła ≥ 3 : 1). Czekam na zatwierdzenie tabeli.

## Wynik
W toku.

## Weryfikacja
Etap 0: tylko dokumenty, bez zmian w kodzie.

## Problemy i otwarte kwestie
Pytania Q1–Q5 w `packages/ui/POSTEP.md`.

## Wnioski
Brak (na razie).
