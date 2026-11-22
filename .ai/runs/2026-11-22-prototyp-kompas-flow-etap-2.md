---
title: Prototyp kompas-flow — etap 2 od nowa (14 ekranów, stany, role, scenariusze)
date: 2026-11-22
agent: Claude Code (claude-opus-5-5) + sub-zadania cezar (sonnet)
status: in-progress
spec: .ai/specs/2026-11-21-prototyp-kompas-flow.md
branch: cez/2c93155b
---

# Prototyp kompas-flow — etap 2 od nowa

## Zadanie
Użytkownik: „kontynuuj” (etap 3). Przed etapem 3 sprawdzenie etapu 2 (commit `202c452`, zrobiony innym modelem) — wynik: do przepisania.

## Przebieg
- Przegląd `202c452`: `tsc` 0, ale `pnpm lint` — 42 błędy (CI PR #57 czerwony). Ekrany używają klas spoza DS (`bg-surface-primary`, `text-text-primary`, `bg-accent-primary`, `text-white`, `text-heading-*` — nie istnieją w `globals.css`, więc bez stylu), hooki po wczesnym `return` (U6), `alert()` (M1), natywne `<input type=checkbox>` zamiast `Checkbox`, kwoty jako `number` (M5), martwe przyciski („Zapisz notatkę”, „Dodaj zdjęcie”, „Zleć wypłatę”, potwierdzenie „Opuść pokój”), krok M1 nie podąża za trasą (`setStep` nieużywane), dane spoza mocków.
- Luka z etapu 1: scenariusz „wygaśnięcie sesji” jest w stanie, ale bez kontrolki i bez obsługi; brak presetów zegara, „mentor nie dołączył”.
- Decyzja: wspólna warstwa stanu i scenariusze — sam; ekrany — 3 równoległe zadania o rozłącznych plikach (uczeń U6–U9 + S1–S3, mentor M1–M5, admin A1–A2).

## Wynik

## Weryfikacja

## Problemy i otwarte kwestie

## Wnioski
