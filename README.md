# DevMentor

Portal mentoringu 1:1 dla programistów. Koncepcja produktu, przepływy i klikalne mockupy: [`kompas-mentoring/`](kompas-mentoring/README.md).

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

Adresy: `/` — strona publiczna, `/admin` — panel, `/api/health` — stan aplikacji i bazy (200 / 503).

## Architektura

### Monorepo

```
.
├── packages/
│   ├── app/    @devmentor/app   aplikacja Next.js, composition root DI
│   ├── core/   @devmentor/core  części wielokrotnego użytku (DI, błędy, abstrakcje)
│   ├── db/     @devmentor/db    MikroORM: konfiguracja, encje, migracje
│   └── ui/     @devmentor/ui    komponenty UI: Tailwind i shadcn/ui
├── kompas-mentoring/            koncepcja i mockupy (osobny projekt)
├── compose.yaml                 lokalny PostgreSQL
├── tsconfig.base.json           wspólne ustawienia TypeScript
└── .env.example                 zmienne środowiskowe (jeden .env w korzeniu)
```

Pakiety wewnętrzne są dostarczane jako źródła TypeScript (pole `exports` wskazuje na `src/`) i transpilowane przez Next.js (`transpilePackages`) — nie mają własnego kroku budowania.

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
| `(frontend)/` | Strony publiczne — Tailwind + `@devmentor/ui/frontend` |
| `(backend)/admin/` | Panel administracyjny — shadcn/ui z `@devmentor/ui/backend` |
| `api/` | Route handlery (np. `api/health`) |
| `src/server/container.ts` | Composition root kontenera Awilix (`server-only`) |

Grupy tras `(frontend)` i `(backend)` nie wpływają na adresy URL — rozdzielają layouty i zestawy komponentów.

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
