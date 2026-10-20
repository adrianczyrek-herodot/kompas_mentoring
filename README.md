# DevMentor

Portal mentoringu 1:1 dla programistów. Koncepcja produktu i przepływy: [`kompas-mentoring/`](kompas-mentoring/README.md). Aplikacja powstaje z klikalnego mockupu Kompas, przenoszonego do monorepo fazami — plan: [`.ai/specs/2026-10-20-migracja-mockupu-do-monorepo.md`](.ai/specs/2026-10-20-migracja-mockupu-do-monorepo.md).

## Stos

- **Next.js** (App Router, Turbopack), **React**, **TypeScript** (`strict`) — najnowsze stabilne wersje
- **PostgreSQL** + **MikroORM** — encje, migracje, pula połączeń
- **Awilix** — kontener Dependency Injection
- **Tailwind CSS** — strony frontendowe (publiczne)
- **shadcn/ui** — strony backendowe (panel `/admin`)
- **npm workspaces** — monorepo

## Szybki start

Wymagania: Node.js 22+, Docker (lokalna baza).

```bash
npm install
cp .env.example .env
docker compose up -d          # PostgreSQL na localhost:5432 (inny port: POSTGRES_PORT=5433 + DATABASE_URL w .env)
npm run db:migration:up
npm run dev                   # http://localhost:3000
```

| Polecenie | Co robi |
|---|---|
| `npm run dev` / `build` / `start` | Aplikacja Next.js (`@devmentor/app`) |
| `npm run typecheck` | `tsc` we wszystkich pakietach |
| `npm run db:migration:create` | Nowa migracja z różnicy encji i snapshotu schematu |
| `npm run db:migration:up` / `db:migration:down` | Zastosowanie / cofnięcie migracji |

Adresy: `/` — aplikacja (mockup Kompas, ekrany pod hashem, np. `/#/mentorzy`; dane demo, bez bazy), `/admin` — panel, `/api/health` — stan aplikacji i bazy (200 / 503).

## Architektura

### Monorepo

```
.
├── packages/
│   ├── app/    @devmentor/app   aplikacja Next.js, composition root DI
│   ├── core/   @devmentor/core  części wielokrotnego użytku (DI, domena: typy i reguły)
│   ├── db/     @devmentor/db    MikroORM: konfiguracja, encje, migracje; dane demo
│   └── ui/     @devmentor/ui    komponenty UI: Tailwind i shadcn/ui
├── kompas-mentoring/            koncepcja produktu (KONCEPCJA.md)
├── compose.yaml                 lokalny PostgreSQL
├── tsconfig.base.json           wspólne ustawienia TypeScript
└── .env.example                 zmienne środowiskowe (jeden .env w korzeniu)
```

Pakiety wewnętrzne są dostarczane jako źródła TypeScript (pole `exports` wskazuje na `src/`) i transpilowane przez Next.js (`transpilePackages`) — nie mają własnego kroku budowania.

Podścieżki bezpieczne w przeglądarce (bez Awilixa i MikroORM):

| Import | Zawartość |
|---|---|
| `@devmentor/core/domain` | Typy domenowe (`Mentor`, `Session`, `Role`…), katalog (`CATEGORIES`, `PLAN_OPTIONS`), reguły z jawnym `now` (`weekSlots`, `canJoin`, `canCancelFree`, `commissionRate`, `planPrice`…) |
| `@devmentor/db/fixtures` | Dane demo (`MENTORS`, `SESSIONS`, …, `DEMO_NOW`) — dziś źródło danych aplikacji, docelowo seed bazy |
| `@devmentor/ui/lib/format`, `@devmentor/ui/lib/icons` | Formatowanie dat/kwot (pl), ścieżki ikon SVG |
| `@devmentor/ui/kompas.css` | System wizualny Kompasu (przejściowo, do czasu przepisania ekranów na Tailwind) |

### Zależności między pakietami

```
        ┌──────────── app ────────────┐
        ▼              ▼              ▼
       db ──────────▶ core            ui
```

- **core** — niezależny od frameworka: nie zna React, Next.js ani MikroORM.
- **db** — zależy tylko od `core`; nie zna React ani Next.js.
- **ui** — tylko komponenty prezentacyjne; bez dostępu do danych i logiki biznesowej.
- **app** — skleja wszystko; jedyny pakiet, który zna pozostałe trzy.

### `@devmentor/app` — aplikacja

Next.js App Router w `packages/app/src/app`:

| Ścieżka | Rola |
|---|---|
| `(legacy)/` | Root layout z `kompas.css` (bez Tailwinda) i strona `/`, która montuje aplikację z `src/legacy` |
| `(backend)/` | Root layout z Tailwindem; `admin/` — panel na shadcn/ui z `@devmentor/ui/backend` |
| `(frontend)/` | (od fazy 2) strony publiczne przepisane na React — Tailwind + `@devmentor/ui/frontend` |
| `api/` | Route handlery (np. `api/health`) |
| `src/legacy/` | Aplikacja przeniesiona z mockupu: router na hashu, stan w pamięci, 22 ekrany jako HTML; start przez `startKompasApp(root)` |
| `src/server/container.ts` | Composition root kontenera Awilix (`server-only`) |

Grupy tras nie wpływają na adresy URL. `(legacy)` i `(backend)` mają osobne root layouty, bo preflight Tailwinda zmieniłby wygląd ekranów Kompasu; przejście między nimi to pełne przeładowanie strony. Ekrany z `src/legacy` są kolejno przepisywane na React (fazy 2–4), a dane demo zastępowane bazą (faza 5).

### Dependency Injection (Awilix)

```
getContainer()  ── singleton na proces: clock, orm, dbHealthCheck, serwisy…
   └─ getRequestScope()  ── scope per żądanie: em (EntityManager.fork())
```

- `@devmentor/core` dostarcza `createContainer()` (tryb `PROXY`, `strict`) i interfejs `Cradle`, który każdy pakiet rozszerza o swoje rejestracje (`declare module "@devmentor/core"`), więc `resolve()` i wstrzykiwanie są typowane.
- Pakiety eksportują klasy i funkcje rejestrujące (`registerDb(container, orm)`); kontener składa tylko `packages/app/src/server/container.ts`.
- Zależności trafiają do konstruktora jako jeden obiekt: `constructor({ em, clock })`.
- Route handlery, server actions i Server Components rozwiązują zależności z `getRequestScope()`, dzięki czemu każde żądanie ma własny `EntityManager` (Unit of Work, mapa tożsamości).

### Dane (MikroORM + PostgreSQL)

- `packages/db/src/config.ts` — wspólna konfiguracja (`DATABASE_URL`, pula `DATABASE_POOL_MAX`) dla aplikacji i CLI.
- `packages/db/src/entities/` — encje w `defineEntity` (bez dekoratorów, więc bez `reflect-metadata` i problemów z bundlerem); lista encji jest jawna.
- `packages/db/src/orm.ts` — `getOrm()`: jedna instancja ORM i pula połączeń na proces (odporna na hot reload). MikroORM łączy się leniwie, przy pierwszym zapytaniu.
- `packages/db/src/migrations/` — migracje i snapshot schematu, generowane przez `@mikro-orm/cli` (`packages/db/mikro-orm.config.ts`).
- Pakiety MikroORM są w `serverExternalPackages` — ładuje je Node.js, nie bundler.

### UI (Tailwind + shadcn/ui)

- `@devmentor/ui/styles.css` — Tailwind CSS v4 i tokeny motywu shadcn/ui (zmienne CSS, tryb `.dark`); importowany w `packages/app/src/app/globals.css`.
- `@devmentor/ui/frontend/*` — komponenty stron publicznych w czystym Tailwindzie (`Container`, `Hero`).
- `@devmentor/ui/backend/*` — komponenty shadcn/ui (`Button`, `Card`); nowe dodaje się przez `npx shadcn@latest add <komponent>` w `packages/ui` (konfiguracja w `components.json`).
- `@devmentor/ui/lib/utils` — `cn()` do łączenia klas.

## Praca z agentami AI

Zasady dla agentów kodujących (stos, granice pakietów, DI, migracje, proces SDD) są w [`AGENTS.md`](AGENTS.md); specyfikacje, logi przebiegów i wnioski — w `.ai/`.
