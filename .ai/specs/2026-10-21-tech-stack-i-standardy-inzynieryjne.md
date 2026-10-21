---
title: Tech stack, architektura, standardy inżynieryjne i wzorce projektowe — Kompas MVP
status: in-progress      # draft | approved | in-progress | implemented | archived
created: 2026-10-21
implemented:
related:
  - kompas-mentoring/KONCEPCJA.md
  - kompas-mentoring/mockupy/src/domain.ts
  - AGENTS.md
  - .ai/specs/2026-10-21-f0-szkielet-i-harness.md
---

# Tech stack, architektura, standardy inżynieryjne i wzorce projektowe — Kompas MVP

## Kontekst i cel

Kompas to marketplace mentoringu 1:1 (benchmark: Preply): wyszukiwarka mentorów, profil z wideo, sesja próbna, plan N sesji/tydzień rozliczany co 4 tygodnie, saldo sesji u mentora, przekładanie z regułą 12 h, pokój wideo, wiadomości, cele i notatki (wyróżnik), wypłaty dla mentorów, weryfikacja i spory. Zakres funkcjonalny opisuje `kompas-mentoring/KONCEPCJA.md` (22 ekrany, UC1–UC18, model danych, ryzyka).

Ta specyfikacja ustala **jak** budujemy MVP: stack, architekturę, wzorce, standardy kodu, testów i procesu. Jest wiążąca dla każdej kolejnej specyfikacji funkcjonalnej i dla agentów AI (Claude Code, Codex przez cezar + skille `open-mercato/skills`). Każdy wybór ma uzasadnienie i fallback, a stan rynku sprawdzono 2026-10-21 (źródła na końcu).

**Siły projektowe (drivers), w kolejności ważności:**

1. **Pieniądze i czas muszą się zgadzać.** Podwójne rezerwacje, podwójne obciążenia, zgubione webhooki i błędy stref czasowych (DST) to najdroższe błędy tego produktu.
2. **Mały zespół + agenci AI.** Kod ma być przewidywalny, z silnymi „sensorami” (typy, lint, testy architektury), żeby agent dostawał szybki, jednoznaczny feedback.
3. **Polska/UE.** PLN, BLIK, RODO, KSeF, DAC7, DSA, Omnibus, EAA. Dane w UE.
4. **Mało operacji.** Usługi zarządzane tam, gdzie nie są rdzeniem produktu (płatności, KYC, wideo, e-mail).
5. **Wymienialność dostawców.** Każdy zewnętrzny dostawca za interfejsem (port), żeby zmiana nie przepisywała domeny.

## Zakres

- **W zakresie:** wybór technologii i usług, architektura systemu i repozytorium, wzorce domenowe (rezerwacje, płatności, saldo, prowizje), standardy API, kodu, frontendu, bazy, bezpieczeństwa, testów, CI/CD, obserwowalności, proces pracy z agentami, implikacje regulacyjne dla techniki, plan faz F0–F8.
- **Poza zakresem:** szczegółowe specyfikacje funkcji (osobne pliki w `.ai/specs/` per faza), identyfikacja wizualna, model finansowy prowizji, opinie prawne i podatkowe (lista pytań w „Open Questions”).

---

## 0. Najważniejsze wnioski z researchu (zmieniają KONCEPCJA.md)

| # | Ustalenie | Konsekwencja |
|---|---|---|
| W1 | Platforma, która przyjmuje pieniądze ucznia i trzyma je dla mentora, zbliża się do **usługi płatniczej (PSD2, licencja KNF)**. | Pieniądze trzyma wyłącznie licencjonowany operator (Stripe). „Saldo” w Kompasie to **przedpłacone kredyty na sesje**, nie portfel; nie da się go wypłacić, a zwrot idzie na pierwotną metodę płatności. Opinia prawna przed startem (Q3). |
| W2 | Stripe Connect pozwala trzymać środki przed transferem do mentora **maks. 90 dni**. | Otwarte pytanie z KONCEPCJA §6 p. 3 („czy saldo wygasa?”) ma twardą granicę: niewykorzystane kredyty muszą wygasać / być zwracane przed 90 dniem (propozycja: 60 dni od zakupu, przypomnienia od 45. dnia). Wstrzymanie planu nie może zamrozić kredytów na dłużej (Q4). |
| W3 | **BLIK cykliczny** działa w Stripe Billing (Model O, off-session), ale maks. **2000 zł za obciążenie** i nie we wszystkich bankach. **Przelewy24 nie obsługuje subskrypcji**, a kategoria „edukacja” (MCC 8299) jest dla P24 ograniczona. | Plany droższe niż 2000 zł / 4 tyg. → tylko karta. P24 tylko dla płatności jednorazowych i dopiero po potwierdzeniu kategorii ze Stripe (Q5). Checkout musi obsłużyć `recurring_not_supported_by_bank`. |
| W4 | **KSeF** obowiązkowy dla większości firm od 1.04.2026 (kary od 2027). | Faktury prowizyjne dla mentorów-przedsiębiorców muszą iść przez KSeF. Integracja z systemem fakturowym z API KSeF (inFakt / Fakturownia) za portem `InvoicingProvider`. Model „kto komu fakturuje” do decyzji doradcy (Q6). |
| W5 | **DAC7** obejmuje platformy usług osobistych; próg de minimis nie dotyczy usług. | Onboarding mentora (M1) zbiera: adres, TIN + kraj, datę urodzenia, NIP/REGON (JDG), IBAN. Raport roczny DPI do 31 stycznia. Blokada wypłat po 2 nieskutecznych przypomnieniach. |
| W6 | **Omnibus** (upnpr): trzeba informować, czy i jak opinie są weryfikowane. | Opinię może dodać tylko uczeń po **ukończonej i opłaconej** sesji (już w U7), plakietka „zweryfikowana sesja” + publiczna strona zasad opinii. |
| W7 | **EAA** (dostępność) obejmuje usługi e-commerce od 28.06.2025; mikroprzedsiębiorca jest zwolniony. | Budujemy od początku pod **WCAG 2.2 AA** (zwolnienie znika wraz ze wzrostem; to też wymóg dla klientów B2B w v2). |
| W8 | **Saldo w sesjach** (mockup: `floor(sessions × fromRate / toRate)`) gubi wartość przy przeniesieniu do tańszego/droższego mentora i liczy kwoty na liczbach zmiennoprzecinkowych. | Kredyt przechowujemy jako **wartość pieniężną w groszach** (prepaid), a liczbę sesji wyliczamy. Przeniesienie salda = przeniesienie kwoty; reszta niepełnej sesji zostaje jako kredyt (Q7). |
| W9 | Cal.com Platform jest zamknięty dla nowych klientów; Google Calendar wymaga weryfikacji aplikacji OAuth (zakresy „sensitive”, bez audytu CASA). | Silnik slotów budujemy sami (to rdzeń produktu). Synchronizacja tylko z Google w MVP, Outlook w v1.1. Weryfikację OAuth Google zgłaszamy wcześnie (trwa tygodnie). |
| W10 | KONCEPCJA rozlicza sesję po 48 h, ale pozwala zgłosić problem do 72 h po sesji (U5) i daje drugiej stronie 48 h na stanowisko (F6). Transfer do mentora po 48 h oznaczałby cofanie przelewów przy sporach. | Transfer do mentora dopiero po zamknięciu okna zgłoszeń (**72 h** po sesji) i tylko gdy nie ma otwartego sporu. Status „rozliczona” po 48 h zostaje dla UI, ale pieniądze idą później. |
| W11 | Najdroższy plan z KONCEPCJA: 5 × 60 min × 4 tyg. × 1000 zł = **20 000 zł** w jednym obciążeniu. | Metody płatności w checkoutcie zależą od kwoty planu (BLIK ≤ 2000 zł). Rozważyć limit kwoty jednego okresu albo rozliczanie co tydzień dla drogich planów (Q11). |

---

## 1. Tech stack (decyzje)

Wersje: aktualne stabilne na 2026-10-21, przypięte dokładnie w `package.json` (bez `^`), aktualizowane przez Renovate.

### 1.1 Rdzeń aplikacji

| Warstwa | Wybór | Wersja | Dlaczego | Fallback / odrzucone |
|---|---|---|---|---|
| Runtime | **Node.js 24 LTS** na start | 24.x | Stabilny LTS wspierany przez wszystkie narzędzia; Node 20 ma EOL od 30.04.2026. | **Node 26** (Active LTS od X 2026, natywny Temporal) — przejście w F0 lub zaraz po, gdy obrazy bazowe i Next.js oficjalnie go wspierają. |
| Język | **TypeScript 6** (tryb ultra-strict, §6.1) | 6.x | Jeden kompilator dla `next build`, typescript-eslint i edytora. TS 7 (`tsgo`, ~10× szybszy) nie ma jeszcze stabilnego API dla typescript-eslint, a dwa kompilatory obok siebie mogą się różnić w diagnozach. | TS 7 jako dodatkowy szybki typecheck w CI/hookach po wydaniu TS 7.1 z API. |
| Framework web | **Next.js 16 (App Router) + React 19** | 16.4.x / 19.3.x | Publiczne strony SEO (wyszukiwarka, profile) + aplikacja zalogowana w jednym repo; Cache Components (`"use cache"`) do profili; `proxy.ts` na runtime Node; Turbopack stabilny. | TanStack Start 1.0 (stabilny od 13.10.2026 — za młody na rdzeń SEO), React Router 8. |
| Kontrakt API | **oRPC** + **zod 4** | 1.15.x / 4.6.x | Jeden schemat zod → walidacja, typowany klient i OpenAPI `/api/v1` (aplikacje mobilne v2, partnerzy). Montowany w route handlerach Next.js. | `zod-openapi` + własne handlery. Odrzucone: ts-rest (brak wydań od 03.2025). |
| ORM | **MikroORM 7** (+ Kysely przez `em.getKysely()` do zapytań raportowych i wyszukiwania) | 7.2.x | Unit of Work, identity map, `@Version` (optimistic locking), `em.transactional`, blokady pesymistyczne — pasuje do salda, rezerwacji i ledgera. Spójny ze stackiem z kursu i z Open Mercato. | Drizzle (1.0 wciąż RC), Prisma 7 (brak UoW). |
| DI | **Awilix** | aktualny | Kontener z zakresem per request i per job; wymiana adaptera = jedna rejestracja. Wzorzec `di.ts` per moduł jak w Open Mercato. | — |
| Baza | **PostgreSQL 17** | 17.x | Exclusion constraints (`tstzrange` + `btree_gist`) przeciw podwójnym rezerwacjom, transakcje, JSONB, FTS, kolejka zadań w tej samej bazie. | — |
| Zadania w tle | **pg-boss** | 12.x | Kolejka w Postgresie: zadanie dodawane **w tej samej transakcji** co zmiana domenowa (przez opcję `db` pg-boss przekazującą klienta transakcji MikroORM) — to jest nasz outbox, bez osobnej tabeli i relay. Cron, retry z backoffem, singleton/debounce. Bez Redisa. | Graphile Worker (pre-1.0), Inngest / Trigger.dev (zarządzane, gdy potrzebne długie workflow). |
| Auth | **Better Auth** z adapterem **Kysely** na wspólnej puli `pg`, tabele w schemacie `identity` | 1.7.x | E-mail + hasło, Google, LinkedIn (generic OIDC), sesje w bazie z cookie HttpOnly, 2FA (TOTP), role; passkeys w v1.1. Auth.js jest w trybie utrzymania (przejęty przez zespół Better Auth). Dane użytkowników u nas (RODO). Better Auth nie ma adaptera MikroORM: SQL wygenerowany przez jego CLI commitujemy jako migrację modułu `identity`, a MikroORM mapuje `User` tylko do odczytu. | Clerk / WorkOS (dane poza UE, koszt per MAU). |
| Czas | **Temporal API** (`temporal-polyfill`) w domenie; `date-fns` 4 + `@date-fns/tz` do formatowania w UI | polyfill 1.0.x | Jednoznaczne `ZonedDateTime` i obliczenia przez DST. Safari nie ma jeszcze natywnego Temporal, Node 24 też nie — polyfill używa natywnej implementacji, gdy jest. | Luxon. |
| Pieniądze | **Dinero.js 2** (BigInt entry point) + typ `Money` | 2.0.x | Stabilne od 03.2026; `allocate` do podziału prowizji bez gubienia groszy, kontrola walut w typach. | Własne funkcje na `bigint`. |
| Wynik operacji | **neverthrow** (`Result<T, E>`) | aktualny | Mały, czytelny dla agentów; oczekiwane błędy domenowe jako wartości. | Effect (v4 jeszcze w RC, inny styl całej bazy kodu) — do ponownej oceny po stabilnym v4. |

### 1.2 Frontend

| Obszar | Wybór | Uwagi |
|---|---|---|
| Style i komponenty | **Tailwind CSS 4** + **shadcn/ui** (wariant **Base UI**) | Komponenty w repo (kod jest nasz, agent może je czytać). Tokeny kolorów jako CSS variables, tryb jasny/ciemny. |
| Formularze | **react-hook-form** + `@hookform/resolvers/zod` | Te same schematy zod co API (`packages/contracts`). |
| Dane po stronie klienta | **TanStack Query 5** | Tylko dla widoków interaktywnych (siatka slotów, czat, kalendarz mentora). Reszta — React Server Components. |
| i18n | **next-intl 4** (ICU) | MVP tylko PL, ale **wszystkie teksty UI w plikach komunikatów** od początku: polska odmiana (one/few/many), waluty, daty w strefie użytkownika. |
| Wideo w pokoju sesji | `@livekit/components-react` | DeviceCheck, ekran, reconnect. |
| Ikony | lucide-react | — |

### 1.3 Usługi zewnętrzne (każda za portem — §4.2)

| Port | Dostawca MVP | Dlaczego | Fallback |
|---|---|---|---|
| `PaymentProvider`, `PayoutProvider`, `KycProvider` | **Stripe Connect (Accounts v2)**, model *separate charges and transfers*; Stripe Billing dla planów | Jedyna zweryfikowana opcja z kartą, BLIK, **BLIK cyklicznym**, KYC mentorów, wstrzymaniem środków i wypłatami w jednym API. SCT pasuje do „pobierz → trzymaj → przelej mentorowi po zamknięciu okna sporu (W10)”. Mentor = konto z konfiguracją `recipient`, dashboard Express, `losses_collector: application` (chargebacki pokrywa platforma — konto w ledgerze). Przycisk „Wypłata” w M5 wymaga ręcznego harmonogramu wypłat na koncie mentora (limity do sprawdzenia w F7). | PayU Marketplace (KYC osób fizycznych, BLIK recurring przez aneks; retry i wstrzymanie środków po naszej stronie). |
| `VideoProvider` | **LiveKit Cloud** (plan Ship → Scale przy wymogu przypięcia mediów do UE) | ~275 USD/mies. przy 2000 sesji × 45 min; open-source serwer (self-host we Frankfurcie jako wyjście); webhooki `participant_joined/left` jako dowód w sporach. | Daily (~680 USD/mies.), Twilio Video (EOL odwołany). |
| `RealtimePublisher` | **Ably** | Postgres zostaje źródłem prawdy wiadomości, Ably tylko rozgłasza zdarzenia; brak własnej infrastruktury socketów. Darmowy próg 6 mln wiadomości. | Pusher; własny serwis WS (Hono + `ws`) w procesie `worker`. |
| `CalendarSync` | **Google Calendar API** (`calendar.freebusy`, `calendar.events.owned`), watch + sync przyrostowy + kontrola freebusy przed potwierdzeniem | Najwęższe zakresy, bez audytu CASA. | Nylas (gdy wcześnie pojawi się popyt na Outlook). |
| `FileStorage` | **Cloudflare R2** z jurysdykcją **EU** (presigned upload z przeglądarki) | Zero opłat za transfer. Jurysdykcji nie da się zmienić po utworzeniu bucketu. | AWS S3 eu-central-1. |
| `VideoHosting` (wideo-wprowadzenie mentora) | **Link YouTube/Vimeo** w MVP (KONCEPCJA M1 to dopuszcza); upload MP4/MOV przez **Bunny Stream** (Frankfurt) w v1.1 | Bez transkodowania MOV nie odtworzy się pewnie na wszystkich telefonach, a Bunny to najtańsza opcja w UE z darmowym kodowaniem. | Cloudflare Stream, Mux. |
| `EmailSender` | **Amazon SES eu-central-1** + **React Email** | Dane w UE, najtańszy. | Brevo (uwaga z projektu Legia: Brevo domyślnie wymusza białą listę IP dla klucza API — przy Cloud Run trzeba ją wyłączyć dla klucza). |
| `InvoicingProvider` | **inFakt** albo **Fakturownia** (API z wysyłką do KSeF) | Nie budujemy własnej integracji z KSeF. Wybór po decyzji księgowej (Q6). | wFirma. |
| `MentorSearch` | **Postgres**: widok wyszukiwania + `unaccent` + `pg_trgm` + słownik synonimów; filtry na indeksach GIN | Przy 1–10 tys. mentorów wystarczy. Brak polskiego stemmera w standardowym Postgresie. | ParadeDB `pg_search` (stemmer polski, BM25) lub Meilisearch, gdy liczba mentorów / jakość trafień tego wymaga. |
| `Analytics` | **PostHog EU** w trybie cookieless (`on_reject`) | Lejek: wyszukiwanie → próbna → plan. Feature flagi z PostHog (bez warstwy OpenFeature w MVP). | Plausible (tylko marketing). |

### 1.4 Infrastruktura

| Element | Wybór | Uwagi |
|---|---|---|
| Uruchomienie | **Jeden obraz Dockera, dwa procesy**: `web` (Next.js standalone) i `worker` (pg-boss: zadania, cron) | Ta sama domena i ten sam kontener DI w obu procesach. Realtime przez Ably, więc trzeci proces (`ws`) niepotrzebny w MVP. |
| Hosting | **Google Cloud Run, europe-west3 (Frankfurt)**: `web` jako service z autoskalowaniem; `worker` jako **worker pool** (albo service z endpointem `/health`, `min-instances=1`, rozliczanie per instancja) z obsługą SIGTERM (dokończenie bieżących zadań) | Kontenery bez zarządzania serwerami, OIDC z GitHub Actions, Secret Manager. Region obok bazy (latencja ORM). Warszawa (europe-central2) jako alternatywa razem z Cloud SQL Warszawa (Q8). | Render (Frankfurt): najprostszy PaaS. Odrzucone: Vercel dla workera (limity czasu funkcji), AWS App Runner (wycofywany). |
| Baza | **Neon** (AWS eu-central-1, Frankfurt), produkcja bez scale-to-zero, PITR; cel **RPO ≤ 5 min, RTO ≤ 4 h** | **Gałąź bazy na każdy PR i każdy worktree agenta** — preview i testy e2e na danych seed. `web` łączy się przez pooler i tylko **wysyła** zadania (pg-boss z `supervise: false`, `schedule: false`); wyłącznie `worker` ma połączenie bezpośrednie (pobieranie zadań, cron, utrzymanie). Inaczej autoskalowane instancje `web` wyczerpią limit połączeń. | Cloud SQL (Warszawa), PlanetScale Postgres. |
| Sekrety | **GCP Secret Manager** | Walidacja zmiennych środowiskowych przy starcie (zod). | Infisical (EU). |
| Błędy | **Sentry (region EU)**, Session Replay z domyślnym maskowaniem | — | — |
| Logi i trasy | **pino** (JSON, redakcja PII) → Cloud Logging; śledzenie przez Sentry Tracing | Pełne OpenTelemetry + Grafana Cloud EU dopiero, gdy Sentry przestanie wystarczać. | Axiom, Better Stack. |
| Rate limiting | Postgres (token bucket) w MVP | Logowanie, rejestracja, nowe wątki (5/dobę), checkout. | Upstash Ratelimit EU / Arcjet. |

### 1.5 Narzędzia deweloperskie

| Obszar | Wybór |
|---|---|
| Menedżer pakietów / monorepo | **pnpm** (≥ 11) + **Turborepo** |
| Format i szybki lint | **Biome 2** (formatowanie, podstawowe reguły, import sorting) |
| Lint typowany i architektura | **ESLint 10** (flat config) + **typescript-eslint `strict-type-checked`** + **eslint-plugin-boundaries**; **dependency-cruiser** w CI (cykle, granice modułów) |
| Testy | **Vitest 5**, **Testcontainers** (Postgres), **fast-check**, **Playwright 1.6x**; **Stryker** (mutacje) dopiero od F8, tylko dla `ledger` i polityk rozliczeń |
| Martwy kod | **Knip** |
| Zależności | **Renovate** (grupowanie, `minimumReleaseAge` 3 dni, pinowanie akcji GitHub po SHA) + Socket.dev na PR |
| Git hooks | **lefthook** (Biome + typecheck zmienionych pakietów + commitlint) |
| Commity | **Conventional Commits** + commitlint |
| Storybook | Nie w MVP (koszt utrzymania > zysk przy małym zespole); stany komponentów pokazujemy w Playwright + mockupach. |

---

## 2. Architektura systemu

### 2.1 Widok z lotu ptaka

```
                     Przeglądarka (mobile-first, PWA w v1.1)
                         │  HTML/RSC        │ WebSocket (Ably)      │ WebRTC
                         ▼                  │                       ▼
┌──────────────── Cloud Run: web ─────────────────┐          LiveKit Cloud
│ Next.js App Router                              │                ▲
│  ├─ strony publiczne (RSC, "use cache")         │                │ webhooki
│  ├─ aplikacja zalogowana (RSC + Client)         │                │
│  ├─ /api/v1/* (oRPC → OpenAPI)                  │◀─── webhooki Stripe, LiveKit, Google
│  ├─ Server Actions (cienkie adaptery)           │
│  └─ /api/auth/* (Better Auth)                   │
│            │ wywołania serwisów aplikacyjnych   │
│            ▼                                    │
│  packages/core (moduły domenowe, kontener DI)   │
└────────────┬────────────────────────────────────┘
             │ SQL (MikroORM / Kysely)                ┌──── Cloud Run: worker ────┐
             ▼                                        │ pg-boss: zadania, cron    │
        PostgreSQL (Neon) ◀───────────────────────────│ zdarzenia → Ably, e-mail, │
        ├─ schematy per moduł                         │   Stripe, KSeF            │
        ├─ inbox / idempotency_keys                   │ packages/core (ten sam)   │
        └─ pgboss.* (kolejka = outbox)                └───────────────────────────┘
```

**Modułowy monolit**, nie mikroserwisy: jedna baza, jedno wdrożenie, granice modułów pilnowane przez narzędzia (§2.4). Wydzielenie modułu do osobnej usługi będzie możliwe później bez zmian w domenie, bo moduły komunikują się przez publiczne API i zdarzenia.

### 2.2 Struktura repozytorium

```
/
├── AGENTS.md, CLAUDE.md, SDLC.md, CODE_REVIEW.md, BACKWARD_COMPATIBILITY.md
├── .ai/                         # specyfikacje, runy, lekcje (AGENTS.md), agentic.config.json
├── docs/decisions/              # ADR (MADR 4.0): NNNN-tytul.md
├── apps/
│   ├── web/                     # Next.js: app/, proxy.ts, instrumentation.ts, messages/pl.json
│   └── worker/                  # entrypoint pg-boss, rejestracja handlerów, cron
├── packages/
│   ├── core/                    # moduły domenowe (niżej) + kontener DI + wspólne prymitywy
│   ├── contracts/               # schematy zod, routery oRPC (kontrakty), typy zdarzeń
│   ├── ui/                      # komponenty shadcn + własne (MentorCard, SlotGrid…)
│   ├── testing/                 # buildery danych, fake'i portów, fixture'y Playwright, FakeClock
│   └── config/                  # tsconfig, eslint, biome, vitest presets
├── kompas-mentoring/            # koncepcja i mockupy (źródło tekstów, stanów i danych seed)
└── docker-compose.yml           # Postgres 17 + rozszerzenia do pracy lokalnej
```

### 2.3 Moduły (bounded contexts)

| Moduł | Odpowiada za | UC | Kluczowe agregaty |
|---|---|---|---|
| `identity` | Konta, role, sesje logowania (Better Auth), zgody, RODO (eksport, usunięcie) | UC3, S3 | User, Consent |
| `catalog` | Profil mentora, onboarding, kategorie/tagi, wyszukiwarka, ulubione, opinie i oceny (tylko po zweryfikowanej sesji) | UC1, UC2, UC7, UC12, UC18 | MentorProfile, Review |
| `scheduling` | Reguły dostępności, wyjątki, sync z Google, **silnik slotów**, blokady (hold), rezerwacje, przełożenia, anulowania, no-show, auto-rozliczenie | UC4, UC9, UC10, UC13, UC14 | AvailabilityRule, CalendarConnection, Booking |
| `billing` | Checkout, płatności, plany (subskrypcje), zwroty, kody rabatowe, chargebacki, webhooki Stripe | UC4, UC8 | Payment, Subscription, PromoCode |
| `ledger` | Kredyty ucznia (partie z datą ważności), rezerwacje kredytu, należności mentora, prowizje — księga podwójna | UC8, UC11, UC16 | LedgerAccount, LedgerTransaction, CreditLot |
| `payouts` | Transfery do mentorów, progi prowizji, wypłaty, dane DAC7, faktury przez dostawcę z KSeF | UC16 | Payout, PayoutProfile, InvoiceRecord |
| `sessions` | Pokój wideo (tokeny), obecność (zdarzenia dołączenia/wyjścia), wspólne notatki | UC6 | SessionRoom, PresenceEvent |
| `mentoring` | Cele, kamienie milowe, notatki po sesji, zadania (wyróżnik Z8) | UC15 | Goal, SessionNote, ActionItem |
| `messaging` | Wątki, wiadomości, załączniki, wykrywanie kontaktu poza platformą, limity antyspam | UC5, S1 | Thread, Message |
| `trust` | Kolejka weryfikacji mentorów, spory, moderacja (DSA notice & action), log audytu, ręczne korekty z audytem | UC12, UC17, A1, A2 | MentorApplication, Dispute, AuditEntry |
| `notifications` | Powiadomienia in-app, e-mail, przypomnienia (24 h, 1 h), preferencje | S2 | Notification |

Moduły nie współdzielą tabel; odwołanie do obiektu z innego modułu to identyfikator (typ markowany, §6.3). **Wyjątek:** klucze obce do `identity.user` są dozwolone (integralność danych wszystkich modułów zależy od użytkownika). Dane do odczytu z innych modułów pochodzą z widoków SQL (§4.8) lub publicznego zapytania modułu.

### 2.4 Budowa modułu i reguły zależności

```
packages/core/src/modules/scheduling/
├── AGENTS.md                # 10–30 linii: język domeny, niezmienniki, „wzoruj się na…”
├── index.ts                 # JEDYNE publiczne API modułu (komendy, zapytania, typy zdarzeń)
├── di.ts                    # rejestracje Awilix modułu
├── domain/                  # czysty TypeScript: zero I/O, zero importów z infrastructure/
│   ├── booking.entity.ts
│   ├── booking.state.ts     # tabela przejść stanu
│   ├── policies/            # slotsFor, canCancelFree, canJoin, settleAt… (czyste funkcje)
│   ├── booking.events.ts
│   └── booking.errors.ts    # unia błędów z polem `code`
├── application/             # przypadki użycia: komendy i zapytania, transakcje, autoryzacja
│   ├── create-hold.command.ts
│   ├── cancel-booking.command.ts
│   └── list-my-bookings.query.ts
├── infrastructure/          # repozytoria MikroORM, mapowanie błędów SQL (23P01 → SlotTaken)
├── api/                     # router oRPC modułu (wejście HTTP → komenda)
├── jobs/                    # handlery pg-boss modułu
└── migrations/
```

Reguły (wymuszane przez `eslint-plugin-boundaries` — agent widzi błąd od razu w edytorze i w CI; `dependency-cruiser` tylko w CI do wykrywania cykli; komunikaty mówią agentowi, jak naprawić błąd):

1. `domain/` importuje tylko `domain/` własnego modułu i `packages/core/shared/domain` (Money, Clock, Result, typy ID).
2. `application/` importuje `domain/` i **porty**; nigdy adaptery.
3. Inny moduł importuje wyłącznie z `modules/<x>/index.ts`.
4. `apps/web` i `apps/worker` importują tylko `index.ts` modułów i `contracts`; nie dotykają encji ani EntityManagera.
5. Zakaz cykli między modułami. Gdy moduł A potrzebuje reakcji modułu B — zdarzenie domenowe, nie wywołanie w drugą stronę.

### 2.5 Next.js — podział odpowiedzialności

- **React Server Components domyślnie.** `"use client"` tylko na liściach z interakcją (SlotGrid, czat, edytor dostępności, pokój).
- **Route handlery `/api/v1`** to kontrakt systemu (oRPC). **Server Actions** to cienkie adaptery formularzy, które wołają ten sam serwis aplikacyjny co API — zero logiki biznesowej w obu.
- **Strony publiczne** (`/`, `/mentorzy`, `/mentorzy/:id`): Cache Components z tagami (`mentor:{id}`), unieważniane zdarzeniem `catalog.mentor_profile_updated.v1`. Kalendarz dostępności na profilu ładowany dynamicznie (nie z cache).
- **`proxy.ts`**: tylko strażnicy tras (zalogowany / rola / status profilu mentora → przekierowanie do M1), nagłówki bezpieczeństwa, nonce CSP **tylko dla tras zalogowanych** (nonce per żądanie wymusza renderowanie dynamiczne, więc na stronach publicznych CSP opiera się na hashach i SRI). Autoryzacja do zasobów zawsze w warstwie aplikacji, nie w proxy.

---

## 3. Model danych — standardy bazy

- **Schemat PostgreSQL per moduł** (`booking.*`, `ledger.*`…); migracje generowane z encji MikroORM, przeglądane i commitowane w `modules/<x>/migrations/`. Fragmenty, których ORM nie modeluje (exclusion constraints, indeksy częściowe, funkcje), jako ręczne SQL w tej samej migracji.
- **Klucze:** UUID v7 (sortowalne w czasie) generowane w aplikacji; w API jako opaque string.
- **Nazwy:** `snake_case`, tabele w liczbie pojedynczej (`booking`), kolumny czasu z sufiksem `_at`, flagi z prefiksem `is_`.
- **Czas:** wyłącznie `timestamptz` (UTC); reguły dostępności mentora w czasie lokalnym + kolumna `time_zone` (IANA, np. `Europe/Warsaw`).
- **Pieniądze:** `bigint` w groszach + `currency char(3)`; nigdy `numeric` z ułamkami ani `float`.
- **Współbieżność:** kolumna `version` (optimistic locking) na agregatach edytowanych przez kilka stron (Booking, Subscription, MentorProfile); konflikt → HTTP 409.
- **Usuwanie:** brak „soft delete” w domenie; stany końcowe w maszynie stanów (`cancelled`, `archived`). Usunięcie konta (RODO) = anonimizacja danych osobowych przy zachowaniu zapisów księgowych (obowiązek przechowywania dokumentów).
- **Audyt:** `trust.audit_entry` (append-only) dla decyzji admina, zmian salda, zwrotów, zmian ról.
- **Lokalnie:** `docker compose up -d` (Postgres 17 z `btree_gist`, `unaccent`, `pg_trgm`), `pnpm db:migrate`, `pnpm db:seed` (dane z `kompas-mentoring/mockupy/src/mocks.ts`).

---

## 4. Wzorce projektowe

### 4.1 Reguły domenowe jako czyste funkcje (kontynuacja `mockupy/src/domain.ts`)

Wszystkie reguły z KONCEPCJA §5 i z mockupów przechodzą do `domain/policies/` jako czyste funkcje z jawnie wstrzykniętym czasem (`now: Temporal.Instant`) — **nigdy** `Date.now()` ani `new Date()` w domenie (reguła lint). Przykłady: `canCancelFree`, `canJoin`, `commissionRate(hoursCompleted)`, `slotsFor(rules, exceptions, bookings, tz, range)`, `autoAcceptDeadline`, `settleAt` (koniec sesji + 72 h, W10), `creditExpiresAt`, `paymentMethodsFor(amount)` (W11), `detectOffPlatformContact`. Stałe biznesowe (12 h, 10 min, 48 h, progi prowizji) w jednym pliku `policies/config.ts` modułu, z odnośnikiem do decyzji (Z2–Z5).

### 4.2 Porty i adaptery (hexagonal) dla dostawców

```ts
// packages/core/src/modules/sessions/domain/ports/video-provider.ts
export interface VideoProvider {
  createRoom(input: { sessionId: SessionId; expiresAt: Temporal.Instant }): Promise<Result<RoomRef, VideoError>>;
  issueJoinToken(input: { room: RoomRef; userId: UserId; role: 'student' | 'mentor' }): Promise<Result<JoinToken, VideoError>>;
  verifyWebhook(req: RawWebhook): Result<ProviderEvent[], WebhookError>;
}
```

- Port należy do modułu, który go potrzebuje (domena definiuje, czego chce).
- Każdy port ma: adapter produkcyjny (`LiveKitVideoProvider`), **fake w pamięci** w `packages/testing` oraz wspólny **zestaw testów kontraktowych** uruchamiany na obu.
- Adapter tłumaczy webhooki dostawcy na zdarzenia wewnętrzne (anti-corruption layer). Typy dostawcy (Stripe, LiveKit) nie wychodzą poza `infrastructure/`.

### 4.3 Maszyny stanów (tabela przejść)

Agregaty z cyklem życia mają typowaną tabelę przejść i wyczerpujący `switch`; stan w bazie to zwykły enum. XState tylko do złożonych przepływów UI (np. checkout z 3DS), nigdy jako źródło prawdy stanu w bazie.

Szkic maszyny `Booking` (zastępuje osobną encję `BookingHold` i listę statusów z KONCEPCJA §5 — do przeniesienia do KONCEPCJA przy akceptacji):

```ts
const transitions = {
  // wspólny początek: blokada terminu na 10 min
  hold:            { checkout_started: 'pending_payment',          // sesja próbna / pojedyncza
                     confirmed_with_credit: 'scheduled',           // plan: rezerwacja kredytu w tej samej transakcji
                     hold_expired: 'expired' },
  pending_payment: { payment_succeeded: 'requested', hold_expired: 'expired' },
  // tylko sesja próbna wymaga akceptacji mentora (M2)
  requested:       { mentor_accepted: 'scheduled', auto_accepted: 'scheduled',
                     mentor_declined: 'cancelled', calendar_conflict: 'cancelled' },
  scheduled:       { started: 'in_progress',                       // pierwsza obecność w pokoju (LiveKit), nie zegar
                     rescheduled: 'scheduled',
                     cancelled_free: 'cancelled',                  // ≥ 12 h: kredyt wraca
                     cancelled_late: 'late_cancelled',             // < 12 h: kredyt przepada (Z4)
                     cancelled_by_mentor: 'cancelled',
                     mentor_no_show: 'no_show_mentor', student_no_show: 'no_show_student' },
  in_progress:     { ended: 'completed', mentor_no_show: 'no_show_mentor', student_no_show: 'no_show_student' },
  completed:       { dispute_opened: 'disputed', settled: 'settled' },
  late_cancelled:  { dispute_opened: 'disputed', settled: 'settled' },
  no_show_student: { dispute_opened: 'disputed', settled: 'settled' },
  disputed:        { resolved_no_refund: 'settled', resolved_refund: 'refunded' },
  no_show_mentor: {}, cancelled: {}, expired: {}, settled: {}, refunded: {},
} as const satisfies Record<BookingStatus, Partial<Record<BookingEvent, BookingStatus>>>;
```

- `settled` następuje w `settleAt` = koniec sesji + 72 h (W10), tylko bez otwartego sporu. Dla UI „rozliczona” po 48 h pozostaje etykietą, nie stanem.
- `auto_accepted`: termin `autoAcceptDeadline = min(utworzenie + 24 h, start − 2 h)`, i tylko gdy freebusy Google mentora nie pokazuje konfliktu (inaczej `calendar_conflict` → zwrot 100% + 3 podobnych mentorów, F1).
- No-show: zgłoszenie po 10 min (przycisk w U6) potwierdzane zdarzeniami obecności; bez potwierdzenia → spór.

Maszyny do zdefiniowania w specyfikacjach faz: `Booking`, `Payment`, `Subscription` (`active | paused | past_due | cancelled`), `MentorProfile` (`draft → submitted → changes_requested | approved | rejected | suspended`), `Dispute`, `Payout`.

### 4.4 Rezerwacja bez podwójnego zajęcia slotu

Blokada slotu (`hold`) i rezerwacja to wiersze **tej samej tabeli** objęte jednym ograniczeniem wykluczającym:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
-- during = tstzrange(starts_at, ends_at + bufor mentora, '[)')  -- przedział półotwarty
ALTER TABLE scheduling.booking
  ADD CONSTRAINT booking_mentor_no_overlap
  EXCLUDE USING gist (mentor_id WITH =, during WITH &&)
  WHERE (status IN ('hold', 'pending_payment', 'requested', 'scheduled', 'in_progress'));

-- uczeń też nie może mieć dwóch sesji naraz (u różnych mentorów)
ALTER TABLE scheduling.booking
  ADD CONSTRAINT booking_student_no_overlap
  EXCLUDE USING gist (student_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
  WHERE (status IN ('hold', 'pending_payment', 'requested', 'scheduled', 'in_progress'));

-- maks. jedna „żywa” lub odbyta sesja próbna na parę uczeń–mentor;
-- wygasła, anulowana lub odrzucona próbna nie blokuje kolejnej próby (F1)
CREATE UNIQUE INDEX booking_one_trial_per_pair
  ON scheduling.booking (student_id, mentor_id)
  WHERE type = 'trial'
    AND status NOT IN ('expired', 'cancelled', 'refunded', 'no_show_mentor');
```

- **Wygasłe holdy nie mogą blokować slotu.** Predykat ograniczenia nie może zawierać `now()` (musi być niezmienny), więc komenda `createHold` w **tej samej transakcji, przed INSERT**, wygasza nieaktualne blokady nachodzące na wybrany przedział:
  `UPDATE scheduling.booking SET status = 'expired' WHERE mentor_id = $1 AND status IN ('hold','pending_payment') AND hold_expires_at <= now() AND during && $2;`
  Zadanie pg-boss co minutę tylko sprząta resztę. Odczyty slotów filtrują `hold_expires_at > now()`.
- Hold: `INSERT … status='hold', hold_expires_at = now() + 10 min`; błąd `23P01` → `SlotTaken` → HTTP 409 (U1: „Ten termin został właśnie zajęty”).
- **Płatność po wygaśnięciu:** jeśli webhook `payment_succeeded` przyjdzie dla rezerwacji `expired`, a slot jest już zajęty → automatyczny zwrot 100% i powiadomienie (test integracyjny obowiązkowy).
- **Przełożenie** to `UPDATE during` tej samej rezerwacji w jednej transakcji — stary termin zwalnia się atomowo z zajęciem nowego (test wyścigu dwóch przełożeń na ten sam slot).
- Przed potwierdzeniem: kontrola freebusy w Google Calendar mentora (gdy podłączony).

### 4.5 Księga podwójna (ledger) dla kredytów i należności

Każda zmiana pieniędzy lub kredytów to **przelew między dwoma kontami** (debet jednego = kredyt drugiego, w groszach, w jednej walucie), więc suma wszystkich sald jest zawsze zerowa. Wpisów się nie edytuje; korekta = przelew odwracający z powodem i autorem (ręczne korekty admina tylko przez `trust`, z audytem).

**Konta:**

| Konto | Typ | Opis |
|---|---|---|
| `stripe_clearing` | aktywo | Odbicie salda platformy w Stripe: wpłaty, zwroty, transfery do mentorów, opłaty, chargebacki |
| `student_credit:{studentId}:{mentorId}` | zobowiązanie | Dostępny kredyt ucznia u mentora (W8), w **partiach** (`CreditLot`: `source_charge_id`, `expires_at`) zużywanych od najstarszej |
| `student_credit_reserved:{studentId}:{mentorId}` | zobowiązanie | Kredyt zarezerwowany na umówione sesje |
| `trial_deferred` | zobowiązanie | Opłacone sesje próbne przed rozliczeniem |
| `mentor_payable:{mentorId}` | zobowiązanie | Należność mentora po rozliczeniu, przed transferem |
| `platform_commission`, `platform_trial_revenue` | przychód | Prowizja (stawka zapisana w przelewie) i przychód z próbnych (Z5) |
| `promo_costs`, `provider_fees`, `chargeback_losses` | koszt | Kody rabatowe, opłaty Stripe, przegrane spory kartowe |

**Księgowania (do uszczegółowienia w specyfikacji F4 — tabela jest kontraktem testów):**

| Zdarzenie | Z konta → na konto |
|---|---|
| Opłacona sesja próbna | `stripe_clearing` → `trial_deferred` |
| Rozliczenie próbnej | `trial_deferred` → `platform_trial_revenue` |
| Zwrot próbnej (odrzucenie, konflikt, spór) / darmowa zamiana mentora | `trial_deferred` → `stripe_clearing` / pozostaje do rozliczenia u nowego mentora |
| Opłacony okres planu (`invoice.paid`) | `stripe_clearing` → `student_credit` (nowa partia, `expires_at`) |
| Rezerwacja sesji z planu | `student_credit` → `student_credit_reserved` (cena sesji **zablokowana na okres** subskrypcji) |
| Darmowe anulowanie, anulowanie przez mentora, no-show mentora | `student_credit_reserved` → `student_credit` (ta sama partia) |
| Rozliczenie (ukończona, późne anulowanie, no-show ucznia) | `student_credit_reserved` → `mentor_payable` + `platform_commission` (podział `allocate`) |
| Transfer do mentora (Stripe, klucz `transfer:{bookingId}`) | `mentor_payable` → `stripe_clearing` |
| Przeniesienie salda do innego mentora (UC11) | `student_credit:{m1}` → `student_credit:{m2}` (partie **zachowują** `expires_at`) |
| Wygaśnięcie partii kredytu (W2) | `student_credit` → `stripe_clearing` (automatyczny zwrot na kartę) |
| Opłata Stripe | `provider_fees` → `stripe_clearing` |
| Chargeback | `chargeback_losses` → `stripe_clearing` (+ odwrócenie kredytu, jeśli niewykorzystany) |

Saldo konta = suma przelewów, z buforem w `ledger.balance` aktualizowanym w tej samej transakcji (z `version`). Codzienne zadanie uzgadnia `stripe_clearing` z saldem Stripe. Testy właściwości: suma sald = 0; saldo `student_credit*` nigdy ujemne; zarezerwowanie bez pokrycia → błąd `ledger.insufficient_credit` (uczeń nie zarezerwuje więcej sesji, niż ma kredytu).

### 4.6 Transactional outbox, inbox i idempotencja

- **Outbox = pg-boss:** zdarzenie domenowe wysyłane jako zadanie pg-boss **w tej samej transakcji** co zmiana stanu (klient transakcji MikroORM przekazany przez opcję `db`). Commit = zdarzenie na pewno w kolejce; rollback = brak zdarzenia. Bez osobnej tabeli `outbox` i relay. `worker` dostarcza zdarzenia do subskrybentów, Ably i e-maila. Gwarancja: co najmniej raz, więc każdy handler jest idempotentny.
- **Inbox (deduplikacja):** każdy konsument i każdy webhook zapisuje `event_id` z unikalnym indeksem przed przetworzeniem. Webhook Stripe: weryfikacja podpisu → zapis surowego zdarzenia → szybkie 200 → przetwarzanie w zadaniu; stan obiektu zawsze pobierany ponownie z API (kolejność webhooków nie jest gwarantowana).
- **Idempotency-Key** (konwencja w stylu Stripe; draft IETF wygasł, więc to konwencja, nie standard) wymagany na `POST /checkout`, `/bookings/holds`, `/bookings/:id/cancel`, `/balances/transfer`, `/mentor/payouts`: zapisujemy klucz + odcisk żądania + odpowiedź; równoległe żądanie → 409, ten sam klucz z innym ciałem → 422. Klucz przekazywany dalej do Stripe.

### 4.7 Zdarzenia domenowe

Nazwa w czasie przeszłym z wersją: `booking.confirmed.v1`, `billing.subscription_renewed.v1`, `catalog.mentor_profile_approved.v1`. Ładunek: identyfikatory + minimum danych, schemat zod w `packages/contracts/events`. Zmiana niekompatybilna = nowa wersja zdarzenia (zasady w `BACKWARD_COMPATIBILITY.md`).

### 4.8 CQRS-lite (read modele)

Komendy idą przez agregaty; ciężkie odczyty z **widoków SQL** (zwykłych lub zmaterializowanych, odświeżanych zadaniem pg-boss albo po zdarzeniu), nie z projekcji budowanych ręcznie z zdarzeń:
- `catalog.mentor_search` (zmaterializowany) — wszystko, czego potrzebuje P2 (cena, tagi, ocena, liczba sesji, % powracających, czas odpowiedzi, wektor FTS, „najbliższy wolny slot”).
- `mentoring.student_overview` — M4 i U9.
- `payouts.earnings_summary` — M5.
Bez event sourcingu poza ledgerem (który i tak jest dziennikiem). Zasady sortowania „trafności” w wyszukiwarce opisane publicznie (DSA, obawa mentorów o „niejasne zasady rankingu”).

### 4.9 Obsługa błędów

- Oczekiwane porażki (slot zajęty, za późno na darmowe anulowanie, limit wątków) → `Result.err` z dyskryminowaną unią `{ code: 'booking.slot_taken', … }`.
- Wyjątki tylko dla błędów programisty i naruszeń niezmienników (łapane globalnie, raportowane do Sentry).
- **Jeden** mapper błędów domenowych na **RFC 9457** `application/problem+json` (`type` = stały URI, np. `https://kompas.pl/problems/booking/slot-taken`, `title` po polsku z i18n, `detail`, `instance`, rozszerzenia jak `nextFreeSlot`).
- Zakaz pustych `catch` i połykania błędów (reguła lint).

### 4.10 Czas i strefy

- Domena operuje na `Temporal.Instant` (moment) i `Temporal.ZonedDateTime` (moment w strefie). `Temporal.PlainTime` dla reguł dostępności („wtorki 18:00–20:00 Europe/Warsaw”).
- Wyświetlanie zawsze w strefie oglądającego (Z9); strefa w profilu użytkownika, domyślnie z przeglądarki.
- Interfejs `Clock` w DI (`SystemClock`, `FakeClock` w testach); mockupowe „teraz = wtorek 20.10.2026 14:00” staje się fixture'em FakeClock.

---

## 5. Standardy API

| Temat | Standard |
|---|---|
| Styl | REST `/api/v1/*` zgodny z mapą z KONCEPCJA §4, definiowany w oRPC, eksportowany jako OpenAPI 3.1 (`/api/v1/openapi.json`) |
| Wersjonowanie | Wersja w URL; w obrębie `v1` tylko zmiany addytywne; wycofanie przez nagłówki `Deprecation` / `Sunset` |
| Uwierzytelnienie | Cookie sesji HttpOnly, `Secure`, `SameSite=Lax`; mutacje chronione tokenem CSRF (Better Auth) |
| Kwoty | `{ "amount": 14900, "currency": "PLN" }` — liczba całkowita groszy; liczone **wyłącznie** na serwerze |
| Daty | ISO 8601 UTC (`2026-10-20T12:00:00Z`) + strefa w osobnym polu, gdy ważna |
| Paginacja | Kursorowa: `?cursor=&limit=` (≤ 50), kursor opaque nad `(sort_key, id)`; odpowiedź `{ items, nextCursor }` |
| Filtry | Parametry płaskie jak w P2; serializowane w URL strony (link do udostępnienia) |
| Błędy | RFC 9457 (§4.9); walidacja zod → 422 z listą `errors[{ pointer, code, message }]` |
| Współbieżność | `ETag` / `If-Match` z `version` przy edycji agregatów |
| Idempotencja | Nagłówek `Idempotency-Key` (§4.6) |
| Rate limit | 429 + `Retry-After` |
| Webhooki przychodzące | `/api/v1/webhooks/{provider}` (np. `payments` z KONCEPCJA = `stripe`), surowe ciało do weryfikacji podpisu, odpowiedź 2xx po zapisie do inbox |
| Zmiany względem KONCEPCJA §4 | Logowanie i rejestracja przez trasy Better Auth (`/api/auth/*`) zamiast `/auth/*`; czat przez kanały Ably zamiast `/ws/*`; holdy jako rezerwacje w stanie `hold`. Do naniesienia w KONCEPCJA przy akceptacji. |
| Realtime | Kanały Ably per wątek / per użytkownik; token z `/api/v1/realtime/token` z uprawnieniami tylko do własnych kanałów |

---

## 6. Coding standards

### 6.1 TypeScript

`tsconfig.base.json` (w `packages/config`) — wspólne flagi ścisłości:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noFallthroughCasesInSwitch": true,
    "useUnknownInCatchVariables": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "target": "ES2024",
    "skipLibCheck": true
  }
}
```

Rozszerzenia per środowisko: `apps/web` i `packages/ui` — `module: "esnext"`, `moduleResolution: "bundler"`, `jsx: "preserve"`, `noEmit: true` (wymagania Next.js); `apps/worker` i `packages/core` — `module: "nodenext"`, `moduleResolution: "nodenext"`.

Reguły ESLint (wybrane, jako błędy): `no-explicit-any`, `no-floating-promises`, `switch-exhaustiveness-check`, `no-misused-promises`, `consistent-type-imports`, `no-restricted-syntax` dla `new Date()` / `Date.now()` / `Math.random()` w `domain/**`, zakaz `number` w polach o nazwie `*amount*`/`*price*` poza typem `Money`, zakaz `console.*` (używamy loggera).

### 6.2 Język i nazewnictwo

- **Kod, identyfikatory, komentarze, commity, nazwy plików: angielski.** UI, specyfikacje, ADR-y, `AGENTS.md`: polski. Teksty UI tylko w `messages/pl.json`.
- **Słownik domeny** (w `AGENTS.md`, wiążący dla agentów):

| PL (UI, specyfikacje) | EN (kod) |
|---|---|
| uczeń | `student` |
| mentor | `mentor` |
| sesja (umówiona) | `booking`; pokój / przebieg sesji: `session` |
| sesja próbna | `trial booking` |
| blokada terminu | `hold` |
| plan | `subscription` |
| saldo / kredyt | `credit` (konto `student_credit`) |
| przełożenie / anulowanie | `reschedule` / `cancel` |
| prowizja | `commission` |
| wypłata | `payout`; transfer do mentora: `transfer` |
| spór / zgłoszenie problemu | `dispute` |
| cel / kamień milowy / zadanie | `goal` / `milestone` / `action item` |
| notatka po sesji | `session note` |
| weryfikacja mentora | `mentor application` |

- Komendy w trybie rozkazującym (`cancelBooking`), zdarzenia w czasie przeszłym (`BookingCancelled`), zapytania jako `get…`/`list…`.
- Pliki `kebab-case` z rolą w sufiksie: `cancel-booking.command.ts`, `booking.repository.ts`, `booking.state.ts`, `slots.policy.ts`, `slots.policy.test.ts`.
- Komponenty React: `PascalCase.tsx`, jeden komponent eksportowany na plik; nazwy z mapy ekranów KONCEPCJA §4 (`SlotGrid`, `HoldCountdown`).

### 6.3 Typy domenowe

- **Typy markowane dla ID:** `type BookingId = string & { readonly __brand: 'BookingId' }`, tworzone tylko parserem zod `.brand()` na krawędzi systemu. Pomylenie `MentorId` z `StudentId` nie kompiluje się.
- **`Money`** = `{ amount: bigint; currency: 'PLN' }` w domenie (Dinero), konwersja do `number` groszy dopiero w kontrakcie API.
- **Unie zamiast flag:** `type BookingType = 'trial' | 'plan' | 'single'`; żadnych `isTrial && !isPlan`.
- Wartości opcjonalne jawne (`exactOptionalPropertyTypes`): brak pola ≠ `undefined`.

### 6.4 Funkcje i moduły

- „Głębokie moduły”: mały publiczny `index.ts`, logika w środku. Plik > 300 linii lub funkcja > 40 linii to sygnał do podziału (ostrzeżenie lint, nie błąd).
- Bez klas tam, gdzie wystarczy funkcja; klasy dla encji MikroORM i adapterów.
- Zależności przez konstruktor/fabrykę z kontenera; zero importów singletonów infrastruktury w `application/`.
- Komentarz tłumaczy **dlaczego**, nie **co**; każda reguła biznesowa ma odnośnik do założenia (`// Z4: darmowe anulowanie do 12 h`).

### 6.5 Logowanie

- **pino**, JSON, poziomy `fatal…debug`; w kontekście: `requestId`, `traceId`, `userId`, `module`.
- `redact`: e-mail, telefon, imię i nazwisko, treść wiadomości, notatki, cel sesji, tokeny, nagłówek `authorization`, cookie. Logujemy identyfikatory, nie dane osobowe.
- Treść wiadomości i notatek nigdy nie trafia do logów ani do Sentry (beforeSend scrub).

---

## 7. Standardy frontendu

- **Mobile-first od 360 px**, dolna nawigacja < 768 px (KONCEPCJA §3.2). Każdy ekran testowany w 360 i 1280 px.
- **Każdy ekran ma stany L/E/Er/S** z KONCEPCJA §4: `loading.tsx` / skeletony, empty state z akcją, `error.tsx` z „Ponów”, sukces. Mockupy są wzorcem tekstów i stanów.
- **Dostępność WCAG 2.2 AA:** semantyczny HTML, focus widoczny, cele dotyku ≥ 24 px (zalecane 44 px), kontrast, etykiety pól, komunikaty błędów powiązane z polem (`aria-describedby`), obsługa klawiatury w SlotGrid i kalendarzu, `prefers-reduced-motion`. Automatycznie: `@axe-core/playwright` w e2e (0 naruszeń „serious/critical”).
- **Wydajność (p75, mobile):** LCP < 2,5 s, INP < 200 ms, CLS < 0,1; budżet JS na stronę publiczną ≤ 170 kB gzip. Obrazy przez `next/image` (AVIF/WebP), wideo-wprowadzenie ładowane leniwie.
- **SEO:** profile i wyszukiwarka renderowane na serwerze, metadane i `schema.org/Person` + `AggregateRating` (tylko zweryfikowane opinie), kanoniczne URL dla kombinacji filtrów.
- **Formularze:** walidacja klienta = ten sam schemat zod co serwer; blokada podwójnego wysłania; zachowanie danych przy błędzie (U7).
- **Strefa czasowa** widoczna przy każdym terminie (Z9).

---

## 8. Bezpieczeństwo i prywatność

- **Cel: OWASP ASVS 5.0 poziom 2**; przegląd zagrożeń (OWASP Top 10:2025) w każdej specyfikacji fazy dotykającej płatności, autoryzacji lub danych osobowych.
- **Autoryzacja:** RBAC po uprawnieniach (`booking.cancel.own`, `dispute.resolve`), role `student`, `mentor`, `admin_trust`, `admin_finance`. Sprawdzenie własności zasobu w **każdej** komendzie i zapytaniu aplikacyjnym (testy: „cudza sesja → 404/403”, KONCEPCJA U5).
- **Admin:** obowiązkowe 2FA (TOTP; passkeys w v1.1), sesje krótsze, każda decyzja i każda ręczna korekta salda w audycie. Podgląd konta użytkownika („impersonacja”) tylko w trybie do odczytu i z wpisem w audycie.
- **Hasła:** ≥ 10 znaków, sprawdzenie w bazie wycieków (k-anonimity HIBP), limit prób, komunikaty bez ujawniania, które pole jest błędne (P4).
- **Nagłówki:** CSP — na trasach zalogowanych nonce + `strict-dynamic`, na publicznych hashe/SRI (§2.5); źródła dozwolone: Stripe, LiveKit, Ably; HSTS; `frame-ancestors 'none'` wszędzie (Kompasu nie osadzamy w obcych stronach).
- **Pliki:** upload bezpośrednio do R2 przez presigned URL z limitem rozmiaru i typu; skan antywirusowy dokumentów KYC nie dotyczy (KYC robi Stripe).
- **Webhooki:** weryfikacja podpisu, okno czasowe, deduplikacja (§4.6).
- **Łańcuch dostaw:** `pnpm install --frozen-lockfile`, skrypty instalacyjne zablokowane domyślnie (lista dozwolonych), `minimumReleaseAge` ≥ 3 dni (wyjątki dla poprawek bezpieczeństwa), Renovate + Socket.dev, akcje GitHub przypięte po SHA, `permissions: {}` domyślnie w workflow.
- **Sekrety:** tylko w Secret Manager i zmiennych środowiskowych serwera; walidacja przy starcie; nigdy w `.ai/`, w logach ani w kodzie klienta.
- **RODO:** rejestr podprocesorów (Stripe, LiveKit, Ably, Google, SES, R2, Sentry, PostHog, Neon, dostawca faktur) z regionami i umowami powierzenia; eksport danych (S3) jako zadanie w tle; usunięcie konta = anonimizacja; brak nagrań sesji w MVP; retencja wiadomości i notatek do ustalenia (Q9).
- **Ochrona przed obchodzeniem płatności:** `detectOffPlatformContact` przed pierwszą opłaconą sesją (ostrzeżenie w S1), statystyki dla zespołu zaufania.

---

## 9. Strategia testów

Model „trofeum”: dużo analizy statycznej, rdzeń z testów integracyjnych na prawdziwym Postgresie, testy jednostkowe dla czystej domeny, mało e2e.

| Poziom | Narzędzie | Co pokrywa | Wymóg |
|---|---|---|---|
| Statyczny | tsc (TS 7), ESLint, Biome, dependency-cruiser, Knip | typy, granice modułów, martwy kod | 0 błędów |
| Jednostkowy | Vitest | `domain/**`: polityki, maszyny stanów, ledger, prowizje | pokrycie gałęzi ≥ 90% w `domain/` |
| Właściwości | fast-check | sloty przez DST (ostatnia niedziela marca i października), strefy, bufory, przeniesienie kredytu, partie kredytu, suma ledgera = 0 | obowiązkowe dla `scheduling` i `ledger` |
| Integracyjny | Vitest + Testcontainers (Postgres 17, osobna baza per worker z szablonu po migracjach) | komendy aplikacyjne z prawdziwą bazą, ograniczenia wykluczające (równoległe holdy, wygasły hold, wyścig przełożeń, płatność po wygaśnięciu), zadania wysyłane w transakcji, autoryzacja | każda komenda: ścieżka szczęśliwa + każdy kod błędu |
| Mutacyjny (od F8) | Stryker (incremental, runner Vitest) | `domain/**` w `ledger` i politykach rozliczeń | wynik ≥ 80%; nightly |
| Kontraktowy | Vitest | adaptery vs fake'i portów; odtwarzanie podpisanych webhooków Stripe/LiveKit z fixture'ów (duplikat = brak efektu) | każdy port i każdy obsługiwany typ webhooka |
| E2E | Playwright (fixture'y ról, seed, FakeClock przez nagłówek testowy, `toHaveScreenshot`, axe) | przepływy F1–F6 z KONCEPCJA, 360 i 1280 px | przepływ krytyczny F1 i F3 na każdym PR; pełny zestaw przed merge do main |
| Stripe | Stripe CLI / tryb testowy | checkout karta, BLIK, odnowienie, nieudane odnowienie, zwrot | przed każdym wdrożeniem `billing` |

Zasady: test pisany razem z kodem w tym samym PR; testy nie zależą od kolejności ani od prawdziwego czasu; buildery danych w `packages/testing` (`aBooking().trial().startingIn({ hours: 11 })`); flaky test = błąd priorytetowy.

---

## 10. Proces inżynieryjny (ludzie + agenci)

### 10.1 Spec-driven development

- Obowiązuje cykl z `AGENTS.md` (`.ai/specs` → `implemented/` / `archive/`, runy, lekcje).
- **Jedna specyfikacja na fazę** z sekcją Open Questions — implementacja startuje dopiero po odpowiedziach (bramka jak w `om-spec-writing`).
- Wielkość specyfikacji proporcjonalna do problemu: poprawka błędu nie potrzebuje specyfikacji, nowy przepływ płatności — tak.
- **ADR** (MADR 4.0) w `docs/decisions/` dla decyzji trudnych do odwrócenia; specyfikacja mówi **co**, ADR **dlaczego**. Pierwsze ADR-y wynikają z tej specyfikacji (lista w „Plan wdrożenia”).

### 10.2 Pipeline z cezar i open-mercato/skills

- `.ai/agentic.config.json` → `validation.commands`: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (każdy niezerowy kod zatrzymuje pipeline).
- Kolejność: `om-spec-writing` → `om-backlog` → `om-auto-implement-spec` (fazami, worktree, gałąź Neon per worktree) → `om-code-review` (+ reguły z `CODE_REVIEW.md`) → `om-auto-qa-pr` → **człowiek** zatwierdza `qa-approved` i merge.
- Zadania równoległe tylko o rozłącznym zakresie modułów (granice z §2.4 to ułatwiają).
- Zmiany w `billing`, `ledger`, `payouts`, `identity` oraz w migracjach: obowiązkowy przegląd człowieka, niezależnie od wyniku agentów.

### 10.3 Harness dla agentów

- **Prowadnice (guides):** krótki główny `AGENTS.md` + `AGENTS.md` per moduł (język domeny, niezmienniki, „wzoruj się na `modules/scheduling`”) + skill `kompas-module` (szablon nowego modułu, komendy, testu kontraktowego). Unikać rozdmuchanych instrukcji: każdą linię sprawdzamy pytaniem „czy jej usunięcie spowoduje błąd?”.
- **Czujniki (sensors):** typy, lint z komunikatami „jak naprawić”, testy architektury, szybkie testy domeny (< 10 s), hooki Claude Code: formatowanie po edycji, blokada edycji istniejących migracji, Stop hook uruchamiający typecheck + testy zmienionego modułu.
- **Moduł wzorcowy:** `scheduling` budowany jako pierwszy i najstaranniej — kolejne moduły kopiują jego strukturę.
- Każdy powtarzający się błąd agenta → nowa reguła lint / test / wpis w `.ai/lessons.md` (zasada „korekta = reguła”).

### 10.4 Git i przeglądy

- **Trunk-based:** krótkie gałęzie (≤ 2 dni), `main` zawsze wdrażalny, niedokończone funkcje za flagą.
- **Conventional Commits** z zakresem = moduł (`feat(booking): …`, `fix(ledger): …`).
- **PR ≤ ~400 zmienionych linii** (bez migracji i snapshotów); jedna faza specyfikacji = jeden lub kilka PR.
- `CODE_REVIEW.md`: lista kontrolna (granice modułów, autoryzacja, idempotencja, pieniądze w `Money`, czas przez `Clock`, stany L/E/Er/S, i18n, a11y, testy błędów, brak PII w logach).

### 10.5 Definicja ukończenia (każdy PR / faza)

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone.
- `docker compose up -d && pnpm db:migrate && pnpm db:seed` działa na czystym repo.
- E2E dla zmienionych ekranów w 360 i 1280 px, 0 naruszeń axe „serious/critical”.
- Specyfikacja zaktualizowana („Decyzje i zmiany”), lekcje dopisane, run zamknięty (jeśli autonomiczny).
- Brak nowych ostrzeżeń Knip i dependency-cruiser.

---

## 11. CI/CD i środowiska

| Środowisko | Gdzie | Dane |
|---|---|---|
| Lokalne | docker compose | seed z mockupów |
| Preview (per PR) | Cloud Run tagged revision + gałąź Neon | seed; Stripe test mode, LiveKit dev |
| Staging | Cloud Run (osobny projekt GCP) | seed + dane syntetyczne; pełne integracje w trybie testowym |
| Produkcja | Cloud Run europe-west3 + Neon Frankfurt (PITR) | prawdziwe |

**GitHub Actions** (akcje po SHA, OIDC do GCP, bez długoterminowych kluczy):

1. `install` (frozen lockfile, cache Turborepo) → 2. `lint` + `typecheck` + `test:unit` (równolegle) → 3. `test:integration` (Testcontainers) → 4. `build` obrazu → 5. preview deploy + migracje na gałęzi Neon → 6. `test:e2e` (Playwright, sharding) na preview → 7. po merge: staging → smoke → produkcja (ręczne zatwierdzenie w MVP).

Migracje: tylko „expand → migrate → contract” (zgodne wstecz z poprzednią wersją aplikacji), uruchamiane jako osobny krok przed przełączeniem ruchu. Rollback = poprzednia rewizja Cloud Run (bez cofania migracji).

---

## 12. Obserwowalność i niezawodność

- **SLO (MVP):** dostępność ścieżek rezerwacji i płatności 99,5% / mies.; p95 odpowiedzi API < 500 ms; p95 od webhooka płatności do potwierdzenia rezerwacji < 30 s (U3 czeka maks. 30 s).
- **Alerty:** spalanie budżetu błędów, rosnąca kolejka pg-boss (> 5 min opóźnienia), błędy weryfikacji webhooków, nieudane transfery do mentorów, holdy wygasające masowo, rozjazd salda w ledgerze (codzienny job uzgadniający ledger ze Stripe balance).
- **Metryki biznesowe (PostHog):** konwersja wyszukiwanie → próbna → plan, odsetek no-show, czas odpowiedzi mentorów, odsetek sporów.
- **Runbooki** w `docs/runbooks/` dla: zaległych webhooków Stripe (replay z dashboardu), awarii LiveKit (komunikat + przełożenie bez kosztów), wygaśnięcia watchy Google Calendar.

---

## 13. Implikacje regulacyjne dla implementacji (do potwierdzenia przez prawnika/doradcę)

| Wymóg | Co budujemy | Moduł / faza |
|---|---|---|
| PSD2 (W1) | Brak własnego portfela; kredyty niewypłacalne; zwroty na metodę płatności | `ledger`, `billing` / F4 |
| Limit 90 dni Stripe (W2) | `creditExpiresAt`, przypomnienia, automatyczne rozliczenie lub zwrot przed terminem | `ledger` / F4 |
| KSeF (W4) | `InvoicingProvider`, kolejka wysyłki, status i UPO w `InvoiceRecord` | `payouts` / F7 |
| DAC7 (W5) | Pola w onboardingu M1, blokada wypłat, generator XML DPI raz w roku | `payouts`, `catalog` / F2, F7 |
| DSA | Zgłaszanie treści (notice & action) dla profili, opinii i wiadomości; uzasadnienie decyzji moderacyjnej; punkt kontaktowy; regulamin. Dane identyfikujące mentorów-przedsiębiorców (art. 30) w modelu od początku, nawet jeśli zwolnienie dla małych platform obowiązuje | `trust` / F6 |
| Omnibus (W6) | Opinie tylko po zweryfikowanej sesji, strona zasad opinii, brak edycji opinii przez mentora; przy kodach rabatowych informacja o najniższej cenie z 30 dni, jeśli komunikujemy obniżkę | `catalog`, `billing` / F4, F5 |
| Prawo konsumenckie (umowa na odległość) | Przy zakupie sesji i planu: zgoda na rozpoczęcie usługi przed upływem 14 dni i potwierdzenie utraty prawa odstąpienia po pełnym wykonaniu; trwały nośnik (e-mail z potwierdzeniem) | `billing` / F4 |
| EAA / WCAG 2.2 AA (W7) | §7 + deklaracja dostępności | wszystkie |
| RODO | §8, rejestr czynności, DPIA dla wiadomości i notatek | wszystkie |

---

## 14. Szacunkowe koszty usług (MVP, ~2000 sesji / mies.)

| Usługa | Szacunek / mies. |
|---|---|
| Cloud Run (web + worker min. 1 instancja) | ~40–80 USD |
| Neon (Launch/Scale, gałęzie preview) | ~30–100 USD |
| LiveKit Cloud Ship | ~275 USD (Scale 500 USD przy wymogu mediów w UE) |
| Ably | 0–29 USD |
| SES, R2 | < 30 USD łącznie |
| Sentry, PostHog | 0–100 USD (darmowe progi na start) |
| Stripe | prowizje transakcyjne (karta EOG 1,5% + 1 zł, BLIK 1,6% + 1 zł, Billing 0,7%) + Connect 9 zł / aktywne konto mentora / mies. + 0,25% + 1,35 zł za wypłatę |

Ceny do ponownego sprawdzenia przed zakupem (część z cenników stron trzecich).

---

## Wymagania

1. Każda kolejna specyfikacja funkcjonalna Kompasu odwołuje się do tej specyfikacji i nie odchodzi od stacku ani wzorców bez wpisu w „Decyzje i zmiany” i ADR.
2. Każdy zewnętrzny dostawca jest dostępny wyłącznie przez port z fake'iem i testem kontraktowym.
3. Kwoty wyłącznie jako `Money` (grosze, `bigint` w bazie); czas wyłącznie przez `Clock` i Temporal w domenie.
4. Granice modułów i zakazy z §2.4 i §6.1 są wymuszane automatycznie (lint + CI), nie tylko opisane.
5. Rezerwacje są chronione ograniczeniem wykluczającym w bazie; zmiany salda wyłącznie przez ledger.
6. Webhooki i komendy finansowe są idempotentne.
7. Dane osobowe i pieniądze klientów przechowujemy w UE; pieniądze wyłącznie u licencjonowanego operatora.

## Kryteria akceptacji

- [ ] Specyfikacja zaakceptowana przez właściciela (`status: approved`), odpowiedzi na Q1–Q12 wpisane w „Decyzje i zmiany”.
- [ ] ADR-y 0001–0005 utworzone w `docs/decisions/` na podstawie §1–§4.
- [ ] Faza F0 (szkielet) spełnia definicję ukończenia z §10.5 i zawiera: monorepo, oba procesy, Postgres w docker compose, pierwszą migrację, kontener DI, `/api/health`, lint/typecheck/test/build, testy architektury, smoke e2e, CI z preview.
- [ ] Moduł wzorcowy `scheduling` (F3) ma: maszynę stanów z §4.3, oba ograniczenia wykluczające i indeks sesji próbnej z testami integracyjnymi (równoległe holdy, wygasły hold, wyścig przełożeń), testy właściwości slotów przez DST.
- [ ] Specyfikacja F4 zawiera pełną tabelę księgowań (§4.5) dla każdego zdarzenia płatniczego, łącznie z próbną, zwrotem, wygaśnięciem i chargebackiem.
- [ ] `AGENTS.md` uzupełniony o słownik domeny (§6.2), reguły modułów (§2.4) i komendy weryfikacji; `.ai/agentic.config.json`, `CODE_REVIEW.md`, `SDLC.md`, `BACKWARD_COMPATIBILITY.md` utworzone.

## Projekt rozwiązania

Opisany w §1–§13 powyżej.

## Plan wdrożenia

Każda faza zostawia działającą aplikację i ma własną specyfikację w `.ai/specs/`.

| Faza | Zawartość | Moduły |
|---|---|---|
| **F0 Szkielet i harness** | Monorepo pnpm/Turborepo, Next.js 16 + worker, Postgres (compose), MikroORM 7 + pierwsza migracja, Awilix, Clock, Result, Money, logger, `/api/health`, Biome/ESLint/boundaries/dependency-cruiser, Vitest + Testcontainers, Playwright smoke, CI + preview (Cloud Run + Neon), Sentry, AGENTS.md per moduł, `agentic.config.json`. ADR 0001–0005. | shared |
| **F1 Tożsamość** | Better Auth (e-mail, Google, LinkedIn), role, `returnTo`, zgody, S3 (podstawy), 2FA dla admina | `identity` |
| **F2 Katalog i onboarding** | M1 (6 kroków, szkice, zdjęcie do R2, wideo jako link, pola DAC7), A1 weryfikacja, P1–P3, widok wyszukiwarki | `catalog`, `trust` |
| **F3 Dostępność i rezerwacje** (moduł wzorcowy) | Silnik slotów, M3, U1 z holdem, ograniczenia wykluczające, przełożenie/anulowanie (U4, U5), Google Calendar (freebusy), przypomnienia | `scheduling`, `notifications` |
| **F4 Płatności i ledger** | Stripe Connect (konta mentorów), checkout próbnej (karta, BLIK, P24 po zgodzie), webhooki + inbox, ledger, U3, plany (Billing, BLIK cykliczny), U8, zwroty, wygasanie kredytów | `billing`, `ledger` |
| **F5 Sesja i ocena** | Pokój LiveKit (U6), obecność, no-show, rozliczenie po zamknięciu okna sporu (W10), U7, opinie (Omnibus) | `sessions`, `scheduling`, `catalog` |
| **F6 Mentoring, wiadomości, spory** | U9, M4 (cele, notatki, zadania), S1 + Ably, wykrywanie kontaktu poza platformą, A2 spory, DSA notice & action | `mentoring`, `messaging`, `trust` |
| **F7 Wypłaty i dokumenty** | Transfery do mentorów, M5, progi prowizji, wypłaty, KSeF przez `InvoicingProvider`; eksport DAC7 przed pierwszym raportem (31.01 roku po starcie) | `payouts` |
| **F8 Gotowość produkcyjna** | Testy obciążeniowe ścieżki rezerwacji, przegląd ASVS L2, audyt WCAG, Stryker dla ledgera, runbooki, alerty SLO, PostHog, deklaracja dostępności | wszystkie |

**ADR do utworzenia w F0 (maks. 5, kolejne tylko dla decyzji trudnych do odwrócenia):** 0001 modułowy monolit, struktura repo, Next.js 16 + oRPC; 0002 MikroORM 7 + Postgres + pg-boss jako outbox; 0003 Stripe Connect SCT + kredyty zamiast portfela (PSD2, limit 90 dni); 0004 ledger podwójny z partiami kredytu; 0005 dostawcy za portami (LiveKit, Ably, Google, SES) + hosting Cloud Run + Neon w UE.

**Luki do domknięcia w specyfikacjach faz** (z przeglądu; nie blokują akceptacji stacku):
- F4: zmiana planu w trakcie okresu i proporcjonalne rozliczenie; ustawienia ponawiania nieudanych odnowień (F2 z KONCEPCJA: 3 próby w 7 dni) w Stripe Billing; obsługa sporów kartowych (chargeback) end-to-end.
- F4/F7: VAT od prowizji i status VAT mentora (zależy od Q6).
- F6: dostawca powiadomień push (S3 przewiduje preferencje push) — w MVP tylko e-mail + in-app, Web Push w v1.1 razem z PWA.
- F8: założenia wolumenu do testów obciążeniowych (np. 10 tys. mentorów, 50 tys. uczniów, szczyt 200 rezerwacji/min w poniedziałek rano).

## Open Questions

- **Q1.** Stack: akceptujesz MikroORM 7 + Awilix (spójne z kursem i Open Mercato) czy wolisz prostszy Drizzle + funkcje bez kontenera DI? Rekomendacja: MikroORM + Awilix.
- **Q2.** Czy budujemy na **Open Mercato** jako frameworku? Rekomendacja: **nie** (wersja 0.9, CRM/ERP i multi-tenancy bez rezerwacji/subskrypcji, dodatkowo Redis i Meilisearch); przejmujemy jego wzorce (moduły, `di.ts`, zdarzenia, RBAC). Powrót do tematu po 1.0.
- **Q3.** Opinia prawna: czy model „Stripe trzyma środki, Kompas prowadzi kredyty na sesje” wystarcza, żeby nie podlegać ustawie o usługach płatniczych?
- **Q4.** Polityka wygasania kredytów (W2): proponuję 60 dni od daty obciążenia (per partia, przeniesienie salda nie resetuje terminu), przypomnienia od 45. dnia, po terminie automatyczny zwrot na metodę płatności. Konsekwencja: „wstrzymanie planu z zachowaniem salda” (F2 w KONCEPCJA) zachowuje saldo najwyżej do terminu partii — akceptujesz?
- **Q5.** Przelewy24: czy uruchamiamy po potwierdzeniu kategorii (MCC 8299) przez Stripe, czy w MVP tylko karta + BLIK?
- **Q6.** Fakturowanie (doradca podatkowy): Kompas jako pośrednik (faktura prowizyjna dla mentora) czy jako sprzedawca usługi (faktura dla ucznia)? Wybór dostawcy: inFakt czy Fakturownia?
- **Q7.** Kredyt jako wartość pieniężna (W8): akceptujesz? Co z resztą po przeniesieniu do droższego mentora (zostaje kredytem / dopłata / zwrot)?
- **Q8.** Region: Frankfurt (Neon + Cloud Run europe-west3, gałęzie bazy dla preview) czy Warszawa (Cloud SQL + Cloud Run europe-central2, bez gałęzi)? Rekomendacja: Frankfurt.
- **Q9.** Retencja wiadomości, notatek i zdarzeń obecności (dowody w sporach): proponuję 24 mies. od ostatniej aktywności, potem anonimizacja.
- **Q10.** Czy LiveKit Ship (media mogą być routowane poza UE, bez ich przechowywania) jest akceptowalny prawnie, czy od razu Scale z przypięciem do UE (+225 USD/mies.)?
- **Q11.** Drogie plany (W11): limit kwoty jednego okresu, rozliczanie co tydzień zamiast co 4 tygodnie dla planów > 2000 zł, czy tylko karta?
- **Q12.** Rozliczenie sesji po 72 h zamiast 48 h (W10) — akceptujesz przesunięcie pieniędzy dla mentora o dobę w zamian za brak cofania przelewów przy sporach? Alternatywa: skrócić okno zgłoszeń w U5 do 48 h.

## Decyzje i zmiany

- 2026-10-21 — Wersja robocza na podstawie researchu (stan rynku i przepisów na 2026-10-21).
- 2026-10-21 — Po niezależnym przeglądzie: dodany stan `hold` i rozgałęzienie próbna/plan w maszynie `Booking`; wygaszanie nieaktualnych holdów w komendzie `createHold`; indeks sesji próbnej nie blokuje ponownej próby; ograniczenie nakładania dla ucznia; rozliczenie po zamknięciu okna sporu (72 h); rezerwacja kredytu przy umawianiu, partie kredytu z datą ważności i tabela księgowań z kontem `stripe_clearing`; CSP z nonce tylko na trasach zalogowanych; Better Auth przez adapter Kysely; TS 6 zamiast TS 6 + TS 7; tsconfig per środowisko; pg-boss: `web` tylko wysyła przez pooler, outbox = zadania w transakcji; uproszczenia MVP (11 modułów zamiast 14, widoki SQL zamiast projekcji, Stryker od F8, bez Bunny/OpenFeature/Grafany/passkeys w MVP, 5 ADR). Czeka na akceptację właściciela i odpowiedzi Q1–Q12.
- 2026-10-21 — Właściciel zlecił wdrożenie spec (status `in-progress`). Start od F0 i dokumentów procesu (spec `.ai/specs/2026-10-21-f0-szkielet-i-harness.md`); dla F0 przyjęte rekomendacje Q1 (MikroORM + Awilix), Q2 (bez Open Mercato), Q8 (Frankfurt). Q3–Q7 i Q9–Q12 nadal otwarte — blokują dopiero F4–F7.

## Źródła

**Framework, ORM, narzędzia:** [Next.js 16](https://nextjs.org/blog/next-16) · [Next.js na różnych platformach](https://nextjs.org/blog/nextjs-across-platforms) · [TanStack Start 1.0](https://tanstack.com/blog/tanstack-start-1-0) · [MikroORM 7](https://mikro-orm.io/blog/mikro-orm-7-released) · [Drizzle releases](https://orm.drizzle.team/docs/latest-releases) · [Prisma 7](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0) · [Auth.js dołącza do Better Auth](https://www.better-auth.com/blog/authjs-joins-better-auth) · [Better Auth w Vercel](https://better-auth.com/blog/better-auth-joins-vercel) · [TypeScript 7 (InfoQ)](https://infoq.com/news/2026/08/typescript-7-released/) · [shadcn/ui Base UI](https://ui.shadcn.com/docs/changelog/2026-01-base-ui) · [Node 26 i Temporal](https://lilting.ch/en/articles/nodejs-26-current-temporal-undici) · [temporal-polyfill](https://cdn.jsdelivr.net/npm/temporal-polyfill@1.0.1/README.md) · [Open Mercato](https://github.com/open-mercato/open-mercato)

**Płatności i regulacje:** [Stripe Accounts v2](https://docs.stripe.com/connect/accounts-v2) · [Stripe charge types](https://docs.stripe.com/connect/charges) · [Stripe: limit trzymania środków](https://docs.stripe.com/connect/account-balances) · [Stripe BLIK](https://docs.stripe.com/payments/blik) · [Stripe BLIK cykliczny](https://docs.stripe.com/payments/blik/recurring-payments) · [Stripe P24](https://docs.stripe.com/payments/p24.md) · [Stripe cennik PL](https://stripe.com/pl/pricing) · [Stripe Connect cennik](https://stripe.com/pl/connect/pricing) · [PayU Marketplace boarding](https://developers.payu.com/europe/docs/services/marketplace/boarding/) · [PayU BLIK recurring](https://developers.payu.com/europe/docs/payment-solutions/blik/recurring/) · [Usługi płatnicze a KNF](https://akademialtca.pl/blog/uslugi-platnicze-czy-kazdy-podmiot-dokonujacy-lub-obslugujacy-platnosci-podlega-przepisom-ustawy-o-uslugach-platniczych-i-wymaga-wpisu-do-rejestru-knf) · [KSeF terminy (Infor)](https://ksiegowosc.infor.pl/ksef/7496286,ksef-obowiazkowy-czy-dobrowolny-terminy-2026-zasady-i-efaktura-dla-konsumentow-kompletny-przewodnik.html) · [inFakt KSeF API](https://pomoc.infakt.pl/hc/pl/articles/16165489514898) · [Fakturownia API](https://github.com/fakturownia/API) · [DAC7 (RSM)](https://rsm.global/poland/en/insights/tax/dac7-reporting-registration) · [EAA — ustawa](https://eli.gov.pl/eli/DU/2024/731/ogl/pol/pdf) · [DSA art. 29](https://www.springlex.eu/en/packages/dsa/dsa-regulation/article-29/) · [Omnibus (EY)](https://www.ey.com/pl_pl/insights/law/implementacja-dyrektywy-omnibus)

**Wideo, realtime, kalendarz, wyszukiwanie, pliki:** [LiveKit pricing](https://livekit.com/pricing.md) · [LiveKit data residency](https://docs.livekit.io/deploy/admin/regions/data-residency.md) · [Daily pricing](https://www.daily.co/pricing/video-sdk/) · [Twilio Video zostaje](https://www.twilio.com/en-us/changelog/-twilio-video-will-remain-a-standalone-product) · [Vercel WebSockets](https://vercel.com/docs/functions/websockets) · [Ably pricing](https://ably.com/pricing) · [Google Calendar scopes](https://developers.google.com/calendar/api/auth) · [Google push](https://developers.google.com/workspace/calendar/v3/push) · [Cal.com Platform FAQ](https://cal.com/docs/platform/faq.md) · [Postgres range types](https://www.postgresql.org/docs/current/rangetypes.html) · [ParadeDB stemming](https://www.paradedb.com/docs/reference/token-filters/stemming.md) · [R2 data location](https://developers.cloudflare.com/r2/reference/data-location/) · [Bunny Stream pricing](https://bunny.net/docs/stream/pricing.md)

**Infrastruktura i bezpieczeństwo:** [Vercel limity](https://vercel.com/docs/functions/limitations) · [Cloud Run WebSockets](https://docs.cloud.google.cn/run/docs/triggering/websockets?hl=en) · [App Runner — zmiana dostępności](https://docs.aws.amazon.com/ja_jp/apprunner/latest/dg/apprunner-availability-change.html) · [Neon pricing (Jetadmin)](https://www.jetadmin.io/blog/neon-pricing/) · [Sentry Replay privacy](https://docs.sentry.io/platforms/javascript/guides/nextjs/session-replay/privacy) · [PostHog cookieless](https://posthog.com/docs/tutorials/cookieless-tracking) · [OWASP Top 10:2025](https://owasp.org/Top10/2025/0x00_2025-Introduction/) · [ASVS 5.0](https://softwaremill.com/whats-new-in-asvs-5-0/) · [Obrona przed atakami npm 2026](https://mondoo.com/blog/npm-supply-chain-security-package-manager-defenses-2026) · [GitHub: SHA pinning](https://github.blog/changelog/2025-08-15-github-actions-policy-now-supports-blocking-and-sha-pinning-actions/)

**Proces i wzorce:** [open-mercato/skills](https://github.com/open-mercato/skills) · [open-mercato/cezar](https://github.com/open-mercato/cezar) · [Claude Code best practices](https://code.claude.com/docs/en/best-practices) · [Harness engineering (Fowler)](https://martinfowler.com/articles/harness-engineering.html) · [SDD tools (Fowler)](https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) · [Thoughtworks Radar Vol. 34](https://www.thoughtworks.com/content/dam/thoughtworks/documents/radar/2026/04/tr_technology_radar_vol_34_en.pdf) · [agents.md](https://agents.md) · [Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html) · [Idempotency-Key draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) · [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) · [TigerBeetle data modeling](https://docs.tigerbeetle.com/coding/data-modeling/) · [Ledger immutability](https://moderntreasury.com/journal/enforcing-immutability-in-your-double-entry-ledger) · [Dinero.js 2.0](https://newreleases.io/project/npm/dinero.js/release/2.0.0) · [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) · [Stryker incremental](https://stryker-mutator.io/docs/stryker-js/incremental/) · [fast-check](https://fast-check.dev) · [MADR](https://adr.github.io/madr/)
