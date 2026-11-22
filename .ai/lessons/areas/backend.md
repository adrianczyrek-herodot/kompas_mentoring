# Lekcje — Backend

Plik obszarowy lekcji (zasady: `AGENTS.md` → „Lekcje”). Czytaj, gdy router w `AGENTS.md` wskazuje ten obszar: `packages/core`, `apps/web` (RSC, DI), MikroORM, Better Auth, granice modułów, logowanie.

- **2026-11-10** — W RSC wywołuj `await headers()`/`cookies()` **przed** `getContainer()`: inaczej `next build` próbuje prerenderować stronę, buduje kontener i pada na walidacji env (brak `DATABASE_URL`).
- **2026-10-21** — `eslint-plugin-boundaries` 7: wzorce elementów dopasowują katalogi, nie pliki — `index.ts`/`di.ts` klasyfikuj przez `boundaries/files`; komunikat polityki pojawia się tylko, gdy decyduje jej `disallow`, więc per strefa: „disallow all z komunikatem, potem allow wyjątki”.
- **2026-10-21** — pino `redact: ['*.message']` ukrywa też `err.message` — treść czatu redaguj tylko na najwyższym poziomie lub pod jawnymi nazwami pól.
- **2026-11-10** — Pula `pg` z MikroORM 7 zwraca `date`/`timestamp(tz)`/`interval` jako tekst (własne parsery typów). Kod spoza MikroORM na tej puli (Kysely z `getClient()`, Better Auth) dostaje stringi zamiast `Date` — Better Auth wtedy psuje sprawdzanie wygaśnięcia sesji. Rozwiązanie: plugin Kysely konwertujący kolumny czasu (`TimestampParsingPlugin` w `identity`).
- **2026-11-10** — Better Auth przy odświeżaniu sesji (`getSession`, po `updateAge`) ustawia `expiresAt = now + expiresIn` niezależnie od tego, co ustawił hook `session.create.before` — krótszych sesji dla wybranych ról nie da się zrobić hookiem; limit egzekwuj przy odczycie sesji.
- **2026-11-10** — Better Auth: limit prób (`rateLimit`) i kontrola Origin działają tylko w handlerze HTTP (`/api/auth/*`), nie w `auth.api.*` wołanym z serwera — logowanie/rejestracja z przeglądarki do API, nie przez server actions. Bez `BETTER_AUTH_URL` origin jest wyliczany z żądania (`localhost` w Next) i przeglądarka na `127.0.0.1` dostaje 403 `INVALID_ORIGIN`.
- **2026-11-10** — Gdy MikroORM ma encje, `migrator.up()` zapisuje `.snapshot-<baza>.json` w katalogu roboczym — u nas `snapshot: false` (migracje nie są generowane z różnic).
