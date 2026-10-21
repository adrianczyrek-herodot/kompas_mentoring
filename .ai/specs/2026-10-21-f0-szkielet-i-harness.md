---
title: F0 — szkielet monorepo i harness dla agentów
status: in-progress      # draft | approved | in-progress | implemented | archived
created: 2026-10-21
implemented:
related:
  - .ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md
  - .ai/runs/2026-10-21-wdrozenie-standardow-f0.md
---

# F0 — szkielet monorepo i harness dla agentów

## Kontekst i cel

Pierwsza faza planu z `.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md` (dalej: „spec stacku”). Cel: pusty, ale kompletny szkielet, na którym kolejne fazy (F1–F8) budują funkcje bez dyskusji o narzędziach — z „czujnikami” (typy, lint, granice modułów, testy), które dają agentom szybki feedback.

## Zakres

- W zakresie:
  - Część A (kod): monorepo pnpm + Turborepo, `apps/web` (Next.js 16), `apps/worker` (pg-boss), `packages/core` (prymitywy `shared/domain`: Money, Clock, Result, typy ID; kontener Awilix; logger pino; konfiguracja env przez zod; MikroORM 7 + pierwsza migracja; szkielet modułu `scheduling` zgodny z §2.4), `packages/contracts` (oRPC + zod, kontrakt `health`), `packages/testing` (FakeClock, fake'i), `packages/config` (tsconfig, ESLint, Biome, Vitest presets), `docker-compose.yml` (Postgres 17 + `btree_gist`, `unaccent`, `pg_trgm`), `/api/health`, testy jednostkowe prymitywów, testy architektury (boundaries + dependency-cruiser), test integracyjny z Testcontainers, smoke e2e Playwright, CI w GitHub Actions (lint, typecheck, test, build, e2e smoke), lefthook + commitlint, Renovate, Knip.
  - Część B (dokumenty): ADR 0001–0005 (MADR 4.0) w `docs/decisions/`, `CODE_REVIEW.md`, `SDLC.md`, `BACKWARD_COMPATIBILITY.md`, `.ai/agentic.config.json`, uzupełnienie `AGENTS.md` (słownik domeny §6.2, reguły modułów §2.4, komendy weryfikacji).
- Poza zakresem: wdrożenie na Cloud Run / Neon (wymaga kont i sekretów — tylko szkic kroków w CI, wyłączony), Sentry z prawdziwym DSN (integracja warunkowa, bez DSN nieaktywna), Better Auth i wszystkie funkcje F1+, hooki Claude Code (osobne zadanie po F0).

## Wymagania

1. `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build` przechodzi na czystym repo.
2. Wersje zależności przypięte dokładnie (bez `^`/`~`); `engines.node` `>=24`; `packageManager` z pnpm.
3. `tsconfig.base.json` z flagami §6.1 spec stacku; rozszerzenia per środowisko (bundler dla web/ui, nodenext dla core/worker).
4. ESLint flat config: `strict-type-checked`, reguły z §6.1 (m.in. zakaz `Date.now()`/`new Date()`/`Math.random()` w `domain/**`, zakaz `console.*`), `eslint-plugin-boundaries` z regułami §2.4 i komunikatami „jak naprawić”.
5. `dependency-cruiser`: zakaz cykli i importów spoza `index.ts` innego modułu.
6. Prymitywy w `packages/core/src/shared/domain`: `Money` (bigint, grosze, PLN, Dinero 2 przy alokacji), `Clock` (`SystemClock`, `FakeClock` w `packages/testing`), `Result` (neverthrow), typy markowane ID (zod `.brand()`), UUID v7.
7. `/api/health` (oRPC w route handlerze Next.js) zwraca status aplikacji i bazy; worker ma endpoint `/health` i obsługę SIGTERM.
8. pg-boss: `web` tylko wysyła (`supervise: false`, `schedule: false`), `worker` pobiera zadania i cron.
9. Pierwsza migracja MikroORM tworzy schematy modułów i rozszerzenia; `pnpm db:migrate`, `pnpm db:seed` (seed: minimalny, z danych mockupów — może być pusty szkielet z TODO dla F2).
10. Moduł `scheduling` ma szkielet katalogów z §2.4, `AGENTS.md` modułu i przykładową czystą politykę `canCancelFree` z testem (wzorzec dla kolejnych).
11. Teksty UI w `apps/web/messages/pl.json` (next-intl).
12. CI: GitHub Actions, akcje przypięte po SHA, `permissions: {}` domyślnie, `pnpm install --frozen-lockfile`.

## Kryteria akceptacji

- [ ] Wymaganie 1 spełnione lokalnie (wynik komend w runie).
- [ ] Naruszenie granicy modułu (np. import `modules/scheduling/domain` z `apps/web`) daje błąd ESLint z komunikatem naprawy — sprawdzone testem lub ręcznie i zapisane w runie.
- [ ] `new Date()` w `domain/**` daje błąd ESLint.
- [ ] Testy jednostkowe Money/Clock/Result/ID i `canCancelFree` zielone.
- [ ] Test integracyjny z Testcontainers istnieje i jest pomijany z czytelnym komunikatem, gdy Docker niedostępny (w CI uruchamiany).
- [ ] Smoke e2e Playwright: strona główna i `/api/health`.
- [ ] Dokumenty z części B utworzone; `AGENTS.md` zawiera słownik, reguły modułów i komendy weryfikacji.
- [ ] Mockupy (`kompas-mentoring/mockupy`) nadal przechodzą `npm run typecheck && npm run build`.

## Projekt rozwiązania

Struktura repozytorium zgodnie z §2.2 spec stacku. Mockupy zostają osobnym pakietem npm poza workspace pnpm (`pnpm-workspace.yaml`: tylko `apps/*`, `packages/*`).

## Plan wdrożenia

1. Część A i część B realizowane równolegle przez dwa zadania cezar o rozłącznym zakresie plików (A: wszystko poza `docs/`, `*.md` w katalogu głównym i `.ai/agentic.config.json`; B: tylko te pliki).
2. Przegląd części A przez niezależne zadanie typu review.
3. Scalenie, weryfikacja całości, zamknięcie spec i runu.

## Decyzje i zmiany

- 2026-10-21 — Na potrzeby F0 przyjęte rekomendacje spec stacku dla Q1 (MikroORM 7 + Awilix), Q2 (bez Open Mercato jako frameworka) i Q8 (Frankfurt) — polecenie wdrożenia spec stacku od właściciela. Pozostałe pytania (Q3–Q7, Q9–Q12) nie dotyczą F0 i pozostają otwarte.
- 2026-10-21 — Docker niedostępny na maszynie wykonującej przebieg: testy integracyjne Testcontainers muszą się pomijać lokalnie bez Dockera, a uruchamiać w CI.
- 2026-10-21 — Wersje inne niż w spec stacku: pnpm 11.28.6 (pnpm 12 wymaga corepack ≥ 0.36), TypeScript 6.0.3 (typescript-eslint wymaga TS < 6.1); turbo 2.11.9, typescript-eslint 8.71.2, dependency-cruiser 18.6.0, knip 6.41.0, commitlint 21.2.3 — nowsze wydania miały < 3 dni (`minimumReleaseAge`).
- 2026-10-21 — Rozmieszczenie: `SystemClock` w `shared/infrastructure` (lint domeny zabrania `Temporal.Now`); funkcje `Money` jako przestrzeń nazw `money`; migracja inicjalna w `shared/infrastructure/db/migrations`; lefthook instalowany przez `pnpm hooks:install` (bez `prepare`); `pnpm test` = jednostkowe, `pnpm test:integration` osobno.
- 2026-10-21 — Playwright: port przez `E2E_PORT`, reuse serwera tylko przy `E2E_REUSE_SERVER=1`, domyślny `DATABASE_URL` z docker-compose (po wykryciu, że lokalnie testy trafiały w obcy serwer na porcie 3100).
- 2026-10-21 — `BACKWARD_COMPATIBILITY.md`: okres wygaszania 6 mies. to propozycja spoza spec stacku — do potwierdzenia przez właściciela. Blok `humanReview` w `.ai/agentic.config.json` to nasze rozszerzenie (skille go nie egzekwują) — egzekwowanie przez CODEOWNERS / ochronę gałęzi po założeniu repo w GitHub.
