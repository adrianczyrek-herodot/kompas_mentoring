---
title: F1 — tożsamość (logowanie, rejestracja, role, zgody, konto)
status: in-progress      # draft | approved | in-progress | implemented | archived
created: 2026-11-10
implemented:
related:
  - .ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md
  - .ai/specs/implemented/2026-10-21-f0-szkielet-i-harness.md
  - kompas-mentoring/KONCEPCJA.md (P4, S3, UC3)
  - PR #7 (gałąź cez/d24e11ee) — materiał źródłowy ekranów P4/S3, strażnika dostępu i testów E2E
---

# F1 — tożsamość (logowanie, rejestracja, role, zgody, konto)

## Kontekst i cel

Pierwsza faza funkcjonalna planu z `.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`. Kolejne fazy (katalog, rezerwacje, płatności) potrzebują zalogowanego użytkownika z rolą, więc F1 dostarcza: konta i sesje (Better Auth), role i sprawdzanie dostępu, powrót po zalogowaniu (`returnTo`), zgody, podstawy ekranu konta (S3) i 2FA dla administratorów.

Ekrany P4 (logowanie/rejestracja) i S3 (konto) istnieją już jako klikalna implementacja w PR #7 (stan demo w przeglądarce). Przenosimy z niej **wygląd, teksty, walidacje i scenariusze E2E**, ale nie mechanizm demo — dane i logika idą przez moduł `identity`, RSC i Better Auth, zgodnie z zasadami szkieletu.

## Zakres

- W zakresie:
  - **Fundament UI** (pierwsza faza z ekranami): tokeny identyfikacji Kompasu z PR #7 (kolory, typografia, promienie) jako zmienne CSS w motywie shadcn/ui (wariant Base UI), `cn()`, komponenty potrzebne w F1 w `packages/ui` (Button, Input, Label, Checkbox, Card, Alert, Field z błędem), układ strony z nagłówkiem i stopką (bez paska MOCKUP).
  - **Moduł `identity`** w `packages/core/src/modules/identity/`: role, zgody (wersjonowane), polityka haseł, zapytania „bieżący użytkownik” i „czy ma uprawnienie”, rejestracja w DI.
  - **Better Auth** (e-mail + hasło, Google, LinkedIn przez OIDC) z adapterem Kysely na wspólnej puli `pg`, tabele w schemacie `identity` (migracja z SQL wygenerowanego przez CLI Better Auth), MikroORM mapuje `User` tylko do odczytu.
  - **Trasy:** `/api/auth/*` (Better Auth), `/logowanie`, `/rejestracja` (P4), `/konto` (S3 — zakres w Q7), `proxy.ts` jako strażnik tras zalogowanych z `returnTo`.
  - **Role:** `student`, `mentor`, `admin_trust`, `admin_finance` (§8 spec stosu); uprawnienia w stylu `booking.cancel.own` przygotowane jako mechanizm, lista uprawnień rośnie z kolejnymi fazami.
  - **2FA (TOTP)** obowiązkowe dla ról administracyjnych.
  - **Testy:** Vitest dla polityk domeny `identity`; integracyjne (Testcontainers) dla rejestracji/logowania/sesji; E2E Playwright (360 i 1280 px, axe) przeniesione i dostosowane z PR #7: rejestracja, logowanie, błędne dane, `returnTo`, wylogowanie, 2FA admina.
- Poza zakresem: onboarding mentora (F2), eksport i usunięcie danych jako pełne przepływy (zakres w Q7), passkeys (v1.1), powiadomienia push, panel administracyjny użytkowników.

## Wymagania

1. Rejestracja e-mailem: imię, e-mail, hasło (≥ 10 znaków, sprawdzenie w bazie wycieków — Q8), wybór „chcę się uczyć / mentorować”, zgoda na regulamin i politykę prywatności (wymagana), zgoda marketingowa (opcjonalna). Teksty i walidacje jak w P4 z PR #7.
2. Logowanie e-mailem i przez Google/LinkedIn; komunikat o błędnych danych nie ujawnia, które pole jest złe („Nieprawidłowy e-mail lub hasło.”); limit prób logowania.
3. Sesje w bazie, cookie `HttpOnly`, `Secure`, `SameSite=Lax`; mutacje z ochroną CSRF (Better Auth).
4. Wejście na trasę wymagającą konta bez sesji → `/logowanie?returnTo=…`; po zalogowaniu powrót pod `returnTo` (tylko ścieżki wewnętrzne — ochrona przed open redirect).
5. Rola sprawdzana w każdej komendzie i zapytaniu aplikacyjnym modułu (nie tylko w UI); brak uprawnień → 403, cudzy zasób → 404.
6. Zgody zapisane z wersją dokumentu i czasem (`Clock`); zmiana wersji regulaminu wymusza ponowną akceptację (zakres w Q6).
7. Konto admina wymaga skonfigurowanej 2FA przed dostępem do jakiejkolwiek trasy admina.
8. Wszystkie teksty UI w `apps/web/messages/pl.json`; stany loading/empty/error/success na każdym ekranie; WCAG 2.2 AA.

## Kryteria akceptacji

- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone; testy integracyjne i E2E w CI zielone.
- [ ] Rejestracja → zalogowany użytkownik z rolą `student` albo kandydat na mentora (Q3); wylogowanie kończy sesję w bazie.
- [ ] Logowanie e-mailem: poprawne, błędne hasło (komunikat bez wskazania pola), limit prób.
- [ ] Google i LinkedIn działają z kluczami w środowisku; bez kluczy przyciski są ukryte, a aplikacja startuje (Q1).
- [ ] `returnTo`: wejście na trasę chronioną → logowanie → powrót; zewnętrzny `returnTo` ignorowany.
- [ ] Testy „brak roli → 403” i „cudzy zasób → 404” dla zapytań modułu `identity`.
- [ ] Admin bez 2FA nie wejdzie na trasę admina; po konfiguracji TOTP — wchodzi.
- [ ] E2E 360 i 1280 px z axe (0 naruszeń serious/critical) dla P4 i S3; zrzuty wzorcowe.
- [ ] Przegląd człowieka (moduł `identity`, migracje — wymóg §10.2).

## Projekt rozwiązania

- **`packages/ui`:** `components.json` (shadcn, Base UI), `src/lib/cn.ts`, motyw w CSS z tokenami Kompasu (z PR #7: `ink`, `paper`, `brand`, `accent`, `line`, `ok/warn/err`, krój szeryfowy nagłówków); komponenty `PascalCase.tsx` jeden na plik; `index.ts` eksportuje publiczne API. Zastępuje obecny `Button.tsx` z kolorami na sztywno.
- **`packages/core/src/modules/identity/`:** `domain/` — `role.ts` (unia ról), `consent.entity.ts`, `policies/password.policy.ts`, `policies/return-to.policy.ts` (tylko ścieżki wewnętrzne), `policies/config.ts` (wersje dokumentów, długość hasła); `application/` — `get-current-user.query.ts`, `require-permission.ts`, `record-consents.command.ts`; `infrastructure/` — konfiguracja Better Auth (Kysely na puli z kontenera), mapowanie `User` (MikroORM, tylko odczyt), repozytorium zgód; `migrations/` — SQL Better Auth + tabela zgód; `di.ts`, `index.ts`, `AGENTS.md`.
- **`packages/contracts`:** schematy zod formularzy P4/S3 (wspólne dla klienta i serwera), kontrakt oRPC zapytań konta.
- **`apps/web`:** `app/api/auth/[...all]/route.ts`; `proxy.ts` (sesja → przekierowanie z `returnTo`, admin bez 2FA → konfiguracja 2FA); strony `logowanie`, `rejestracja`, `konto` jako RSC z formularzami-liśćmi `"use client"` (react-hook-form + zod z `contracts`); nagłówek z menu zależnym od roli; `messages/pl.json`.
- **Testy:** `packages/core/.../identity/**/*.test.ts` (polityki), `*.int.test.ts` (rejestracja, logowanie, sesja, zgody na Testcontainers), `apps/web/e2e/identity.spec.ts` + fixture'y ról w `packages/testing` (użytkownik z seeda per rola, logowanie przez API zamiast UI w testach innych faz).

## Plan wdrożenia

Każdy krok to osobny PR (≤ ~400 linii poza migracjami i zrzutami), w tej kolejności:

1. `feat(ui)`: tokeny Kompasu, motyw shadcn (Base UI), komponenty formularzy, `cn()`; przegląd wizualny na stronie głównej szkieletu.
2. `feat(identity)`: moduł — domena (role, zgody, polityki hasła i `returnTo`) z testami Vitest; DI.
3. `feat(identity)`: Better Auth + Kysely + migracja schematu `identity` + `User` tylko do odczytu; testy integracyjne rejestracji/logowania/sesji.
4. `feat(web)`: `/api/auth/*`, `proxy.ts` z `returnTo`, sesja w RSC, nagłówek wg roli.
5. `feat(web)`: P4 `/logowanie`, `/rejestracja` (przeniesione z PR #7: wygląd, teksty, walidacje) + E2E.
6. `feat(web)`: S3 `/konto` w zakresie z Q7 + E2E.
7. `feat(identity)`: 2FA TOTP dla adminów (konfiguracja, wymuszenie w `proxy.ts`) + seed kont admina + E2E.

## Open Questions

- **Q1.** Logowanie społecznościowe w F1: Google **i** LinkedIn od razu? Potrzebne aplikacje OAuth i klucze (środowisko dev/preview). Rekomendacja: oba w kodzie; przyciski widoczne tylko, gdy klucze są ustawione.
- **Q2.** Weryfikacja e-maila: wymagana przed logowaniem, przed pierwszą rezerwacją, czy wcale w MVP? Wysyłka wymaga portu `EmailSender` (w F1 adapter konsolowy/fake, SES w F3). Rekomendacja: wymagana przed pierwszą rezerwacją, nie przed logowaniem.
- **Q3.** Rejestracja z opcją „mentorować”: od razu rola `mentor` (z profilem w szkicu do F2), czy osobny stan „kandydat” do czasu weryfikacji A1? Rekomendacja: rola `mentor` + status profilu `draft` w module `catalog` (F2); do zatwierdzenia mentor nie jest widoczny w wyszukiwarce.
- **Q4.** Konta administratorów: tylko z seeda/CLI (bez rejestracji przez UI), role `admin_trust` i `admin_finance`, obowiązkowe 2FA przy pierwszym logowaniu — akceptujesz?
- **Q5.** Czas życia sesji: użytkownicy 30 dni (odnawiane), admini 12 h — akceptujesz?
- **Q6.** Zmiana wersji regulaminu: w F1 tylko zapis wersji przy rejestracji, czy też ekran ponownej akceptacji przy logowaniu? Rekomendacja: zapis wersji teraz, ekran ponownej akceptacji przy pierwszej realnej zmianie dokumentu.
- **Q7.** Zakres S3 w F1: profil (imię), zmiana hasła, zgoda marketingowa, wylogowanie ze wszystkich urządzeń — tak; zmiana e-maila (wymaga weryfikacji z Q2), eksport danych i usunięcie konta (zadania w workerze) — w F1 czy później (F8)? Rekomendacja: eksport i usunięcie jako przyciski zapisujące żądanie, realizacja w F8.
- **Q8.** Sprawdzanie hasła w bazie wycieków (HIBP, zapytanie k-anonimity do zewnętrznego API przy rejestracji i zmianie hasła) — akceptujesz wywołanie zewnętrzne? Alternatywa: tylko lista najczęstszych haseł offline.

## Decyzje i zmiany

- 2026-11-10 — Specyfikacja robocza. Ekrany P4/S3, strażnik dostępu (`returnTo`) i scenariusze E2E przenosimy z PR #7 (gałąź `cez/d24e11ee`) jako materiał źródłowy, bez mechanizmu stanu demo — decyzja właściciela: przenoszenie fazami F1–F8 na szkielet z `main`.
- 2026-11-10 — Odpowiedzi właściciela (wszystkie zgodne z rekomendacjami): **Q1** Google i LinkedIn w kodzie, przyciski tylko przy ustawionych kluczach; **Q2** weryfikacja e-maila wymagana przed pierwszą rezerwacją (w F1 port `EmailSender` z adapterem testowym, SES w F3); **Q3** rejestracja „mentorować” → rola `mentor` + profil `draft` w `catalog` (F2); **Q4** admini tylko z seeda/CLI, role `admin_trust`/`admin_finance`, 2FA przy pierwszym logowaniu; **Q5** sesje 30 dni (odnawiane), admini 12 h; **Q6** w F1 tylko zapis wersji dokumentów; **Q7** S3: imię, zmiana hasła, zgoda marketingowa, wyloguj wszędzie, eksport i usunięcie jako zapisane żądania (realizacja F8); **Q8** HIBP (k-anonimity). Status `in-progress`.
- 2026-11-10 — Krok 2: rejestracja modułu w DI przeniesiona do kroku 3 — jedyna usługa aplikacyjna (`recordRegistrationConsents`) wymaga repozytorium zgód, które powstaje razem z bazą; rejestracja usługi bez zależności wywróciłaby kontener w trybie `strict` przy pierwszym rozwiązaniu.
- 2026-11-10 — Krok 3 (ustalenia przy wdrożeniu): (a) Better Auth dostaje Kysely z puli MikroORM z pluginem `TimestampParsingPlugin` — MikroORM ustawia parsery `pg` zwracające `timestamptz` jako tekst, a adapter Postgres Better Auth oczekuje `Date`; (b) limitu 12 h dla admina nie da się utrzymać hookiem przy tworzeniu sesji (odświeżenie w `getSession` przedłuża każdą sesję o globalne `expiresIn`), więc `sessionTtlFor` zastępuje polityka `sessionExpiresAt` (bezwzględnie 12 h od zalogowania), egzekwowana przy odczycie sesji w kroku 4; (c) tabela `twoFactor` (plugin 2FA) wchodzi już w migracji kroku 3 — jedna wygenerowana migracja schematu Better Auth, wymuszenie 2FA w kroku 7; (d) ID użytkowników to UUID v7 w kolumnach `text` (generator Better Auth); (e) HIBP działa fail-closed, wyłączone przy `NODE_ENV=test`; (f) `BETTER_AUTH_SECRET` wymagany tylko w produkcji; (g) port `EmailVerificationSender` z adapterem logującym (SES w F3); (h) kontener udostępnia `orm` i `em` (scoped) adapterom modułów (`DatabaseCradle`); migrator bez snapshotów schematu.
- 2026-11-10 — Krok 4: `getCurrentUser` (port `SessionReader`, adapter Better Auth) stosuje `sessionExpiresAt` — sesja admina po 12 h od zalogowania daje `null`. `proxy.ts` sprawdza tylko obecność cookie (`hasSessionCookie`, zalecenie Next.js) dla `/konto` i `/admin`; strony weryfikują sesję. `apps/web` zależy od `better-auth` wyłącznie dla `nextCookies()` (przekazywany do kontenera jako `authPlugins`). HIBP przełączane `AUTH_BREACHED_PASSWORD_CHECK` (domyślnie `on`; `off` w testach integracyjnych i e2e, żeby nie zależały od zewnętrznego API). Link do panelu admina w nagłówku dochodzi w kroku 7 (razem z trasą).
