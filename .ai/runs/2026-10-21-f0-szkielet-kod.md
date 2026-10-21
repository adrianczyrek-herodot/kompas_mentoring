---
title: F0 część A — szkielet monorepo i harness (kod)
date: 2026-10-21
agent: Claude Code (Opus 5.5) przez cezar, zadanie dispatch 6f7b7de5
status: done
spec: .ai/specs/2026-10-21-f0-szkielet-i-harness.md
branch: cez/6f7b7de5
---

# F0 część A — szkielet monorepo i harness (kod)

## Zadanie
Zaimplementować część A (kod) fazy F0 wg spec F0 i spec stacku: monorepo pnpm + Turborepo, `apps/web`, `apps/worker`, `packages/core|contracts|testing|ui|config`, harness (ESLint + boundaries, dependency-cruiser, Knip, Vitest, Playwright), docker-compose, CI, Renovate, lefthook + commitlint.

## Przebieg
- 09:10 — Przeczytane AGENTS.md, `.ai/lessons.md`, spec F0 i spec stacku. Środowisko: Node 25.4, corepack 0.32, Docker daemon niedostępny.
- 09:15 — Wersje z `npm view` (+ daty publikacji). Pakiety młodsze niż 3 dni zastąpione poprzednimi wydaniami (zgodnie z `minimumReleaseAge`).
- 09:20 — pnpm 12.14 nie działa z corepack 0.32 (inny układ paczki) → pnpm **11.28.6**. pnpm 11 przerywa instalację przy nieobsłużonych skryptach instalacyjnych → jawna lista `allowBuilds: false`.
- 09:30 — `packages/config`: tsconfig (base/bundler/nodenext), ESLint flat config, Biome, preset Vitest. Pakiety źródłowe (bez kroku build): importy z rozszerzeniem `.ts`, `erasableSyntaxOnly`, worker i skrypty DB działają natywnie w Node (type stripping).
- 09:45 — `packages/core` (prymitywy, infrastruktura, kontener, moduł `scheduling`), `contracts`, `testing`, `ui`, `apps/web`, `apps/worker`.
- 10:00 — typecheck, testy, build, smoke `/api/health` i Playwright zielone.
- 10:10 — eslint-plugin-boundaries 7: elementy to katalogi (wzorce plików nie działają) → `index.ts`/`di.ts`/wejście core jako kategorie plików; komunikat polityki pojawia się tylko, gdy decyduje jej `disallow` → wzorzec „strefa”: `disallow` wszystko z komunikatem naprawy, potem `allow` wyjątki.
- 10:15 — dependency-cruiser 18 CLI odmawia pracy na Node 25 (nieparzysta wersja) → uruchamiany przez API (`scripts/check-dependencies.mjs`). Wykrył cykl typów `booking.state ↔ booking.errors` — naprawiony.
- 10:25 — Biome: `useLiteralKeys` wyłączone (konflikt z `noPropertyAccessFromIndexSignature`), dyrektywy Tailwind w parserze CSS.
- 10:30 — Redakcja pino `*.message` ukrywała `err.message` → redakcja treści wiadomości tylko na najwyższym poziomie + test.
- 11:00 — Push `cez/6f7b7de5` odrzucony: token `gh` bez zakresu `workflow` (blokuje `.github/workflows/ci.yml`), brak klucza SSH. PR otwarty z gałęzi `feat/f0-szkielet-harness` bez pliku CI; `ci.yml` czeka w commicie `8bc1fcb` na lokalnej gałęzi `cez/6f7b7de5`.
- 10:35 — cezar zrobił w trakcie commit „cezar autosave”; cofnięty `git reset --soft` (gałąź lokalna) i zastąpiony logicznymi commitami.

## Wynik
Commity (Conventional Commits):
- `b2a7f92` build: scaffold pnpm workspace with Turborepo and local Postgres 17
- `a3c3104` build(config): add shared tsconfig, ESLint, Biome and Vitest presets
- `22ef14a` feat(core): add shared domain primitives, DI container and platform services
- `3e2156b` feat(scheduling): add module skeleton with canCancelFree policy
- `7db24a2` feat(web): add Next.js 16 app with next-intl and oRPC health endpoint
- `724a384` feat(worker): add pg-boss worker with cron, /health and graceful SIGTERM
- `8bc1fcb` ci: add GitHub Actions pipeline, Renovate, lefthook and commitlint

Najważniejsze pliki: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `packages/config/eslint/{index,boundaries}.js`, `packages/core/src/{container.ts,index.ts,shared/**,modules/scheduling/**}`, `packages/core/src/shared/infrastructure/db/migrations/Migration20261021000000Init.ts`, `apps/web/app/api/[...rest]/route.ts`, `apps/worker/src/main.ts`, `.github/workflows/ci.yml`, `renovate.json`, `docker-compose.yml`.

Wersje (przypięte dokładnie): Next 16.4.2, React 19.3.1, next-intl 4.14.9, Tailwind 4.3.3, oRPC 1.15.7, zod 4.6.7, pg-boss 12.38.0, MikroORM 7.2.5, Awilix 13.0.5, pino 10.4.0, neverthrow 8.2.0, dinero.js 2.0.2, uuid 14.0.3, temporal-polyfill 1.0.6, TypeScript 6.0.3, ESLint 10.13.0, typescript-eslint 8.71.2, eslint-plugin-boundaries 7.2.0, Biome 2.5.15, Vitest 5.0.5, Testcontainers 12.2.1, Playwright 1.64.1, dependency-cruiser 18.6.0, Knip 6.41.0, Turborepo 2.11.9, lefthook 2.2.2, commitlint 21.2.3, pnpm 11.28.6.

Odstępstwa od specyfikacji / polecenia:
- pnpm 11.28.6 zamiast najnowszego 12.14 (corepack 0.32 z Node 25 nie uruchamia pnpm 12); spełnia „pnpm ≥ 11”.
- TypeScript 6.0.3 (spec: TS 6); TS 7.0.2 istnieje, ale typescript-eslint 8.71 wymaga `typescript <6.1`.
- Turborepo 2.11.9, typescript-eslint 8.71.2, dependency-cruiser 18.6.0, Knip 6.41.0, commitlint 21.2.3 — najnowsze wydania były młodsze niż 3 dni (`minimumReleaseAge` w `pnpm-workspace.yaml`).
- `SystemClock` w `shared/infrastructure/`, nie w `shared/domain/` (w domain jest tylko interfejs `Clock`), bo reguła lint zakazuje w `domain/**` odczytu czasu systemowego (także `Temporal.Now`).
- Funkcje `Money` eksportowane jako przestrzeń `money` (`money.of`, `money.add`, `money.allocate`) — nazwa `Money` jest zajęta przez typ.
- Pierwsza migracja (schematy + rozszerzenia) leży w `packages/core/src/shared/infrastructure/db/migrations/`, bo dotyczy wszystkich modułów; migracje modułów będą w `modules/<x>/migrations/` i dopisywane do `migrationsList` w `db/orm.ts`.
- `dependency-cruiser` uruchamiany przez API (`pnpm lint:deps`), bo CLI odrzuca Node 25.
- `lefthook` instalowany jawnie `pnpm hooks:install` (bez `prepare`), żeby `pnpm install` w worktree nie zmieniał hooków współdzielonego repo.
- `output: 'standalone'` w Next tylko przy `NEXT_OUTPUT=standalone` (obraz Dockera), bo `next start` (Playwright) z nim nie działa.
- `pnpm test` = testy jednostkowe; integracyjne osobno `pnpm test:integration` (osobny job w CI).

## Weryfikacja
Na czystym drzewie (po commitach):
```
$ pnpm install --frozen-lockfile        → Done in 312ms using pnpm v11.28.6
$ pnpm lint                              → eslint OK; biome: Checked 96 files, No fixes applied;
                                           ✔ no dependency violations found (72 modules, 89 dependencies cruised); knip: brak uwag
$ pnpm typecheck                         → Tasks: 6 successful, 6 total
$ pnpm test                              → Tasks: 4 successful (core 26 testów, contracts 1, testing 2, worker 2)
$ pnpm build                             → Tasks: 1 successful; route ƒ /api/[...rest]
$ pnpm test:integration                  → [integration] SKIPPED: Docker is not available — start Docker (or set DOCKER_HOST)…; 2 skipped
$ DATABASE_URL=… pnpm test:e2e           → 4 passed (home + /api/health × 360 px i 1280 px)
$ cd kompas-mentoring/mockupy && npm run typecheck && npm run build → OK, dist/app.js 161.3kb (bez zmian w gicie)
$ pnpm exec commitlint --from 34995a4 --to HEAD → OK; lefthook validate → All good
```
`/api/health` bez bazy: `200 {"status":"degraded","app":"ok","db":"down",…}`; nieznana trasa `/api/nope` → 404. `pnpm db:migrate` i worker startują natywnie w Node i kończą się czytelnym błędem `ECONNREFUSED` (brak Postgresa).

Próby naruszeń (pliki próbne usunięte po sprawdzeniu):
- `apps/web/server/violation-probe.ts` z `import … from '../../../packages/core/src/modules/scheduling/domain/policies/can-cancel-free.policy.ts'` →
  `boundaries/dependencies`: „Apps may import only @kompas/core, module public APIs (@kompas/core/<module> = modules/<module>/index.ts), @kompas/contracts and @kompas/ui (spec §2.4 rule 4). This import reaches "module-layer" internals (policies/can-cancel-free.policy.ts). Fix: export the command, query or type you need from modules/<module>/index.ts and import it via @kompas/core/<module>…” + `no-restricted-imports` „Deep imports into packages/core are forbidden … Fix: import from "@kompas/core" or "@kompas/core/<module>"…”. To samo dla `@kompas/core/src/modules/scheduling/domain/booking.state.ts`.
- `domain/violation-probe.ts` z `new Date()` / `Date.now()` → `no-restricted-syntax`: „new Date() is banned in domain/** (spec §4.1). Fix: accept `now: Temporal.Instant` as a parameter, or inject Clock in application/”; import loggera w domain → „domain/ of module "scheduling" may import only its own domain/ and … shared/domain (spec §2.4 rule 1)… Fix: …”.
- `modules/catalog/application/probe.ts` z importem `../../scheduling/domain/booking.state.ts` → „Module "catalog" must not reach into module "scheduling" internals (spec §2.4 rule 3). Fix: import from modules/scheduling/index.ts…”; import `@kompas/testing` → „Production code must not import tests or @kompas/testing…”. Import przez `scheduling/index.ts` — bez błędu.

Kryteria akceptacji spec F0 (część A):
- [x] Wymaganie 1 spełnione lokalnie (wyniki wyżej).
- [x] Naruszenie granicy modułu daje błąd ESLint z komunikatem naprawy (ręcznie, wyżej).
- [x] `new Date()` w `domain/**` daje błąd ESLint.
- [x] Testy jednostkowe Money/Clock/Result/ID i `canCancelFree` zielone (+ maszyna stanów, kontener, logger, env, pg-boss, health workera).
- [x] Test integracyjny Testcontainers istnieje i jest pomijany z czytelnym komunikatem bez Dockera; w CI (`CI=true`) brak Dockera = błąd, nie pominięcie.
- [x] Smoke e2e Playwright: strona główna i `/api/health`.
- [ ] Dokumenty z części B — poza zakresem tego zadania (zadanie równoległe).
- [x] Mockupy nadal przechodzą `npm run typecheck && npm run build`.

## Problemy i otwarte kwestie
- **CI nie jest w PR:** `.github/workflows/ci.yml` (commit `8bc1fcb` na `cez/6f7b7de5`) wymaga pushu tokenem z zakresem `workflow`: `gh auth refresh -h github.com -s workflow`, potem `git checkout 8bc1fcb -- .github/workflows/ci.yml` na gałęzi PR, commit i push.
- **Nie zweryfikowano lokalnie (brak Dockera):** test integracyjny Testcontainers (migracja na Postgres 17), `docker compose up -d && pnpm db:migrate && pnpm db:seed`, worker z prawdziwą kolejką (cron, SIGTERM w trakcie zadania), `/api/health` z `db: up`. Wszystko to uruchamia CI (joby `integration`, `e2e` z usługą Postgres).
- Workflow CI i `renovate.json` nie zostały uruchomione (brak `actionlint` / walidatora Renovate lokalnie); YAML sparsowany poprawnie.
- `pnpm db:seed` to szkielet z TODO dla F2 (tylko sprawdza połączenie).
- Hooki git wymagają jednorazowego `pnpm hooks:install`.
- Dla spec F0 warto dopisać w „Decyzje i zmiany” odstępstwa wymienione w „Wynik” (plik spec poza zakresem tego zadania).

## Wnioski
Propozycje lekcji przekazane w raporcie do zadania nadrzędnego (`--suggestions`), bez edycji `.ai/lessons.md` (poza zakresem zadania).
