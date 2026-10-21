# Lekcje — pamięć długoterminowa agentów

Czytaj ten plik na początku każdego zadania. Zasady prowadzenia: `AGENTS.md` → sekcja „`.ai/lessons.md` i `.ai/lessons/`”.

Format punktu: `- **YYYY-MM-DD** — <wniosek i powód>. Szczegóły: [lessons/YYYY-MM-DD-slug.md](lessons/YYYY-MM-DD-slug.md)`

## Proces i narzędzia

- **2026-10-20** — `.ai/cezar/` to katalog roboczy orkiestratora cezar (worktree, załączniki); jest w `.gitignore` i nie należy do struktury `.ai/` — nie zapisuj tam specyfikacji, runów ani lekcji.
- **2026-10-20** — W przebiegach cezar (Claude Code headless) WebFetch bywa zablokowany; publiczną stronę da się odczytać przez `curl -sL <url>` z usunięciem tagów HTML.
- **2026-10-21** — pnpm uruchamiamy przez corepack: `corepack enable --install-directory <katalog> pnpm` i ten katalog na `PATH` (Turborepo wymaga `pnpm` na `PATH`). pnpm 12 wymaga corepack ≥ 0.36 — z Node 25 (corepack 0.32) zostajemy na pnpm 11. pnpm 11 przerywa instalację na niezatwierdzonych skryptach budowania — dopisz je do `allowBuilds`.
- **2026-10-21** — Przed merge gałęzi dziecka cezar sprawdź `git log` pod kątem commitów „cezar autosave” — dziecko może przepisać historię lokalnie.
- **2026-10-21** — Turborepo filtruje zmienne środowiskowe: każdą zmienną potrzebną zadaniu (np. `E2E_PORT`) dopisz do `env` zadania w `turbo.json`, inaczej po cichu nie dotrze.

## Domena i produkt

## Kod i mockupy

- **2026-10-21** — Playwright: nie używaj `reuseExistingServer` domyślnie — w worktree port bywa zajęty przez serwer innej sesji i testy po cichu sprawdzają obcą aplikację. U nas reuse tylko przy `E2E_REUSE_SERVER=1`, port przez `E2E_PORT`.
- **2026-10-21** — `eslint-plugin-boundaries` 7: wzorce elementów dopasowują katalogi, nie pliki — `index.ts`/`di.ts` klasyfikuj przez `boundaries/files`; komunikat polityki pojawia się tylko, gdy decyduje jej `disallow`, więc per strefa: „disallow all z komunikatem, potem allow wyjątki”.
- **2026-10-21** — CLI dependency-cruiser 18 odmawia działania na nieparzystych wydaniach Node (25) — uruchamiamy go przez API (`scripts/check-dependencies.mjs`).
- **2026-10-21** — pino `redact: ['*.message']` ukrywa też `err.message` — treść czatu redaguj tylko na najwyższym poziomie lub pod jawnymi nazwami pól.
- **2026-10-21** — `pnpm test` to tylko testy jednostkowe; integracyjne (`pnpm test:integration`, Testcontainers) pomijają się bez Dockera z komunikatem, a w CI są obowiązkowe. Aplikacja web wymaga `DATABASE_URL` (walidacja env) — e2e dostaje domyślny URL z docker-compose.

## Błędy i ich przyczyny
