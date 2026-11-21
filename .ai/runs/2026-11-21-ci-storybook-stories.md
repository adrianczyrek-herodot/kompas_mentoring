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

- Po akceptacji właściciela: push i PR #54. W CI job `storybook` przechodzi; `e2e` padło na axe `color-contrast` (`.font-serif` w nagłówku, `.border-primary` w zakładkach P4) — skutek etapu 1 (`--primary` = bursztynowe wypełnienie akcji). Poprawka: `text-text-link` i `border-selected-border` w `site-header.tsx` i `auth-page.tsx`.

## Wynik
- Merge `cez/54b7d378` → `cez/37943ecc` (`07ba651`).
- `.github/workflows/ci.yml`: nowy job `storybook` (+24 linie, 0 usuniętych).
- `apps/web/app/_components/site-header.tsx`, `auth/auth-page.tsx`: klasy tokenów zamiast `text-primary`/`border-primary`.
- PR #54.

## Weryfikacja
- YAML parsuje się; joby: lint, typecheck, test, integration, build, e2e, storybook, deploy-preview.
- Lokalnie: `pnpm install --frozen-lockfile`, `pnpm --filter @kompas/ui exec playwright install chromium`, `pnpm --filter @kompas/ui test:stories:themes` — exit 0, 2/2 testy w motywie jasnym i 2/2 w ciemnym.
- `pnpm lint` i `pnpm typecheck` na scalonym drzewie — exit 0.
- CI PR #54 (pierwszy przebieg): job `storybook` pass (1m2s); `e2e` fail (kontrast) — poprawione; drugi przebieg (run 44897732946): wszystkie joby pass, w tym `e2e` i `storybook`.
- e2e lokalnie niesprawdzone (brak Dockera); `actionlint` niedostępny.

## Problemy i otwarte kwestie
- Gałąź zawiera dwa commity „cezar autosave” z etapu 1.

## Wnioski
Dodano wpis 2026-11-21 w `.ai/lessons.md` (`--primary` jako kolor tekstu po etapie 1).
