---
title: E3-S2 — dostępność mentora M3 (kroki 2–5 specyfikacji F3)
date: 2026-11-23
agent: cezar (subagent bb79d6aa)
status: in-progress
spec: .ai/specs/2026-11-23-f3-dostepnosc-rezerwacje.md
branch: cez/bb79d6aa
---

# E3-S2 — dostępność mentora M3 (kroki 2–5)

## Zadanie
Zaimplementować historię E3-S2 (#37, epik #24) — kroki 2–5 planu wdrożenia F3: domena dostępności,
migracja i komendy szablonu/wyjątków/ustawień z routerem oRPC, komponenty `packages/ui` ze stories
oraz ekran M3 `/mentor/kalendarz` z E2E (360/1280 px, axe). Jeden commit na krok planu, PR do `main`.

## Przebieg
- 12:20 — Rozpoznanie: spec F3, `scheduling/AGENTS.md`, `catalog` (wzorzec modułu), spec stacku §2.4/§4.3/§4.4, lekcje backend/ui/e2e. `pnpm install --frozen-lockfile` w worktree.
- 12:22 — Krok 2: domena dostępności (`availability.entity.ts`, polityki szablonu/settingsów/wyjątków, stałe w `config.ts`), dwa nowe przejścia `Booking` (`hold_released`, `cancelled_by_student`), testy jednostkowe.

## Wynik
- (w toku)

## Weryfikacja
- (w toku)

## Problemy i otwarte kwestie
- `Temporal.Instant.add` nie przyjmuje dni/tygodni — `BOOKING_HORIZON` zapisany jako 56×24 h.

## Wnioski
- (na koniec)
