# Track — implementacja F1 „tożsamość" (konta i role)

**Specyfikacja:** `.ai/specs/2026-11-10-f1-tozsamosc.md`
(Użytkownik wskazał `.ai/specs/2026-09-04-accounts-and-roles.md` — plik o tej nazwie nie istnieje w repo; F1 to jedyny dokument opisujący konta, role, logowanie i rejestrację.)
**Gałąź:** `cez/5df27579` · **Data:** 2026-11-22
**Legenda:** `[x]` wykonane · `[~]` w toku · `[ ]` do zrobienia

> Mapa wdrożenia = 8 kroków z sekcji „Plan wdrożenia" specyfikacji (każdy krok to osobny PR ≤ ~400 linii).
> Kroki 1–6 są już wdrożone i scalone do `main` (stan na `16cc80c`), więc faza 1–6 to zapis stanu
> faktycznego; do implementacji pozostają fazy 7 i 8.

---

## Faza 1 — Fundament UI (feat(ui)) — `[x]` WYKONANE
Zadania:
- [x] Tokeny Kompasu (kolory, typografia, promienie) jako zmienne CSS w motywie shadcn/Base UI
- [x] `cn()` z rozszerzonym tailwind-merge
- [x] Komponenty w `packages/ui` potrzebne w F1 (Button, Input, Label, Checkbox, Card, Alert, Field z błędem)
- [x] Układ strony z nagłówkiem i stopką (bez paska MOCKUP)

Dowody: `packages/ui/src/styles/globals.css`, `packages/ui/src/lib/utils.ts`, `packages/ui/src/components/*`, `packages/ui/src/index.ts`; spec `2026-11-11-design-system-storybook.md`; instrukcja dla agentów `docs/design-system.md`.

## Faza 2 — Moduł `identity`: domena i polityki (feat(identity)) — `[x]` WYKONANE
Zadania:
- [x] Unia ról i uprawnienia (`role.ts`)
- [x] Zgody wersjonowane (`consent.entity.ts`, `consent.policy.ts`)
- [x] Polityka hasła (10–128 znaków) z testami Vitest
- [x] Polityka `returnTo` (tylko ścieżki wewnętrzne) z testami
- [x] Polityka sesji (`sessionExpiresAt`, `mustSetUpTwoFactor`) z testami
- [x] Rejestracja w DI (`di.ts`, `index.ts`, `AGENTS.md`)

Dowody: `packages/core/src/modules/identity/domain/**`, `di.ts`, `index.ts`; testy `*.test.ts` w `domain/policies/`.

## Faza 3 — Better Auth + Kysely + migracja schematu `identity` + `User` tylko do odczytu (feat(identity)) — `[x]` WYKONANE
Zadania:
- [x] Konfiguracja Better Auth (Kysely na puli MikroORM, `TimestampParsingPlugin`)
- [x] Migracja schematu Better Auth + tabela `consent` (`Migration20261110000000IdentityAuth`)
- [x] `UserRecord` (MikroORM, tylko odczyt) i repozytoria zgód
- [x] Testy integracyjne rejestracji/logowania/sesji (`infrastructure/identity.int.test.ts`)

Dowody: `packages/core/src/modules/identity/infrastructure/**`, `migrations/Migration20261110000000IdentityAuth.ts`.

## Faza 4 — `/api/auth/*`, `proxy.ts` z `returnTo`, sesja w RSC, nagłówek wg roli (feat(web)) — `[x]` WYKONANE
Zadania:
- [x] Handler `/api/auth/[...all]`
- [x] `proxy.ts` jako strażnik tras zalogowanych z `returnTo`
- [x] Sesja w RSC (`server/session.ts`, `server/runtime.ts`)
- [x] Nagłówek z menu zależnym od roli (`_components/site-header.tsx`)

Dowody: `apps/web/app/api/auth/[...all]/route.ts`, `apps/web/proxy.ts`, `apps/web/server/session.ts`, `apps/web/app/_components/site-header.tsx`.

## Faza 5 — P4 `/logowanie`, `/rejestracja` + E2E (feat(web)) — `[x]` WYKONANE
Zadania:
- [x] Formularze logowania i rejestracji (wygląd, teksty, walidacje zod z `contracts`)
- [x] Wybór „uczyć się / mentorować", zgody (wymagana regulamin/prywatność, opcjonalna marketing)
- [x] Google/LinkedIn ukryte bez kluczy; komunikat o błędnych danych bez wskazania pola; limit prób
- [x] E2E P4 (360/1280 px, axe)

Dowody: `apps/web/app/logowanie/`, `apps/web/app/rejestracja/`, `apps/web/app/_components/auth/**`, `apps/web/e2e/auth.spec.ts`, `apps/web/messages/pl.json`.

## Faza 6 — S3 `/konto` w zakresie Q7 + E2E (feat(web)) — `[x]` WYKONANE
Zadania:
- [x] Zmiana imienia i hasła (HIBP, unieważnienie innych sesji)
- [x] Zgoda marketingowa jako decyzje append-only
- [x] „Wyloguj wszędzie"
- [x] Eksport i usunięcie jako zapisane żądania (jedno oczekujące na rodzaj)
- [x] E2E S3 (360/1280 px, axe)

Dowody: `apps/web/app/konto/**`, `packages/core/src/modules/identity/application/account.commands.ts`, `apps/web/e2e/account.spec.ts`.

---

## Faza 7 — 2FA TOTP dla adminów (feat(identity)) — `[x]` WYKONANE
Zadania:
- [x] **Z7.1** Seed kont admina (`admin_trust`, `admin_finance`) + minimalna trasa `/admin` + link „Panel administratora” w nagłówku dla roli admin
- [x] **Z7.2** Strona konfiguracji 2FA (s07): włączenie TOTP (sekret), weryfikacja kodu, kody zapasowe — przez plugin `twoFactor` Better Auth
- [x] **Z7.3** Wymuszenie 2FA: admin z ważną sesją, ale bez 2FA, na `/admin/*` → przekierowanie na s07 z komunikatem „Skonfiguruj 2FA, aby kontynuować” (nie wylogowanie)
- [x] **Z7.4** Komunikat wygaśnięcia sesji admina (12 h) na s01, odróżnialny od sesji użytkownika (30 dni)
- [x] **Z7.5** Testy: jednostkowe polityki + E2E (s07, admin bez 2FA, 12 h)

Dowody: seed adminów w `packages/core/src/shared/infrastructure/db/cli/seed.ts`; `apps/web/app/admin/{layout,page}.tsx`,
`apps/web/app/konto/2fa/**`, `packages/core/.../domain/policies/session.policy.ts` (12 h), `apps/web/server/session.ts`,
`apps/web/e2e/admin.spec.ts`, `apps/web/e2e/global-setup.ts`. Bramki: lint 0 błędów, typecheck 7/7,
test 4/4 (core 62), test:integration 11, build OK, test:e2e 46 zaliczone (360 i 1280 px).

Znane tymczasowe: nie-admin na `/admin` dostaje 404 — właściwa trasa 403 (s08) powstaje w fazie 8;
E2E pełnego przekroczenia 12 h (podróż w czasie) zastąpione testem jednostkowym polityki i E2E komunikatu.

## Faza 8 — Weryfikacja e-maila (s10) + strony błędów 403/404 (s08, s09) (feat(web)) — `[x]` WYKONANE
Zadania:
- [x] **Z8.1** Strona weryfikacji e-maila (s10): token ważny → sukces i link do strony startowej roli; token wygasły/błędny → „Link wygasł lub jest nieprawidłowy” + „Wyślij nowy link”; E2E oba warianty
- [x] **Z8.2** Trasa 403 (s08) z linkiem do strony startowej roli (student/mentor → `/konto`, admin → `/admin`), realny status 403 przez `forbidden()` + `authInterrupts`
- [x] **Z8.3** Trasa 404 (s09) bez ujawniania istnienia zasobu (`app/not-found.tsx`)
- [x] **Z8.4** E2E: student → `/mentor` = 403, mentor → `/admin/*` = 403, nieznana trasa = 404; axe
- [x] Dodatkowo: minimalna trasa `/mentor` (placeholder F2) z uprawnieniem `mentor.access`; `admin/layout.tsx`: nie-admin → 403 zamiast 404

Dowody: `apps/web/app/{forbidden,not-found}.tsx`, `apps/web/app/weryfikacja-email/**`, `apps/web/app/mentor/page.tsx`,
`packages/core/.../domain/role.ts` (`mentor.access`), `apps/web/next.config.ts` (`authInterrupts`),
`apps/web/app/_components/auth/auth-api.ts` (callbackURL), `apps/web/e2e/{verification,errors,admin}.spec.ts`.
Bramki: lint 0 błędów, typecheck 7/7, test 4/4 (core 62), test:integration 11, build OK, test:e2e **56 zaliczone** (360 i 1280 px).

---

## Środowisko weryfikacji
- `pnpm` przez corepack: `export PATH="$HOME/.local/corepack-bin:$PATH"`.
- Baza: `docker compose up -d` (Postgres 17, port 5432), `pnpm db:migrate`, `.env` z `.env.example`.
- Bramka: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:integration` (Testcontainers, Docker), `pnpm build`, `pnpm test:e2e` (Playwright, wymaga bazy i `next build`).
