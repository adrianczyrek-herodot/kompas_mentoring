---
title: Prototyp kompas-flow — ekrany mentora M1–M5
date: 2026-11-22
agent: Claude Code (Sonnet 5.5) w cezar
status: done
spec: .ai/specs/2026-11-21-prototyp-kompas-flow.md
branch: cez/e4c359fa
---

# Prototyp kompas-flow — ekrany mentora M1–M5

## Zadanie
Zastąpić zaślepki M1–M5 w `prototypes/kompas-flow` pełnymi ekranami wg KONCEPCJA §4 i zasad z shared-rules.md (zakres: `src/screens/m{1..5}-*.tsx` + ten log).

## Przebieg
- Start: przeczytano lessons, shared-rules, area-mentor, world.ts, mentor-work.ts, wzorce U4/U5/P4, szary mentor.ts.
- Koniec: commit `ade7ab9`, gałąź wypchnięta, PR [#59](https://github.com/adrianczyrek-herodot/kompas_mentoring/pull/59) do `main`.

## Wynik
M1–M5 zastąpione pełnymi ekranami: `m1-onboarding.tsx` + `m1-steps.tsx` (stepper, 6 kroków, draft w `onboardingDraft`, widoki statusów wniosku), `m2-dashboard.tsx` + `m2-parts.tsx` (agenda, prośby, dialog odrzucenia, zadania, statystyki wyliczone), `m3-calendar.tsx` + `m3-template.tsx` + `m3-settings.tsx` (tydzień, szablon, wyjątki, ustawienia, Google Calendar jako symulacja), `m4-students.tsx` + `m4-detail.tsx` (lista, szczegóły, edytor notatki, notatka prywatna), `m5-earnings.tsx` (zarobki, wypłata, historia).
DS-GAP: Progress (M5), KpiTiles (M2), OnboardingStepper (M1), TagInput (M1), WeeklyAvailabilityEditor (M1/M3), WeekCalendar (M3), DatePicker (M3/M4).

## Weryfikacja
- `typecheck` 0; eslint plików m*.tsx: 0 błędów (15 ostrzeżeń max-lines); `vite build` OK; `check-classes` 0; `check-tokens` 0.
- Playwright (skrypty w /tmp, port 5202), zero pageerror/błędów konsoli: M2 (dołącz, odrzucenie z walidacją i błędem sieci, przyjęcie z błędem serwera, stany danych), M3 (konflikt przy usuwaniu dostępności, zapis, walidacje ustawień i wyjątków, konflikt wyjątku, usuwanie, Google połącz/rozłącz/błąd, Pusto/Ładowanie), M4 (filtry, stany, walidacje notatki, błąd żądania, notatka widoczna w historii, notatka prywatna, Napisz → S1, nieznany uczeń), M5 (CSV, faktury, wypłata z błędem i sukcesem, limit 1/dobę, baner błędu, Pusto, Ładowanie), M1 (Kasia, Adam submitted, pełny przebieg 6 kroków z walidacjami, symulacje, Wstecz, ponowne wysłanie; do testu tymczasowo ustawiono a1 na changes_requested — cofnięte).
- 320 px (brak przewijania poziomego), 1440 px i ciemny motyw obejrzane.

## Problemy i otwarte kwestie
- A1 był zaślepką, więc przejście changes_requested przetestowano łatką danych (cofnięta), nie przez A1.
- Pełny przebieg M1 na 320 px nie przeklikany do końca (toast przykrywa przycisk); kroki oglądane osobno.

## Wnioski
brak
