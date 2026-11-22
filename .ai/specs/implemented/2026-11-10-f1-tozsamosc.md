---
title: F1 — tożsamość (logowanie, rejestracja, role, zgody, konto)
status: implemented     # draft | approved | in-progress | implemented | archived
created: 2026-11-10
implemented: 2026-11-22
prototype: prototypes/discovery/konta-i-role/revision-001/   # prototyp przepływu F1 (s01–s11), rewizja 001
related:
  - .ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md
  - .ai/specs/implemented/2026-10-21-f0-szkielet-i-harness.md
  - kompas-mentoring/KONCEPCJA.md (P4, S3, UC3)
  - PR #7 (gałąź cez/d24e11ee) — materiał źródłowy ekranów P4/S3, strażnika dostępu i testów E2E
  - prototypes/konta-i-role/mapa-ekranow.md — mapa ekranów F1 s01–s11
  - prototypes/discovery/konta-i-role/revision-001/README.md — prototyp F1 (założenia A-01–A-10, scenariusze SC-01–SC-24)
  - prototypes/kompas-flow/ — szary prototyp P1–P5 (dane demo, punkt wyjścia dla prototypu F1)
---

# F1 — tożsamość (logowanie, rejestracja, role, zgody, konto)

## Kontekst i cel

Pierwsza faza funkcjonalna planu z `.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`. Kolejne fazy (katalog, rezerwacje, płatności) potrzebują zalogowanego użytkownika z rolą, więc F1 dostarcza: konta i sesje (Better Auth), role i sprawdzanie dostępu, powrót po zalogowaniu (`returnTo`), zgody, podstawy ekranu konta (S3) i 2FA dla administratorów.

Ekrany P4 (logowanie/rejestracja) i S3 (konto) istnieją już jako klikalna implementacja w PR #7 (stan demo w przeglądarce). Przenosimy z niej **wygląd, teksty, walidacje i scenariusze E2E**, ale nie mechanizm demo — dane i logika idą przez moduł `identity`, RSC i Better Auth, zgodnie z zasadami szkieletu.

## Mapa ekranów (s01–s11)

Ekrany, stany, scenariusze do przełączania i konta demo: `prototypes/konta-i-role/mapa-ekranow.md`; klikalny prototyp: `prototypes/discovery/konta-i-role/revision-001/` (otwiera się plik `index.html`, panel scenariuszy pod F1). Identyfikatory **s01–s11 są stałe** — komentarze w prototypie przypinają się do nich, więc nie zmieniamy ich numeracji; nowy ekran dostaje kolejny numer.

| ID | Ekran | Rola | Kryterium akceptacji |
|---|---|---|---|
| **s01** | P4 — logowanie | gość | logowanie i limit prób, stan ładowania, wygasła sesja admina |
| **s02** | P4 — rejestracja | gość | walidacje i zgody, e-mail zajęty, HIBP fail-closed, Google/LinkedIn |
| **s03** | P4 — logowanie/rejestracja z `returnTo` | gość przekierowany | `returnTo` i baner zachowanego terminu, wylogowanie |
| **s04** | reset hasła („Nie pamiętasz hasła?”) | gość | **poza F1** — patrz „Decyzje i zmiany” 2026-11-22 |
| **s05** | ustawienie nowego hasła z linku | gość z tokenem | **poza F1** — patrz „Decyzje i zmiany” 2026-11-22 |
| **s06** | S3 — konto i ustawienia | student, mentor, admin | zakres Q7, zgody, żądania eksportu/usunięcia |
| **s07** | konfiguracja 2FA (TOTP) | admin bez 2FA | wymuszenie 2FA i przekierowanie, nie wylogowanie |
| **s08** | strona 403 — brak uprawnień | każda rola | trasa 403, link do strony startowej roli |
| **s09** | strona 404 — nie znaleziono / cudzy zasób | każda rola | trasa 404 bez ujawniania istnienia zasobu |
| **s10** | weryfikacja e-maila z linku | gość z tokenem | token ważny i wygasły, „Wyślij nowy link” |
| **s11** | ponowna akceptacja regulaminu | zalogowany | **poza F1** — patrz „Decyzje i zmiany” 2026-11-22 |

Stany z mapy, które dotyczą innych przepływów (blokada „nieweryfikowany e-mail” w U1/U2, zmiana e-maila, mentor `suspended` w U4/U5, anulowanie sesji próbnej < 12 h, BLIK cykliczny, dołączanie mentora w pokoju sesji), są przypisane do zadań w `.ai/specs/backlog.md` — F1 ich nie implementuje.

## Zakres

- W zakresie:
  - **Fundament UI** (pierwsza faza z ekranami): tokeny identyfikacji Kompasu z PR #7 (kolory, typografia, promienie) jako zmienne CSS w motywie shadcn/ui (wariant Base UI), `cn()`, komponenty potrzebne w F1 w `packages/ui` (Button, Input, Label, Checkbox, Card, Alert, Field z błędem), układ strony z nagłówkiem i stopką (bez paska MOCKUP).
  - **Moduł `identity`** w `packages/core/src/modules/identity/`: role, zgody (wersjonowane), polityka haseł, zapytania „bieżący użytkownik” i „czy ma uprawnienie”, rejestracja w DI.
  - **Better Auth** (e-mail + hasło, Google, LinkedIn przez OIDC) z adapterem Kysely na wspólnej puli `pg`, tabele w schemacie `identity` (migracja z SQL wygenerowanego przez CLI Better Auth), MikroORM mapuje `User` tylko do odczytu.
  - **Trasy:** `/api/auth/*` (Better Auth), `/logowanie`, `/rejestracja` (P4), `/konto` (S3 — zakres w Q7), weryfikacja e-maila (s10), strony błędów 403 i 404 (s08, s09), `proxy.ts` jako strażnik tras zalogowanych z `returnTo`.
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
- [ ] **[s02, s06]** Rejestracja → zalogowany użytkownik z rolą `student` albo kandydat na mentora (Q3); wylogowanie kończy sesję w bazie.
- [ ] **[s01]** Logowanie e-mailem: poprawne, błędne hasło (komunikat bez wskazania pola), limit prób.
- [ ] **[s01, s02]** Google i LinkedIn działają z kluczami w środowisku; bez kluczy przyciski są ukryte, a aplikacja startuje (Q1).
- [ ] **[s03]** `returnTo`: wejście na trasę chronioną → logowanie → powrót; zewnętrzny `returnTo` ignorowany.
- [ ] **[s08, s09]** Testy „brak roli → 403” i „cudzy zasób → 404” dla zapytań modułu `identity`.
- [ ] **[s07]** Admin bez 2FA nie wejdzie na trasę admina; po konfiguracji TOTP — wchodzi.
- [ ] **[s01, s02, s06]** E2E 360 i 1280 px z axe (0 naruszeń serious/critical) dla P4 i S3; zrzuty wzorcowe.
- [ ] Przegląd człowieka (moduł `identity`, migracje — wymóg §10.2).

Kryteria z mapy ekranów (2026-11-22), każde ze stałym identyfikatorem ekranu:

- [ ] **[s01]** Przekroczenie limitu prób logowania → formularz pokazuje „Za dużo prób. Spróbuj ponownie za N min” (N z okna limitu) i nie wysyła żądań do końca okna; E2E: kolejne błędne żądania → 429 → komunikat.
- [ ] **[s01, s02]** Przycisk wysyłki ma stan ładowania i blokuje ponowne wysłanie; E2E: dwa kliknięcia dają jedno żądanie (ten sam wzorzec obowiązuje na s05 i s11, gdy powstaną poza F1).
- [ ] **[s01, s03]** Wylogowanie przekierowuje na P1 z toastem; „Wyloguj wszędzie” w S3 kończy wszystkie sesje łącznie z bieżącą.
- [ ] **[s02]** Schematy zod w `packages/contracts` odrzucają: imię krótsze niż 2 lub dłuższe niż 50 znaków, e-mail niezgodny z RFC, hasło krótsze niż 10 znaków, brak zgody na regulamin i politykę prywatności; zgoda marketingowa jest opcjonalna — testy jednostkowe i E2E s02.
- [ ] **[s02]** Rejestracja e-mailem istniejącym w bazie → komunikat i link „Zaloguj się” (stan konflikt).
- [ ] **[s02, s06]** HIBP niedostępne (timeout, 5xx) → fail-closed: rejestracja i zmiana hasła kończą się komunikatem „Nie możemy teraz sprawdzić hasła — spróbuj ponownie”, a zdarzenie trafia do logu (Q8).
- [ ] **[s03]** Baner „Twój wybrany termin jest zachowany — po zalogowaniu wrócisz do płatności” pojawia się tylko wtedy, gdy `returnTo` wskazuje trasę rezerwacji; E2E: U1 → logowanie → powrót z zachowanym slotem.
- [ ] **[s06]** S3 w zakresie Q7: zmiana imienia i hasła (HIBP, unieważnienie innych sesji), zgoda marketingowa, „Wyloguj wszędzie” oraz eksport i usunięcie konta jako zapisane żądania — testy integracyjne i E2E s06.
- [ ] **[s06]** Odznaczenie zgody marketingowej zapisuje od razu nową decyzję `granted: false` z wersją dokumentu (bez przycisku „Zapisz”); test: dwie decyzje, najnowsza z `granted: false`.
- [ ] **[s06]** Drugie oczekujące żądanie tego samego rodzaju (eksport, usunięcie) jest odrzucane komunikatem „Masz już oczekujące żądanie”.
- [ ] **[s07]** Admin z ważną sesją, ale bez skonfigurowanego 2FA, wchodzi na dowolną trasę `/admin/*` → przekierowanie na s07 z komunikatem „Skonfiguruj 2FA, aby kontynuować” (nie wylogowanie); po konfiguracji TOTP — wchodzi; E2E.
- [ ] **[s01, s07]** Sesja admina po 12 h od zalogowania daje `null`, a następne żądanie przekierowuje na s01 z komunikatem „Sesja administratora wygasła (12 h) — zaloguj się ponownie”, odróżnialnym od komunikatu dla sesji użytkownika (30 dni).
- [ ] **[s08, s09]** s08 (403) i s09 (404) istnieją jako trasy w layoucie produktu: s08 linkuje do strony startowej roli (w F1 student i mentor → `/konto`, admin → `/admin`; po E3-S5 i F2 → U4 i M2), s09 nie ujawnia istnienia zasobu; E2E: student → `/mentor`, mentor → `/admin/*`, cudze konto.
- [ ] **[s10]** Rejestracja wysyła link weryfikacyjny (adapter logujący; poza produkcją link trafia do logu), a s10 obsługuje token: sukces → `returnTo` albo strona startowa roli, token wygasły → „Link wygasł lub jest nieprawidłowy” i „Wyślij nowy link”; E2E oba warianty (Q2).

## Pytania do sprawdzenia (hipotezy)

Miejsce na hipotezy z badań (persony, uwagi z prototypu) — **nie są wymaganiami**, rozstrzyga je test albo decyzja właściciela. Stan na 2026-11-22: prototyp rewizji 001 powstał **bez panelu syntetycznego** (README: „Panel syntetyczny: nie używano”), brak raportu person, a eksport uwag z prototypu (`prototype-feedback.md`) nie trafił do repozytorium — sekcję uzupełniamy po ich dostarczeniu.

Pytania, które mapa i prototyp zostawiają do sprawdzenia w badaniu (hipotezy, nie wymagania):

- Czy baner „Twój termin jest zachowany” na s03 wystarcza, żeby użytkownik wrócił do rezerwacji po zalogowaniu (SC-09), czy potrzebuje dodatkowego potwierdzenia terminu?
- Czy przy 403 (s08) użytkownik rozumie, dokąd prowadzi link „strona startowa roli”, gdy trafi tam pierwszy raz?
- Czy miernik siły hasła na s02 pomaga, czy tylko wydłuża rejestrację (SC-07 pokazuje błąd HIBP dopiero po wysłaniu)?
- Czy komunikat „Sesja administratora wygasła (12 h)” jest zrozumiały bez wyjaśnienia różnicy 12 h / 30 dni?

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
8. `feat(web)`: strona weryfikacji e-maila (s10) — token, stany sukcesu i wygaśnięcia, „Wyślij nowy link”; strony 403/404 (s08, s09) z linkiem do strony startowej roli; E2E.

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
- 2026-11-10 — Krok 5: formularze P4 wysyłają żądania z przeglądarki do `/api/auth/*` (nie server actions) — limit prób i kontrola Origin Better Auth działają tylko w jego handlerze HTTP, a nie w `auth.api` wołanym z serwera. Wybór „uczyć się / mentorować” i zgody idą w ciele `sign-up/email`; hook `user.create.before` wymaga regulaminu i polityki prywatności oraz ustawia rolę, `after` (po commicie transakcji) zapisuje zgody; rejestracja przez Google/LinkedIn zapisuje regulamin i politykę (tekst przy przyciskach: „Kontynuując, akceptujesz…”). `BETTER_AUTH_URL` wymagany w produkcji (inaczej origin wyliczany z żądania nie zgadza się z przeglądarką → 403). Link weryfikacyjny w logu tylko poza produkcją. Poza zakresem F1: „Nie pamiętasz hasła?” (wymaga wysyłki e-maili — F3); zrzuty wzorcowe Playwright odłożone (wzorce z macOS nie pasują do Linuksa w CI — do zrobienia przy pierwszym przebiegu w CI). **Ryzyko na wdrożenie:** Better Auth bierze IP do limitu prób z `x-forwarded-for`; za load balancerem Cloud Run trzeba wskazać zaufany nagłówek/pozycję (`advanced.ipAddress`), inaczej limit da się obejść podmianą nagłówka; magazyn limitu jest w pamięci procesu (przy wielu instancjach — `storage: 'database'` i migracja).
- 2026-11-10 — Krok 6 (S3): zgody to decyzje dopisywane (append-only) z polem `granted` — wycofanie zgody marketingowej to nowa decyzja z wersją dokumentu; nowa migracja `AccountRequests` (kolumna `granted`, `given_at` → `decided_at`, tabela `data_request` z unikalnym indeksem „jedno oczekujące żądanie danego rodzaju”). Eksport i usunięcie konta zapisywane jako żądania (realizacja w F8), usunięcie wymaga potwierdzenia w UI. Imię, hasło (z `revokeOtherSessions`) i „wyloguj wszędzie” idą przez API Better Auth z przeglądarki (limit prób, HIBP przy zmianie hasła); zgoda marketingowa i żądania — server actions → komendy modułu z `requirePermission`. Kryterium „403/404” spełniają testy `requirePermission` i `getAccountOverview` (cudze konto → `identity.not_found`). Zmiana e-maila poza F1 (wymaga wysyłki e-maili — F3).
- 2026-11-22 — Mapa ekranów F1 (`prototypes/konta-i-role/mapa-ekranow.md`, gałąź `cez/8a65024e`) przyjęta jako materiał: 11 ekranów s01–s11 ze stałymi identyfikatorami, folder prototypu `prototypes/konta-i-role/` w frontmatterze. Kryteria akceptacji dostają identyfikatory ekranów, a kryteria wynikające z mapy są dopisane w sekcji „Kryteria akceptacji”. Konta demo i scenariusze SC-01…SC-24 są **artefaktem prototypu, nie wymaganiem produktu** — nie przenosimy ich do specyfikacji.
- 2026-11-22 — **s10 (weryfikacja e-maila) wchodzi do F1** jako krok 8 planu: rejestracja już wysyła link (decyzje krok 3g i 5), a bez strony z tokenem link prowadzi donikąd. Zakres wysyłki bez zmian — port `EmailVerificationSender` z adapterem logującym, SES w E3-S8. Strony błędów 403/404 (s08, s09) też powstają w F1; w F1 link ze s08 prowadzi do `/konto` (student, mentor) albo `/admin`.
- 2026-11-22 — **s04 i s05 (reset hasła, ustawienie nowego hasła) poza F1** — wymagają wysyłki e-maili (decyzja z 2026-11-10, krok 5), `EmailSender` z SES powstaje w E3-S8, a kryteria tych ekranów są w `backlog.md` E3-S9 T2. Mapa ekranów opisywała je jako zakres F1 — to sprostowanie mapy, nie zmiana decyzji.
- 2026-11-22 — **s11 (ponowna akceptacja regulaminu) i stan „wersja regulaminu zmieniona” przy logowaniu poza F1** (Q6): w F1 zapisujemy tylko wersję dokumentu przy rejestracji. Ekran powstaje przy pierwszej realnej zmianie dokumentu — wtedy też wchodzi stan na logowaniu, bez osobnego modalu.
- 2026-11-22 — **S3 ograniczone do Q7**: sekcje „Metody płatności”, „Powiadomienia”, „Prywatność” i przycisk „Dodaj kartę” **nie wchodzą do F1** — metody płatności to F4 (L1), powiadomienia w aplikacji E3-S8, push L9. W prototypie mogą istnieć jako atrapa z dopiskiem „w prototypie nie działa”. Status żądania eksportu/usunięcia (oczekujące/gotowe/wygasłe) też poza F1 — realizacja w F8 (L5); w F1 tylko zapis żądania i toast.
- 2026-11-22 — **Konto ma jedną rolę w MVP** (`student` | `mentor` | `admin_*`). Przełączanie ról w nagłówku i konto z dwiema rolami są poza MVP (GAP-06 mapy); użytkownik, który chce się uczyć i mentorować, zakłada drugie konto. Poprawione w `kompas-mentoring/KONCEPCJA.md`: nowe założenie **Z10** (jedna rola na konto, drugie konto dla obu potrzeb), nagłówek bez „Zmień rolę”, model `User.role` zamiast `roles[]`, P4 z dopiskiem, że rola zostaje na koncie; plan design systemu (`packages/ui/POSTEP.md`) bez pozycji „Zmień rolę” w menu awatara. Brief nie opisuje modelu kont — bez zmian.
- 2026-11-22 — Stany z mapy dotyczące innych przepływów są przypisane do zadań w `backlog.md`, bo specyfikacje F3–F5 jeszcze nie istnieją (powstaną w E3-S1 i kolejnych): blokada „nieweryfikowany e-mail” w U1/U2 → E3-S4 T2 i E3-S9 T1; zmiana e-maila → E3-S9 T3 (już była); mentor `suspended` w U4/U5 → E3-S5 T2 i E3-S6; anulowanie sesji próbnej < 12 h → E3-S6 T1 (pytanie do właściciela); BLIK cykliczny → L1; dołączanie mentora w pokoju sesji → L2 i specyfikacja stacku (§flows F5).
- 2026-11-22 — Prototyp rewizji 001 (`prototypes/discovery/konta-i-role/revision-001/`, gałąź `cez/8a65024e`) dołączony razem z mapą i przejrzany. Jego założenia A-01, A-02, A-03, A-06, A-07, A-08, A-09, A-10 są zgodne z decyzjami wyżej i z kryteriami s01–s10. **Dwie rozbieżności do poprawy w prototypie, nie w specyfikacji:** (a) założenie **A-05** („użytkownik może mieć rolę student I mentor — przełącznik w nagłówku”) jest **odrzucone** decyzją z 2026-11-22 o jednej roli na konto — prototyp i README trzeba do tego dostosować; (b) README i mapa wpisują `Notice` (DS-15) jako brakujący komponent, a decyzja z 2026-11-22 mówi, że banery robimy `Alert`. Dodatkowo prototyp zakłada link 403 → U4/M2 (SC-16, SC-17), a w F1 te ekrany nie istnieją — kryterium [s08] mówi, że w F1 link prowadzi do `/konto` i `/admin`, a po E3-S5 i F2 do U4 i M2.
- 2026-11-22 — Weryfikacja prototypu: README deklaruje `not-run` (przejście przeglądarki i panelu 24 scenariuszy nie zostało wykonane), a `prototype.json` ma `verification: not-run`. Prototyp nie jest dowodem działania przepływu, dopóki ten krok nie zostanie wykonany — nie traktujemy go jako spełnienia kryteriów E2E z tej specyfikacji.
- 2026-11-22 — Uwagi z prototypu: recenzja w prototypie kompas-flow nie ma eksportu komentarzy (`public/review/comments.js` → `operations: []`, PR #60 bez komentarzy i recenzji na GitHubie), więc „uwagi z prototypu” czytamy z notatek „Czego nie rozstrzyga” przy 23 ekranach (`ScreenDef.notes`) i z README prototypu. **Z 24 notatek tylko dwie dotyczą F1:** P4 „polityka haseł i wymagane zgody do potwierdzenia w specyfikacji” jest już pokryte kryteriami [s02] (hasło ≥ 10, HIBP fail-closed, zgody wymagane/opcjonalne) i wymaganiem 1; S3 „zakres eksportu i retencja danych” jest pokryte kryterium [s06] w części F1 (zapis żądania), a zakres i realizacja eksportu należą do F8 (L5). Pozostałe 22 notatki to inne przepływy — pełna tabela przypisań w `.ai/specs/backlog.md` → „Pytania z notatek prototypu kompas-flow”. Dwie z nich warto znać tutaj, bo dotyczą wejścia do F1: prototyp potwierdza wybór terminu przez gościa przed logowaniem (U1, kryterium [s03]), a opłata serwisowa 3 zł i kod `KOMPAS10` z szarego prototypu nie mają wartości w KONCEPCJI — decyzja należy do F4 (L1), F1 tego nie dotyka.
- 2026-11-22 — **Implementacja zakończona (kroki 1–8, `status: implemented`).** Kroki 1–6 były już scalone w `main`; kroki 7–8 wdrożone na gałęzi `cez/5df27579` (commity `6ed860c` — 2FA adminów i seed, `e8f873b` — s10 oraz trasy 403/404 i `/mentor`) i potwierdzone ręcznie przez właściciela. Bramki lokalne zielone: `pnpm lint` (0 błędów), `pnpm typecheck` (7/7), `pnpm test` (4/4, core 62), `pnpm test:integration` (11), `pnpm build`, `pnpm test:e2e` (56, 360 i 1280 px). Do domknięcia przy scaleniu PR (bramki procesu, nie kod): zielony przebieg CI (integracyjne i E2E na runnerze) oraz przegląd człowieka modułu `identity` i migracji (§10.2). Zrzuty wzorcowe Playwright pozostają odłożone do pierwszego przebiegu w CI. Wniosek o zawodności runnerów subagentów cezar zapisano w `.ai/lessons.md` (2026-11-22).
