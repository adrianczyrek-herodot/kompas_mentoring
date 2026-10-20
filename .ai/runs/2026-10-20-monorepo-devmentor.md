---
title: Szkielet monorepo DevMentor, zasady w AGENTS.md i opis architektury w README.md
date: 2026-10-20
agent: Claude Code (claude-opus-5-5) przez cezar
status: done
spec: .ai/specs/implemented/2026-10-20-monorepo-devmentor.md
branch: cez/d24e11ee
---

# Szkielet monorepo DevMentor, zasady w AGENTS.md i opis architektury w README.md

## Zadanie
Aplikacja „DevMentor”: najnowszy Next.js + TypeScript + React, PostgreSQL z MikroORM, Awilix (DI), Tailwind (strony frontendowe), shadcn/ui (strony backendowe/panel). Monorepo z pakietami `packages/{app,core,db,ui}`. Zapisać założenia w `AGENTS.md` i opisać architekturę w `README.md`.

## Przebieg
- Przeczytano `.ai/lessons.md`. W repo brak głównego `README.md` (jest tylko `kompas-mentoring/README.md`) — tworzę nowy w korzeniu.
- Najnowsze wersje z npm: next 16.4.2, react 19.3.1, typescript 7.0.2, @mikro-orm/* 7.2.5, awilix 13.0.5, tailwindcss 4.3.3, shadcn 4.22.1. pnpm niedostępny → npm workspaces.
- Spec `.ai/specs/2026-10-20-monorepo-devmentor.md` utworzona przed kodem; wymagania wprost z polecenia, więc bez etapu `draft`.
- Pakiety `core`, `db`, `ui`, `app` z minimalnym kodem; typecheck i `next build` zielone od pierwszego podejścia (TS 7 działa z Next 16).
- `/api/health` zwracał 503 mimo działającej bazy — MikroORM 7 łączy się leniwie, `checkConnection()` przed pierwszym zapytaniem mówi „Connection not established”. Zmieniono na `select 1`.
- Dodano `compose.yaml` i ładowanie jednego `.env` z korzenia (Next.js czyta `.env` tylko z `packages/app`).
- Dokumentacja: sekcja stosu i architektury w `AGENTS.md`, skrót w `CLAUDE.md`, nowy `README.md` w korzeniu.

## Wynik
- Korzeń: `package.json` (workspaces + skrypty), `package-lock.json`, `tsconfig.base.json`, `.env.example`, `compose.yaml`, `.gitignore`.
- `packages/core` — `createContainer()` (Awilix PROXY + strict), `Cradle`, `Clock`/`SystemClock`, `DomainError`.
- `packages/db` — `createOrmConfig()`, encja `User` (`defineEntity`), `getOrm()`, `registerDb()`, `DbHealthCheck`, CLI `mikro-orm.config.ts`, migracja początkowa `Migration20261020151022` + snapshot.
- `packages/ui` — `cn()`, `frontend/{container,hero}`, `backend/{button,card}` (shadcn), `styles/globals.css` (Tailwind v4 + motyw), `components.json`.
- `packages/app` — Next.js: `(frontend)/` strona główna, `(backend)/admin/` panel, `api/health`, `src/server/container.ts` (composition root).
- `AGENTS.md`, `CLAUDE.md`, `README.md`, `.ai/lessons.md`, spec przeniesiona do `implemented/`.

## Weryfikacja
- `npm run typecheck` — 4 pakiety bez błędów.
- `npm run build` — Next.js 16.4.2 (Turbopack): `/`, `/admin` statyczne, `/api/health` dynamiczne; bez połączenia z bazą.
- PostgreSQL 18 z `compose.yaml` (port 55432, tymczasowo): `npm run db:migration:create -- --initial` wygenerował tabelę `users`, `npm run db:migration:up` zastosował migrację.
- `next start`: `/` 200, `/admin` 200 (w HTML `data-slot="card"`, w CSS `bg-indigo-600`, `.bg-card`), `/api/health` 200 z bazą → 503 po zatrzymaniu bazy → 200 po ponownym starcie (bez restartu aplikacji).
- `next dev`: `/`, `/admin`, `/api/health` — 200, bez błędów w logu.
- Nie sprawdzono wizualnie w przeglądarce (brak narzędzia przeglądarki w przebiegu headless) — tylko HTTP i zawartość HTML/CSS.
- Kontener i wolumen testowej bazy usunięte (`docker compose down -v`).

## Problemy i otwarte kwestie
- `npm audit`: 4 podatności high — `braces` (GHSA-vfj7-8cjw-p6xm, DoS przy głęboko zagnieżdżonych wzorcach glob) przez `micromatch` → `fast-glob` → `awilix`. Proponowany `npm audit fix --force` łamie zależności — nie stosowano. Ryzyko niskie (glob tylko w `loadModules` Awilixa, którego nie używamy); do śledzenia aktualizacji `awilix`.
- Brak lintera/formattera (ESLint/Biome, Prettier) i testów — do decyzji w kolejnej specyfikacji; reguły kierunku zależności są na razie tylko w `AGENTS.md` (można je wymusić np. `eslint-plugin-boundaries` lub dependency-cruiser).

## Wnioski
- `.ai/lessons.md` → „Kod i mockupy”: leniwe łączenie MikroORM 7; TS 7 + Next 16 i augmentacja `Cradle`; `packages/app/AGENTS.md` generowany przez `next dev` (zacommitowany, opisany w `AGENTS.md`).
