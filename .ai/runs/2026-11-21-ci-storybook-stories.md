---
title: Job CI dla testów stories Storybooka w obu motywach
date: 2026-11-21
agent: Claude Code (cezar) / claude-opus-5-5
status: done
spec: .ai/specs/2026-11-11-design-system-storybook.md
branch: cez/37943ecc
---

# Job CI dla testów stories Storybooka w obu motywach

## Zadanie
Dodać do `.github/workflows/ci.yml` osobny job uruchamiający testy stories skryptem z etapu 1 w obu motywach, z instalacją przeglądarki Playwrighta; pozostałe joby bez zmian. YAML do akceptacji przed zapisem.

## Przebieg
- Skrypt `test:stories:themes` (`packages/ui`) i `POSTEP.md` istniały tylko na gałęzi `cez/54b7d378` (etap 1, niescalony do `main`). Właściciel zdecydował: scalić etap 1, potem zapisać job.
- Scalenie: konflikt add/add w `lekcja-06/tokeny.md` (ćwiczenie z `main` vs zatwierdzona tabela etapu 1). Właściciel wybrał wersję z etapu 1 (wdrożona w `tokens.css`).
- YAML joba `storybook` zaakceptowany przez właściciela i dopisany po jobie `e2e`. Kroki checkout / pnpm / setup-node / `pnpm install --frozen-lockfile` jak w pozostałych jobach (repo używa pnpm, nie npm), Chromium z CDN + `install-deps` best-effort jak w `e2e`.

## Wynik
- Merge `cez/54b7d378` → `cez/37943ecc` (`07ba651`).
- `.github/workflows/ci.yml`: nowy job `storybook` (+24 linie, 0 usuniętych).

## Weryfikacja
- YAML parsuje się; joby: lint, typecheck, test, integration, build, e2e, storybook, deploy-preview.
- Lokalnie: `pnpm install --frozen-lockfile`, `pnpm --filter @kompas/ui exec playwright install chromium`, `pnpm --filter @kompas/ui test:stories:themes` — exit 0, 2/2 testy w motywie jasnym i 2/2 w ciemnym.
- `pnpm lint` i `pnpm typecheck` na scalonym drzewie — exit 0.
- Job nie był uruchomiony w GitHub Actions (brak pusha); `actionlint` niedostępny lokalnie.

## Problemy i otwarte kwestie
- Push zmiany w `.github/workflows/*` wymaga zakresu `workflow` w tokenie gh (lekcja 2026-10-21).
- Gałąź zawiera dwa commity „cezar autosave” z etapu 1.

## Wnioski
Brak nowych wpisów w `.ai/lessons.md`.
