---
title: Wdrożenie spec stacku i standardów — faza F0 i dokumenty procesu
date: 2026-10-21
agent: Claude Code (Opus 5.5) przez cezar, tryb dispatch
status: partial
spec: .ai/specs/implemented/2026-10-21-f0-szkielet-i-harness.md
branch: cez/5b47eecb
---

# Wdrożenie spec stacku i standardów — faza F0 i dokumenty procesu

## Zadanie
„Wdróż specyfikację standardów inżynieryjnych” (`.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`). Zakres przebiegu: F0 (szkielet + harness) oraz dokumenty procesu z kryteriów akceptacji; F1–F8 wymagają osobnych spec i odpowiedzi na Q3–Q12.

## Przebieg
- 09:00 — Przeczytane `.ai/lessons.md`, spec stacku. Środowisko: Node 25.4, npm 11.7, corepack 0.32 (pnpm przez corepack), sieć OK, Docker daemon niedostępny.
- 09:05 — Utworzona spec F0 (obecnie `.ai/specs/implemented/2026-10-21-f0-szkielet-i-harness.md`), przyjęte rekomendacje Q1/Q2/Q8. Podział na dwa zadania cezar: A (kod), B (dokumenty).
- 09:10 — Dispatch: A kod (6f7b7de5, opus; pierwsza próba padła na limicie wydatków, ponowiona przez właściciela), B dokumenty (ae621dfa, sonnet).
- 09:20 — Oba raporty done. Merge B (c9829a5), A (1ab2cf1). Pełna weryfikacja: e2e padały — Playwright reużywał obcy serwer na porcie 3100 i web nie startował bez `DATABASE_URL`. Naprawa u przyczyny (45e9f99).
- 09:25 — Review (516f417a, sonnet): approve, 4 uwagi nieblokujące. Wdrożone: ORM za kontenerem DI, rozszerzona czystość domeny. Odłożone: waluta w `money` (komentarz w kodzie), CI z Dockerem.
- Pytania Guard dzieci (push/PR) bez znaczenia — merge lokalny; nic nie zostało wypchnięte.

## Wynik
- F0 część A: monorepo pnpm 11 + Turborepo, `apps/web` (Next.js 16, next-intl, oRPC `/api/health`), `apps/worker` (pg-boss, cron, `/health`, SIGTERM), `packages/{core,contracts,testing,ui,config}`, migracja inicjalna, moduł wzorcowy `scheduling` (szkielet + `canCancelFree`), ESLint boundaries + dependency-cruiser + Knip, Vitest, Testcontainers, Playwright, docker-compose, CI, Renovate, lefthook. Szczegóły: `.ai/runs/2026-10-21-f0-szkielet-kod.md`.
- F0 część B: ADR 0001–0005 + indeks (`docs/decisions/`), `CODE_REVIEW.md`, `SDLC.md`, `BACKWARD_COMPATIBILITY.md`, `.ai/agentic.config.json`, rozszerzony `AGENTS.md`. Szczegóły: `.ai/runs/2026-10-21-f0-dokumenty-procesu.md`.
- Spec F0 → `implemented/`. Spec stacku zostaje `in-progress` (F1–F8 i Q3–Q12 otwarte).

## Weryfikacja
- `pnpm install --frozen-lockfile` OK; `pnpm lint` (ESLint, Biome, dependency-cruiser „no dependency violations”, Knip) OK; `pnpm typecheck` 6/6; `pnpm test` 4/4 pakietów (31 testów); `pnpm build` OK; `E2E_PORT=3197 pnpm test:e2e` 4 passed (360 i 1280 px).
- `pnpm test:integration` — pominięte (brak Dockera), komunikat czytelny.
- Mockupy: `npm run typecheck && npm run build` OK.
- Próby lint: `Date.now()`, destrukturyzacja `Temporal.Now`, `performance.now()`, `crypto.randomUUID()` w `domain/` → błędy; głęboki import z `apps/web` → błąd boundaries z instrukcją naprawy.

## Problemy i otwarte kwestie
- Niezweryfikowane: `docker compose up`, `db:migrate`, `db:seed`, testy integracyjne, worker na prawdziwym Postgresie, workflow CI (nie uruchomiony — brak zdalnego przebiegu).
- Preview deploy (Cloud Run + Neon) — wyłączony szkic, wymaga kont/sekretów.
- Do decyzji właściciela: okres wygaszania 6 mies. w `BACKWARD_COMPATIBILITY.md`; Q3–Q7, Q9–Q12 spec stacku.
- Gałąź `cez/5b47eecb` nie wypchnięta; PR do `main` do otwarcia po akceptacji.

## Wnioski
- Dopisane do `.ai/lessons.md`: pnpm przez corepack i `allowBuilds`, commity „cezar autosave”, `env` w turbo.json, Playwright `reuseExistingServer`, eslint-plugin-boundaries (katalogi vs pliki), dependency-cruiser na Node 25, pino `*.message`, podział `test`/`test:integration`.
