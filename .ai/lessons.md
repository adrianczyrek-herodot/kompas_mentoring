# Lekcje — pamięć długoterminowa agentów

Czytaj ten plik na początku każdego zadania. Zasady prowadzenia: `AGENTS.md` → sekcja „`.ai/lessons.md` i `.ai/lessons/`”.

Format punktu: `- **YYYY-MM-DD** — <wniosek i powód>. Szczegóły: [lessons/YYYY-MM-DD-slug.md](lessons/YYYY-MM-DD-slug.md)`

## Proces i narzędzia

- **2026-10-20** — `.ai/cezar/` to katalog roboczy orkiestratora cezar (worktree, załączniki); jest w `.gitignore` i nie należy do struktury `.ai/` — nie zapisuj tam specyfikacji, runów ani lekcji.
- **2026-10-20** — W przebiegach cezar (Claude Code headless) WebFetch bywa zablokowany; publiczną stronę da się odczytać przez `curl -sL <url>` z usunięciem tagów HTML.

## Domena i produkt

## Kod i mockupy

- **2026-10-20** — MikroORM 7 łączy się z bazą leniwie: po `MikroORM.init()` `orm.checkConnection()`/`isConnected()` zwracają „Connection not established”, dopóki nie padnie pierwsze zapytanie. Health check robi więc `select 1` przez `em.getConnection().execute()`.
- **2026-10-20** — DevMentor: TypeScript 7 (natywny) działa z Next.js 16 (`next build` i `tsc --noEmit` przechodzą); augmentacja `declare module "@devmentor/core"` poprawnie rozszerza `Cradle` reeksportowany przez `export *`.
- **2026-10-20** — `next dev` (Next.js 16) sam tworzy i odtwarza `packages/app/AGENTS.md` z regułami Next.js — commituj go razem ze zmianą, nie usuwaj (wróci jako niezacommitowana zmiana).

- **2026-10-20** — Przenosząc ekrany (`src/legacy` → React) weryfikuj regresje zrzutami ekranu przed/po: Playwright (przeglądarki są w `~/Library/Caches/ms-playwright`) + `pixelmatch`, skrypty trzymaj poza repo (np. katalog tmp cezar); stary build odtwórz przez `git archive <commit> <ścieżka>`. Pasek dev Next.js (lewy dolny róg, ~38×38 px) daje różnicę w `next dev` — porównuj na `next start`.
- **2026-10-20** — Aplikacja z `src/legacy` i strony Tailwind muszą mieć osobne root layouty (`(legacy)`, `(backend)`): preflight Tailwinda psuje wygląd `kompas.css`. Moduły `legacy` ładuj dynamicznym `import()` w `useEffect` — dotykają `window` przy imporcie (SSR padnie).

## Błędy i ich przyczyny
