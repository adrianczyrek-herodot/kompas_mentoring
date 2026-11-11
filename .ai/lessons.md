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

- **2026-11-10** — Konflikt scalenia rozwiązany przez „zostaw obie strony” sklejył dwa szkielety (PR #7 → `e4aa59c`): cztery `package.json`/`tsconfig.json` stały się niepoprawnym JSON-em, CI na `main` padło na `pnpm/action-setup`. Przy konfliktach `add/add` w plikach konfiguracyjnych wybierz jedną stronę; przed scaleniem PR z konfliktami sprawdź lokalnie `node -e "JSON.parse(...)"`/`pnpm install`. Naprawa: `git revert -m 1 <merge>` na gałęzi + PR.
- **2026-11-10** — Konto `gh` w środowisku cezar może się zmienić między sesjami (było `adrianczyrek-herodot`, jest `aczyrek` bez uprawnień push → 403). Przed pushem sprawdź `gh api repos/<owner>/<repo> --jq .permissions`; przełączenie konta to decyzja człowieka.
- **2026-11-11** — PR ze stosu (base = gałąź innego PR) scalony po scaleniu PR bazowego trafia na gałąź stosu, nie na `main` — tak krok 7 F1 (PR #19, #20) ominął `main`. Przed scaleniem PR-a ze stosu ustaw `gh pr edit <nr> --base main`; po scaleniu stosu sprawdź `git log origin/main..origin/<gałąź>` (puste = wszystko na `main`).
- **2026-11-11** — Etykiety `priority-*` nadajemy wg tabeli w `SDLC.md` §2a; zgłoszenie z etykietami wymaga konta `gh` z uprawnieniem co najmniej triage (bez niego `gh issue create --label` się nie powiedzie).
- **2026-11-11** — E2E w CI padało w `playwright install --with-deps` (`Temporary failure resolving 'azure.archive.ubuntu.com'`, `apt` kod 100) — testy w ogóle nie startowały, a kod nie był winny. Przeglądarkę instalujemy z CDN Playwrighta (`playwright install chromium`), a `install-deps` przez `apt` jest osobnym krokiem z `continue-on-error` (obraz runnera ma biblioteki Chromium). Czerwony job e2e → najpierw sprawdź, który krok padł.

## Domena i produkt

## Kod i mockupy

- **2026-11-10** — Lokalne e2e używają bazy z docker-compose, której testy nie migrują — po dodaniu migracji uruchom `pnpm db:migrate`, inaczej rejestracja kończy się 500 (hook zapisu zgód) i padają niezwiązane testy.
- **2026-11-10** — W RSC wywołuj `await headers()`/`cookies()` **przed** `getContainer()`: inaczej `next build` próbuje prerenderować stronę, buduje kontener i pada na walidacji env (brak `DATABASE_URL`).

- **2026-10-21** — Playwright: nie używaj `reuseExistingServer` domyślnie — w worktree port bywa zajęty przez serwer innej sesji i testy po cichu sprawdzają obcą aplikację. U nas reuse tylko przy `E2E_REUSE_SERVER=1`, port przez `E2E_PORT`.
- **2026-10-21** — `eslint-plugin-boundaries` 7: wzorce elementów dopasowują katalogi, nie pliki — `index.ts`/`di.ts` klasyfikuj przez `boundaries/files`; komunikat polityki pojawia się tylko, gdy decyduje jej `disallow`, więc per strefa: „disallow all z komunikatem, potem allow wyjątki”.
- **2026-10-21** — CLI dependency-cruiser 18 odmawia działania na nieparzystych wydaniach Node (25) — uruchamiamy go przez API (`scripts/check-dependencies.mjs`).
- **2026-10-21** — pino `redact: ['*.message']` ukrywa też `err.message` — treść czatu redaguj tylko na najwyższym poziomie lub pod jawnymi nazwami pól.
- **2026-10-21** — `pnpm test` to tylko testy jednostkowe; integracyjne (`pnpm test:integration`, Testcontainers) pomijają się bez Dockera z komunikatem, a w CI są obowiązkowe. Aplikacja web wymaga `DATABASE_URL` (walidacja env) — e2e dostaje domyślny URL z docker-compose.

## Błędy i ich przyczyny

- **2026-11-10** — Pula `pg` z MikroORM 7 zwraca `date`/`timestamp(tz)`/`interval` jako tekst (własne parsery typów). Kod spoza MikroORM na tej puli (Kysely z `getClient()`, Better Auth) dostaje stringi zamiast `Date` — Better Auth wtedy psuje sprawdzanie wygaśnięcia sesji. Rozwiązanie: plugin Kysely konwertujący kolumny czasu (`TimestampParsingPlugin` w `identity`).
- **2026-11-10** — Better Auth przy odświeżaniu sesji (`getSession`, po `updateAge`) ustawia `expiresAt = now + expiresIn` niezależnie od tego, co ustawił hook `session.create.before` — krótszych sesji dla wybranych ról nie da się zrobić hookiem; limit egzekwuj przy odczycie sesji.
- **2026-11-10** — Better Auth: limit prób (`rateLimit`) i kontrola Origin działają tylko w handlerze HTTP (`/api/auth/*`), nie w `auth.api.*` wołanym z serwera — logowanie/rejestracja z przeglądarki do API, nie przez server actions. Bez `BETTER_AUTH_URL` origin jest wyliczany z żądania (`localhost` w Next) i przeglądarka na `127.0.0.1` dostaje 403 `INVALID_ORIGIN`.
- **2026-11-10** — E2E w trybie produkcyjnym (`next start`) uruchamiają limit prób Better Auth (3/10 s per IP, IP z `x-forwarded-for`) — fixture `test` z `apps/web/e2e/support.ts` daje każdemu testowi własny adres. Next.js renderuje własny `role="alert"` (route announcer): komunikaty szukaj w `getByRole('main')`.
- **2026-11-10** — Gdy MikroORM ma encje, `migrator.up()` zapisuje `.snapshot-<baza>.json` w katalogu roboczym — u nas `snapshot: false` (migracje nie są generowane z różnic).
