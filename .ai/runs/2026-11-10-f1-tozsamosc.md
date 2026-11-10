---
title: F1 — tożsamość (implementacja wg spec)
date: 2026-11-10
agent: Claude Code (claude-opus-5-5) przez cezar
status: done
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
- Krok 4 → PR #14. Krok 5: P4 `/logowanie`, `/rejestracja` (wygląd i walidacje z PR #7), hooki rejestracji (rola, zgody), e2e P4 + axe (28/28). Pułapki: `auth.api` z serwera omija limit prób i kontrolę Origin; bez `BETTER_AUTH_URL` origin `localhost` ≠ `127.0.0.1` przeglądarki → `INVALID_ORIGIN`; limit 3 prób/10 s per IP dławił równoległe e2e — fixture z losowym `x-forwarded-for` per test; Next.js ma własny `role="alert"` (route announcer) — w testach zawężać do `main`. Zrzuty P4: artefakty `f1-p4/`.
- Krok 5 rozdzielony na PR #15 (5a, core) i #16 (5b, strony). Krok 6: S3 `/konto` — core (decyzje o zgodach, żądania danych, `requirePermission`, `getAccountOverview`, migracja) i web (profil, hasło, zgoda, wyloguj wszędzie, eksport/usunięcie). E2E 40/40. Pułapka: lokalna baza bez nowej migracji → rejestracja 500 w e2e — po dodaniu migracji `pnpm db:migrate` przed e2e. Zrzuty: `f1-s3/`.
- Krok 6 → PR #17 (6a) i #18 (6b). Krok 7: `createAdminAccount` + CLI `pnpm admin:create`, `/admin` (403 / wymuszenie 2FA), `/admin/2fa`, `/logowanie/2fa`, link admina w nagłówku, e2e z generatorem TOTP i kontem z CLI (44/44). Pułapki: HIBP owija `ctx.password.hash` i wymaga kontekstu żądania (CLI się wieszał) → `hashPassword` z `better-auth/crypto`; hooki Better Auth dostają `undefined` (nie `null`) poza endpointem; `router.refresh()` po włączeniu 2FA przekierowywał z `/admin/2fa` i chował kody zapasowe. Zrzuty: `f1-admin/`.

## Wynik

F1 zaimplementowany w stosie PR-ów (każdy na poprzednim; baza stosu: #9 revert PR #7 → `main`):
#10 specyfikacja · #11 fundament UI · #12 domena `identity` · #13 Better Auth + migracja · #14 `/api/auth`, `proxy.ts`, nagłówek · #15 hooki rejestracji · #16 P4 · #17 komendy konta + migracja · #18 S3 · 7a/7b (2FA adminów, CLI). Moduł `identity` i migracje wymagają przeglądu człowieka (spec §10.2); scalanie — człowiek, od dołu stosu.

## Weryfikacja

Na każdym kroku lokalnie: `pnpm lint` (ESLint, Biome, dependency-cruiser, knip), `pnpm typecheck`, `pnpm test` (core: 61+), `pnpm test:integration` (Testcontainers, 12), `pnpm build`, `E2E_EXPECT_DB=up pnpm test:e2e` (44 na końcu: 360 i 1280 px, axe). CI nie uruchamia się dla PR-ów na gałęzie stosu — pierwszy przebieg CI po przestawieniu bazy na `main`.

## Problemy i otwarte kwestie

- PR #9 (revert) czeka na scalenie; dopiero potem stos może iść do `main`.
- Logowanie Google/LinkedIn niesprawdzone z prawdziwymi kluczami (brak aplikacji OAuth).
- Zrzuty wzorcowe Playwright odłożone (wzorce muszą powstać na Linuksie w CI).
- Ryzyko wdrożeniowe: IP do limitu prób z `x-forwarded-for` (za LB Cloud Run ustawić zaufany nagłówek), magazyn limitu w pamięci procesu.
- Do decyzji: kod QR przy konfiguracji 2FA (nowa biblioteka), menu mobilne nagłówka, brak `@vitest/coverage-v8` (progu pokrycia nie da się zmierzyć).
- Odłożone do F3: weryfikacja e-maila wysyłką (SES), „Nie pamiętasz hasła?”, zmiana e-maila; do F8: realizacja eksportu i usunięcia konta.

## Wnioski

Dopisane do `.ai/lessons.md` (sekcje „Błędy i ich przyczyny”, „Kod i mockupy”): parsery dat puli MikroORM a Better Auth, odświeżanie sesji Better Auth a limit admina, snapshoty migratora, limit prób/Origin tylko w handlerze HTTP i `BETTER_AUTH_URL`, e2e a limit prób i `role="alert"` Next.js, `headers()` przed kontenerem w RSC, migracja lokalnej bazy przed e2e, HIBP a kontekst żądania w CLI.
