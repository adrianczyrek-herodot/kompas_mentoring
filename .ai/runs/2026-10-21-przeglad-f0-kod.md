---
title: Przegląd kodu F0 (część A)
date: 2026-10-21
agent: Claude Code (Sonnet 5.5), zadanie review cezar
status: done
spec: .ai/specs/implemented/2026-10-21-f0-szkielet-i-harness.md
branch: cez/516f417a (przegląd cez/5b47eecb @ 45e9f99)
---

# Przegląd kodu F0 (część A)

## Zadanie
Niezależny przegląd gałęzi cez/5b47eecb względem wymagań 1–12 i kryteriów akceptacji F0; tylko odczyt.

## Przebieg
- Uruchomiono `pnpm install --frozen-lockfile && lint && typecheck && test && build` — exit 0 (część zadań z cache Turbo).
- `E2E_PORT=3297 pnpm test:e2e` — 4/4 testów zielone (desktop-1280, mobile-360).
- Próbne importy (cofnięte, `git clean`): scheduling→foo/domain (obejście modułu), domain→shared/infrastructure, domain→application (też `export *`, `import()`), application→infrastructure, apps→packages/core/src (ścieżka względna i `@kompas/core/src/...`), ui→@kompas/core. Wszystkie wyłapane przez ESLint (komunikaty „Fix:”) i/lub dependency-cruiser (8 naruszeń).
- Money.allocate sprawdzone próbnie: 100/[1,2]→33+67, 5/[1,1,1]→2,2,1, ujemne OK, ratio [], [0,0], [-1,2] rzucają błąd Dinero.
- Zweryfikowano: tabela przejść = §4.3, pg-boss web/worker, SIGTERM workera, migracja (11 schematów, 3 rozszerzenia), CI (SHA, `permissions: {}`, frozen lockfile, persist-credentials false), brak `^`/`~` w package.json.

## Wynik
Brak defektów blokujących. Uwagi niekrytyczne w raporcie (luki lintu domain purity, brak runtime check waluty, apps widzą `Orm` z `@kompas/core`).

## Weryfikacja
Patrz „Przebieg”. Testy integracyjne pominięte (brak Dockera) — oczekiwane.

## Problemy i otwarte kwestie
Testy integracyjne (migracja) nie były uruchomione lokalnie.

## Wnioski
brak
