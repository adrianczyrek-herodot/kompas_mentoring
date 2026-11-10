# Lekcje — pamięć długoterminowa agentów

Czytaj ten plik na początku każdego zadania. Zasady prowadzenia: `AGENTS.md` → sekcja „`.ai/lessons.md` i `.ai/lessons/`”.

Format punktu: `- **YYYY-MM-DD** — <wniosek i powód>. Szczegóły: [lessons/YYYY-MM-DD-slug.md](lessons/YYYY-MM-DD-slug.md)`

## Proces i narzędzia

- **2026-10-20** — `.ai/cezar/` to katalog roboczy orkiestratora cezar (worktree, załączniki); jest w `.gitignore` i nie należy do struktury `.ai/` — nie zapisuj tam specyfikacji, runów ani lekcji.
- **2026-10-20** — W przebiegach cezar (Claude Code headless) WebFetch bywa zablokowany; publiczną stronę da się odczytać przez `curl -sL <url>` z usunięciem tagów HTML.
- **2026-10-21** — pnpm uruchamiamy przez corepack: `corepack enable --install-directory <katalog> pnpm` i ten katalog na `PATH` (Turborepo wymaga `pnpm` na `PATH`). pnpm 12 wymaga corepack ≥ 0.36 — z Node 25 (corepack 0.32) zostajemy na pnpm 11. pnpm 11 przerywa instalację na niezatwierdzonych skryptach budowania — dopisz je do `allowBuilds`.
- **2026-10-21** — Push zmieniający `.github/workflows/*` wymaga zakresu `workflow` w tokenie gh (`gh auth refresh -h github.com -s workflow`, interaktywnie przez człowieka); bez niego GitHub odrzuca cały push.
- **2026-10-21** — Przed merge gałęzi dziecka cezar sprawdź `git log` pod kątem commitów „cezar autosave” — dziecko może przepisać historię lokalnie.
- **2026-10-21** — Turborepo filtruje zmienne środowiskowe: każdą zmienną potrzebną zadaniu (np. `E2E_PORT`) dopisz do `env` zadania w `turbo.json`, inaczej po cichu nie dotrze.

- **2026-10-21** — Zanim zaczniesz szkielet lub zmianę architektury, sprawdź `git fetch && git log HEAD..origin/main` i otwarte PR-y: równoległe zadanie cezar zbudowało na `main` inny szkielet tego projektu (pnpm/Turborepo, `apps/*`) niż gałąź `cez/d24e11ee` (npm, `packages/{app,core,db,ui}`) — PR #7 wymaga decyzji o kierunku.

## Domena i produkt

## Kod i mockupy

- **2026-10-20** — MikroORM 7 łączy się z bazą leniwie: po `MikroORM.init()` `orm.checkConnection()`/`isConnected()` zwracają „Connection not established”, dopóki nie padnie pierwsze zapytanie. Health check robi więc `select 1` przez `em.getConnection().execute()`.
- **2026-10-20** — DevMentor: TypeScript 7 (natywny) działa z Next.js 16 (`next build` i `tsc --noEmit` przechodzą); augmentacja `declare module "@devmentor/core"` poprawnie rozszerza `Cradle` reeksportowany przez `export *`.
- **2026-10-20** — `next dev` (Next.js 16) sam tworzy i odtwarza `packages/app/AGENTS.md` z regułami Next.js — commituj go razem ze zmianą, nie usuwaj (wróci jako niezacommitowana zmiana).


- **2026-10-20** — Warianty `cva` zwracaj przez `cn()` (tailwind-merge), inaczej np. `border-line` wariantu przegrywa z bazowym `border-transparent` zależnie od kolejności w CSS.
- **2026-10-20** — Stan demo żyje w pamięci przeglądarki: wszystkie strony (także panel) muszą być w jednym root layoucie i przechodzić nawigacją klienta (`<Link>`, `router.push`) — osobny root layout albo pełne przeładowanie zeruje rolę i dane.


- **2026-10-21** — Regresję i przepływy sprawdza `npm run e2e` (Playwright w `e2e/`, wzorce zrzutów w repo) — nie pisz skryptów do katalogu tmp (cezar go czyści). Nawigacja w testach przez `go()` z `e2e/support.ts`: `page.goto()` przeładowuje stronę i zeruje stan demo.
- **2026-10-21** — Każdy stan ładowania (szkielet, spinner „łączenie…”) musi mieć `aria-busy="true"`: `settle()` w testach czeka na jego zniknięcie, inaczej zrzut łapie stan przejściowy (tak było z pokojem sesji przy 360 px).

- **2026-10-21** — Style bazowe pod `:where(.kompas) :where(a)` mają zerową specyficzność i przegrywają z preflightem Tailwinda (`a { text-decoration: inherit }`) — używaj `:where(.kompas) a` (specyficzność elementu, później w kodzie). Utilities i tak wygrywają warstwą.
- **2026-10-21** — Tokeny Kompasu i motyw shadcn/ui mają wspólne nazwy (`--color-accent`, `--radius-*`): w `@theme` zostają wartości Kompasu, a w `.backend` nadpisujemy zmienne — utilities czytają je przez `var()`, więc `bg-accent`/`rounded-md` zmieniają znaczenie tylko w panelu. Nie dawaj tych kluczy do `@theme inline`.
- **2026-10-21** — `npx shadcn add` w `packages/ui` generuje `import { cn } from "cn"` (i dodaje do zależności niepowiązany pakiet `cn`) oraz importy `@devmentor/ui/backend/x` — po CLI zamień na `../lib/utils` i `./x`, odinstaluj `cn`; doinstaluj `lucide-react`, a `sonner.tsx` uwolnij od `next-themes`.
- **2026-10-21** — sonner wstawia najnowszy toast na początek listy — w testach nie używaj `.last()`, tylko `expectToast(page, tekst)` z `e2e/support.ts`. `body` bez `antialiased` — ta klasa zmienia rendering tekstu i rozjeżdża wzorce zrzutów.
- **2026-10-21** — Playwright: nie używaj `reuseExistingServer` domyślnie — w worktree port bywa zajęty przez serwer innej sesji i testy po cichu sprawdzają obcą aplikację. U nas reuse tylko przy `E2E_REUSE_SERVER=1`, port przez `E2E_PORT`.
- **2026-10-21** — `eslint-plugin-boundaries` 7: wzorce elementów dopasowują katalogi, nie pliki — `index.ts`/`di.ts` klasyfikuj przez `boundaries/files`; komunikat polityki pojawia się tylko, gdy decyduje jej `disallow`, więc per strefa: „disallow all z komunikatem, potem allow wyjątki”.
- **2026-10-21** — CLI dependency-cruiser 18 odmawia działania na nieparzystych wydaniach Node (25) — uruchamiamy go przez API (`scripts/check-dependencies.mjs`).
- **2026-10-21** — pino `redact: ['*.message']` ukrywa też `err.message` — treść czatu redaguj tylko na najwyższym poziomie lub pod jawnymi nazwami pól.
- **2026-10-21** — `pnpm test` to tylko testy jednostkowe; integracyjne (`pnpm test:integration`, Testcontainers) pomijają się bez Dockera z komunikatem, a w CI są obowiązkowe. Aplikacja web wymaga `DATABASE_URL` (walidacja env) — e2e dostaje domyślny URL z docker-compose.

## Błędy i ich przyczyny
