---
title: F1 — tożsamość (implementacja wg spec)
date: 2026-11-10
agent: Claude Code (claude-opus-5-5) przez cezar
status: in-progress
spec: .ai/specs/2026-11-10-f1-tozsamosc.md
branch: cez/f1-identity-spec (+ gałęzie kroków)
---

# F1 — tożsamość

## Zadanie
Wdrożyć specyfikację F1 po odpowiedziach właściciela na Q1–Q8: PR-y 1–7 z „Planu wdrożenia”, z przeniesieniem P4/S3 i testów E2E z PR #7.

## Przebieg
- Odpowiedzi Q1–Q8 zapisane w specyfikacji (wszystkie zgodne z rekomendacjami), status `in-progress`.
- PR #9 (revert #7) jeszcze nie scalony — gałęzie kroków budowane na `cez/d24e11ee-revert-pr7` (stos PR-ów).
- Toolchain: pnpm 11.28.6 przez corepack (katalog tmp agenta), `pnpm install --frozen-lockfile`; stan wyjściowy: lint/typecheck/test/build zielone.
- Krok 1 (PR #11): shadcn Base UI (`base-nova`) przez CLI w `packages/ui` — znów `import { cn } from "cn"` + pakiet `cn` (poprawione), brakujące zależności doinstalowane z dokładnymi wersjami; motyw z tokenami Kompasu (jasny/ciemny); cele dotykowe 44 px przywrócone; knip: `tailwindcss` przeniesiony do `packages/ui`. CI zielone.
- Krok 2 (PR #12): domena `identity` (role, `safeReturnTo`, hasło, sesje/2FA, zgody) + 31 testów; DI przeniesione do kroku 3 (wpis w spec). Brak `@vitest/coverage-v8` — progu pokrycia nie da się zmierzyć.
- Krok 3: Better Auth 1.7.18 (+ `kysely` 0.29.6 jako zależność core) na Kyselym z puli MikroORM; SQL schematu `identity` wygenerowany przez `getMigrations().compileMigrations()` na Testcontainers; `User` (tylko odczyt) i `Consent` jako encje MikroORM; rejestracja modułu w DI. Problemy: daty jako tekst z puli MikroORM (plugin Kysely), odświeżanie sesji kasuje 12 h admina (polityka przy odczycie, wpis w spec), cykl `orm.ts` ↔ `di.ts` (typ `DatabaseCradle` w osobnym pliku), migrator zapisywał `.snapshot-*.json` (wyłączone). Docker Desktop trzeba było uruchomić (`open -a Docker`).
- Krok 3 → PR #13 (CI nie rusza dla PR-ów na gałęzie stosu — weryfikacja lokalna). Cezar zrobił „autosave” z lockfile — złączony z commitem kroku.
- Krok 4: `/api/auth/*`, `getCurrentUser` w RSC (`cache`), `proxy.ts` z `returnTo`, nagłówek gość/zalogowany + wylogowanie (server action z `nextCookies`). Pułapka: `getCurrentUser` w layoucie budował kontener przed `headers()` → `next build` prerenderował `/` i padał na walidacji env; najpierw `await headers()`.

## Wynik

## Weryfikacja

## Problemy i otwarte kwestie

## Wnioski
