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
- 12:22 — Krok 2: domena dostępności (`availability.entity.ts`, polityki szablonu/settingsów/wyjątków, stałe w `config.ts`), dwa nowe przejścia `Booking` (`hold_released`, `cancelled_by_student`), testy jednostkowe. Commit `506e9d7`.
- 12:25 — Krok 4 (UI) zlecony subagentowi `8975ebd8` (rozłączny zakres `packages/ui`), pracuje równolegle.
- 12:30 — Krok 3: migracja `scheduling` (`mentor_schedule`, `availability_rule`, `availability_exception`, `inbox_event`), repozytorium MikroORM, komendy szablonu/wyjątków/ustawień (puste kolizje), `getMentorCalendar`, publiczne `getWeeklyAvailabilityMinutes`, uprawnienie `scheduling.availability.manage.own`, kontrakty zod i router oRPC. Testy integracyjne (własność, 409, 403, wyjątki) i parity kontraktów zielone.

## Wynik
- Krok 2: `feat(scheduling)` — domena + przejścia, commit `506e9d7`.
- Krok 3: `feat(scheduling)` — migracja + komendy + kontrakty + router (commit do zrobienia).

## Weryfikacja
- Krok 2: `pnpm --filter @kompas/core typecheck` OK; unit 231/231; eslint/biome czyste.
- Krok 3: typecheck core/contracts/web OK; unit 231, contracts 22; `pnpm test:integration` 31/31 (Testcontainers, Docker uruchomiony lokalnie); `pnpm lint` — dependency-cruiser i knip czyste (132 ostrzeżeń wyłącznie w `prototypes/kompas-flow`, wcześniejsze).

## Problemy i otwarte kwestie
- `Temporal.Instant.add` nie przyjmuje dni/tygodni — `BOOKING_HORIZON` zapisany jako 56×24 h.

## Wnioski
- (na koniec)
