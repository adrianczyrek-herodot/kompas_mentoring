---
title: Szkielet monorepo DevMentor (Next.js, MikroORM, Awilix, Tailwind, shadcn/ui)
status: implemented
created: 2026-10-20
implemented: 2026-10-20
related: [.ai/runs/2026-10-20-monorepo-devmentor.md]
---

# Szkielet monorepo DevMentor (Next.js, MikroORM, Awilix, Tailwind, shadcn/ui)

## Kontekst i cel
Budujemy aplikację „DevMentor” — portal mentoringu 1:1 (koncepcja i mockupy w `kompas-mentoring/`). Potrzebny jest działający szkielet monorepo z ustalonym stosem i jasnymi granicami pakietów, a agenci kodujący muszą znać i stosować te założenia.

## Zakres
- W zakresie: monorepo (npm workspaces) z pakietami `packages/app`, `packages/core`, `packages/db`, `packages/ui`; minimalny, budujący się kod w każdym pakiecie; zasady w `AGENTS.md`; opis architektury w `README.md` (korzeń repo).
- Poza zakresem: funkcje domenowe (wyszukiwarka, rezerwacje, płatności), uwierzytelnianie, CI, obraz Docker aplikacji, migracja mockupów do Next.js.

## Wymagania
1. Stos: najnowsze stabilne Next.js (App Router), React, TypeScript; PostgreSQL + MikroORM (migracje, pula połączeń); Awilix jako kontener DI; Tailwind CSS dla stron frontendowych (publicznych); shadcn/ui dla stron backendowych (panel `/admin`).
2. Pakiety i kierunek zależności: `core` ← `db` ← `app`, `ui` ← `app`. `core` nie zależy od żadnego innego pakietu; `ui` nie zależy od `db`; `db` nie zależy od React/Next.
3. `app` jest jedynym composition rootem kontenera Awilix; pozostałe pakiety eksportują klasy/fabryki i funkcje rejestrujące, nie tworzą globalnych kontenerów.
4. Encje MikroORM definiowane przez `defineEntity` (bez dekoratorów i `reflect-metadata`), konfiguracja wspólna dla aplikacji i CLI migracji.
5. Pakiety wewnętrzne konsumowane jako źródła TS (`transpilePackages`), bez osobnego kroku budowania.
6. Polecenia w korzeniu: `npm run dev`, `npm run build`, `npm run typecheck`, `npm run db:migration:create`, `npm run db:migration:up`.

## Kryteria akceptacji
- [x] `npm install` w korzeniu instaluje wszystkie pakiety.
- [x] `npm run typecheck` przechodzi dla wszystkich pakietów.
- [x] `npm run build` buduje aplikację Next.js bez połączenia z bazą.
- [x] Strona `/` używa Tailwinda i komponentów `@devmentor/ui/frontend`, strona `/admin` — komponentów shadcn z `@devmentor/ui/backend`.
- [x] `/api/health` rozwiązuje zależności z kontenera Awilix i sprawdza połączenie z bazą (503 bez bazy).
- [x] `AGENTS.md` zawiera założenia stosu i architektury; `README.md` opisuje architekturę.

## Projekt rozwiązania
- Korzeń: `package.json` (workspaces `packages/*`), `tsconfig.base.json`, `.env.example` (`DATABASE_URL`), `.gitignore` (node_modules, .next, .env).
- `packages/core` (`@devmentor/core`): `di.ts` (tworzenie kontenera Awilix w trybie strict/PROXY, typ `Cradle` rozszerzany przez pakiety), `clock.ts` (`Clock`, `SystemClock`), `errors.ts` (`DomainError`).
- `packages/db` (`@devmentor/db`): `config.ts` (`defineConfig` z `@mikro-orm/postgresql`, pula, migracje), `entities/` (przykładowa encja `User`), `migrations/`, `orm.ts` (leniwy singleton ORM odporny na HMR), `register.ts` (`registerDb(container)`: `orm` singleton, `em` scoped jako `orm.em.fork()`), `health.ts` (`DbHealthCheck`). `mikro-orm.config.ts` dla CLI.
- `packages/ui` (`@devmentor/ui`): `lib/utils.ts` (`cn`), `frontend/` (komponenty Tailwind dla stron publicznych), `backend/` (komponenty shadcn/ui, `components.json`), `styles/globals.css` (Tailwind v4 + motyw shadcn).
- `packages/app` (`@devmentor/app`): Next.js App Router w `src/app`; grupy tras `(frontend)` i `(backend)/admin`; `src/server/container.ts` (composition root, `server-only`); `api/health/route.ts`.

## Plan wdrożenia
1. Korzeń monorepo i `tsconfig.base.json`.
2. `core`, `db`, `ui`, `app` z minimalnym kodem.
3. `npm install`, typecheck, build, uruchomienie dev i sprawdzenie `/`, `/admin`, `/api/health`.
4. `AGENTS.md`, `CLAUDE.md` (skrót), `README.md`.

## Decyzje i zmiany
- 2026-10-20 — npm workspaces zamiast pnpm/turborepo: pnpm nie jest zainstalowany w środowisku, a npm wystarcza dla czterech pakietów; do ponownej oceny przy wzroście repo.
- 2026-10-20 — Specyfikacja realizowana od razu (bez etapu `draft`): wymagania pochodzą wprost z polecenia użytkownika.
- 2026-10-20 — Dodano `compose.yaml` (PostgreSQL 18 do pracy lokalnej) — potrzebny do weryfikacji migracji i health checku; port konfigurowalny przez `POSTGRES_PORT`.
- 2026-10-20 — Jeden `.env` w korzeniu: ładowany przez `process.loadEnvFile` w `next.config.ts` i `mikro-orm.config.ts` (Next.js sam czyta tylko `.env` z katalogu `packages/app`).
- 2026-10-20 — `DbHealthCheck.check()` wykonuje `select 1` zamiast `orm.checkConnection()`, bo MikroORM 7 łączy się leniwie.
- 2026-10-20 — Komponenty shadcn (`Button`, `Card`) napisane według aktualnego kodu shadcn (styl new-york, `radix-ui`), bez uruchamiania `shadcn init`; `components.json` w `packages/ui` pozwala dodawać kolejne przez CLI.
