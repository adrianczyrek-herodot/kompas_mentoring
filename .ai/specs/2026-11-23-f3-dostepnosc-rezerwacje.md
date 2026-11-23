---
title: F3 — dostępność i rezerwacje (M3, U1–U5, M2, S2, reset hasła)
status: approved            # draft | approved | in-progress | implemented | archived
created: 2026-11-23
implemented:
related:
  - .ai/specs/product-brief.md (E3, reguły 1, 4, 5, 10; A3, A8; Q-B2)
  - .ai/specs/backlog.md (E3-S1…E3-S10, zgłoszenia #24, #36–#45; tabela „Pytania z notatek prototypu kompas-flow”)
  - .ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md (W9, §1.3, §2.3–2.4, §3, §4.1–4.10, §5, §9)
  - .ai/specs/2026-11-22-f2-katalog-onboarding.md (krok 5 M1, Q8 `suspended`, Q12 flaga CTA)
  - .ai/specs/implemented/2026-11-10-f1-tozsamosc.md (Q2 weryfikacja e-maila, s04/s05, Q7 S3)
  - prototypes/konta-i-role/mapa-ekranow.md (GAP-03, GAP-05, GAP-09, GAP-15)
  - kompas-mentoring/KONCEPCJA.md (F1, F3, F5 przepływy; U1–U5, M2, M3, S2; §5 model)
  - docs/design-system.md (luki DS-04, DS-05, DS-18, DS-20), packages/ui/src/screens/{u1-booking,u5-session,m2-dashboard}.stories.tsx
  - packages/core/src/modules/scheduling/ (maszyna `Booking`, `canCancelFree`), packages/core/src/shared/infrastructure/events/
  - .ai/runs/2026-11-23-e3-s1-specyfikacja-f3.md
---

# F3 — dostępność i rezerwacje (M3, U1–U5, M2, S2, reset hasła)

## Kontekst i cel

Trzecia faza funkcjonalna i **moduł wzorcowy** (spec stacku, plan faz). Po F2 uczeń znajduje zatwierdzonego mentora, ale nie ma jak się z nim umówić. F3 domyka zakres Now briefu: **działająca rezerwacja sesji bez płatności** (A8, Q-B2) —

1. mentor ustawia dostępność w M3 (szablon tygodniowy, wyjątki, wyprzedzenie, bufor, wstrzymanie przyjmowania, Google Calendar), a ten sam edytor osadza krok 5 onboardingu M1;
2. uczeń wybiera termin w U1 w swojej strefie czasowej, blokuje go na 10 min i potwierdza rezerwację (bez płatności — płatność wejdzie w F4 w to samo miejsce maszyny stanów);
3. mentor przyjmuje lub odrzuca prośbę o sesję próbną w M2 (SLA 24 h, potem auto-akceptacja);
4. uczeń widzi swoje sesje w U4/U5 i przekłada lub anuluje je wg reguły 12 h;
5. obie strony dostają e-maile (SES) i przypomnienia 24 h / 1 h, a w aplikacji listę powiadomień S2;
6. `identity` dostaje to, co czekało na wysyłkę e-maili: wymuszenie weryfikacji e-maila przed pierwszą rezerwacją, reset hasła (s04/s05) i zmianę e-maila.

Cele briefu: **C3** (0 podwójnych rezerwacji, 0 błędów stref/DST), C1 (mediana czasu do rezerwacji próbnej), C4 (mało administracji mentora), C6 (WCAG 2.2 AA).

Ta specyfikacja realizuje E3-S1 (#36) i jest podstawą historii E3-S2…E3-S10 (#37–#45). Implementacja startuje dopiero po odpowiedziach na Open Questions i `status: approved` (SDLC §1).

## Ekrany

Identyfikatory ekranów z KONCEPCJI §3 i mapy F1 są stałe; kryteria akceptacji odwołują się do nich.

| ID | Ekran | Trasa | Rola | Historia |
|---|---|---|---|---|
| **M3** | Kalendarz i dostępność: tydzień z sesjami, szablon, wyjątki, ustawienia, Google Calendar | `/mentor/kalendarz` | mentor (`approved`) | E3-S2, E3-S10 |
| **M1·5** | Krok 5 onboardingu — osadzony edytor szablonu z M3 (ekran należy do E2-S3) | `/mentor/onboarding/dostepnosc` | mentor | E3-S2 (komponent) → E2-S3 |
| **U1** | Wybór terminu | `/rezerwacja/[mentorId]` | gość (podgląd), uczeń | E3-S4 |
| **U2** | Podsumowanie rezerwacji (w F3 bez płatności; F4 dokłada płatność w tym samym ekranie) | `/rezerwacja/[mentorId]/platnosc?blokada=<holdId>` | uczeń | E3-S4 |
| **U3** | Potwierdzenie rezerwacji (minimalne: status, `.ics`) | `/rezerwacja/[bookingId]/potwierdzenie` | uczeń | E3-S4 |
| **U4** | Moje sesje (nadchodzące / minione) | `/sesje` | uczeń | E3-S5 |
| **U5** | Szczegóły sesji: status, akcje, przełożenie, anulowanie | `/sesje/[id]` | uczeń | E3-S5, E3-S6 |
| **M2** | Panel mentora: dzisiaj, prośby o próbną, status profilu | `/mentor` | mentor (`approved`) | E3-S7 |
| **M2·s** | Szczegóły sesji mentora (anulowanie z powodem) — Q20 | `/mentor/sesje/[id]` | mentor | E3-S5, E3-S6 |
| **S2** | Powiadomienia | `/powiadomienia` | wszyscy zalogowani | E3-S8 |
| **s04** | Reset hasła — żądanie linku (z „Nie pamiętasz hasła?” na P4) | `/haslo/reset` | gość | E3-S9 |
| **s05** | Nowe hasło z linku | `/haslo/nowe?token=` | gość z tokenem | E3-S9 |
| **S3·e** | Zmiana e-maila w koncie (z weryfikacją) | `/konto` (sekcja) | wszyscy zalogowani | E3-S9 |

Poza ekranami: e-maile (szablony w tabeli „Powiadomienia”) i plik `.ics` (`GET /bookings/:id/ics`).

## Zakres

- W zakresie:
  - **Moduł `scheduling`** (istnieje szkielet z F0): `MentorSchedule` (strefa, wyprzedzenie, bufor), `AvailabilityRule`, `AvailabilityException`, silnik slotów `slotsFor`, agregat `Booking` (blokada, rezerwacja, przełożenie, anulowanie, akceptacja próbnej, auto-akceptacja), oba ograniczenia wykluczające i indeks sesji próbnej, projekcja `mentor_bookability` (z zdarzeń `catalog`), `CalendarConnection` + port `CalendarSync` (Google freebusy), porty `PaymentGate` i `CreditReservation` z adapterami F3 „bez płatności”.
  - **Moduł `notifications`** (nowy): `Notification` (in-app), konsumenci zdarzeń `scheduling.*`, szablony e-mail po polsku, przypomnienia 24 h i 1 h (pg-boss `sendAfter`), lista S2.
  - **Wspólna wysyłka e-maili:** `shared/infrastructure/email` — transport SES (eu-central-1) + adapter logujący (dev) + adapter plikowy (E2E) + fake z testem kontraktowym; React Email. Adapter `EmailVerificationSender` z F1 przechodzi na ten transport.
  - **`identity`:** wymuszenie weryfikacji e-maila przed pierwszą rezerwacją (F1 Q2), strefa czasowa użytkownika (Q12), reset hasła s04/s05, zmiana e-maila w S3.
  - **`catalog`:** zdarzenie `catalog.mentor_bookability_changed.v1` (publikacja, zawieszenie, stawka, wstrzymanie przyjmowania) i ustawienie „wstrzymaj przyjmowanie” edytowane z M3 (Q13); P3 — odblokowanie CTA (flaga `NEXT_PUBLIC_BOOKING_ENABLED` z F2 Q12) po E3-S4.
  - **Idempotency-Key** (spec §4.6) dla `POST /bookings/holds`, `POST /checkout`, `POST /bookings/:id/cancel`, `POST /bookings/:id/reschedule`.
  - **UI:** M3, U1, U2 (bez płatności), U3 (minimalne), U4, U5, M2, M2·s, S2, s04, s05, sekcja zmiany e-maila w S3; brakujące komponenty w `packages/ui` ze stories.
  - **Seed:** dostępność mentorów z seeda F2, przykładowe rezerwacje we wszystkich stanach F3 (dla U4, U5, M2).
- Poza zakresem:
  - Płatności, checkout z metodami, kody rabatowe, ledger, saldo („BalancePill” w U4), zwroty pieniędzy, plany N/tydzień (F4, L1). F3 emituje zdarzenia, z których F4 zbuduje rezerwację i zwolnienie kredytu.
  - Pokój sesji, „Dołącz” jako działający link, obecność, przejścia `started`/`ended`/no-show, rozliczenie (F5, L2). W F3 „Dołącz” jest widoczny i nieaktywny z opisem (Q4).
  - Wiadomości do mentora (F6) — „Napisz do mentora” przy braku slotów w 14 dni pojawia się w F6, w F3 jest tylko informacja i podobni mentorzy.
  - Zgłoszenie problemu / spór z U5 (F6), notatki i zadania po sesji (F6), KPI w M2 (F5–F7), filtr dostępności w P2 i tydzień na P3 (E2-S5 T4, E2-S6 T2 — korzystają z API z E3-S3).
  - Synchronizacja Outlook (L8), zapis wydarzeń do kalendarza Google mentora (Q17), Web Push (L9).

## Model domeny

### `Booking` — maszyna stanów (spec stacku §4.3, kod: `scheduling/domain/booking.state.ts`)

Tabela przejść z §4.3 już jest w kodzie z testami. F3 **używa** przejść: `checkout_started`, `confirmed_with_credit`, `hold_expired`, `payment_succeeded`, `mentor_accepted`, `auto_accepted`, `mentor_declined`, `calendar_conflict`, `rescheduled`, `cancelled_free`, `cancelled_late`, `cancelled_by_mentor`. Przejścia `started`, `ended`, no-show, spory i `settled` zostają nieużywane do F5/F6.

F3 **dopisuje** (nowy wiersz tabeli + test; zmiana do naniesienia w §4.3 spec stacku przy akceptacji — Q7):

```ts
hold:      { …, hold_released: 'expired' },              // uczeń rezygnuje z blokady / wybiera inny termin
requested: { …, cancelled_by_student: 'cancelled' },     // uczeń wycofuje prośbę przed decyzją mentora (zawsze bez kosztów)
```

**Potwierdzanie przed F4 (Q-B2, A8 — Q1):** rezerwacja przechodzi **tą samą drogą co w F4**, a o płatności decyduje port:

```
sesja próbna:  hold ──checkout_started──▶ pending_payment ──payment_succeeded──▶ requested ──mentor_accepted / auto_accepted──▶ scheduled
kolejna sesja: hold ──confirmed_with_credit──▶ scheduled
```

- `PaymentGate.start(booking)` → `{ kind: 'paid' } | { kind: 'pending', clientSecret }`. Adapter F3 `NoPaymentGate` zwraca `paid` od razu, więc komenda `checkout` w **jednej transakcji** wykonuje `checkout_started` i `payment_succeeded` (próbna kończy w `requested`). W F4 adapter Stripe zwraca `pending`, a `payment_succeeded` przychodzi z webhooka przez `billing` — bez zmiany maszyny, tabeli i API.
- `CreditReservation.reserve(booking, em)` → `ok | insufficient_credit`. Adapter F3 `UnmeteredCredit` zawsze zwraca `ok` (brak salda w Now); w F4 adapter woła `ledger` w tej samej transakcji (spec §4.5 „rezerwacja kredytu”).
- Wybór adapterów: zmienna `BOOKING_PAYMENT_MODE=none|stripe` (env walidowany zod, domyślnie `none`; `stripe` dopiero w F4). Rezerwacja zapisuje `payment_mode` — F4 rozpozna rezerwacje sprzed płatności.

### `Booking` — dane (schemat `scheduling`)

`booking`: `id` (UUID v7), `mentor_id` (FK `identity.user`), `student_id` (FK `identity.user`), `type` (`trial` | `plan`; `single` zostaje w typie, nieużywany — Q2), `status`, `starts_at`, `ends_at`, `buffer_minutes` (migawka bufora mentora z chwili rezerwacji), `during tstzrange` (kolumna generowana: `[starts_at, ends_at + buffer)`), `hold_expires_at`, `goal` (20–500 znaków, wymagany dla próbnej), `price_amount bigint` + `currency` (migawka ceny — Q3), `payment_mode`, `accept_deadline_at` (próbna), `decline_reason`, `decline_comment`, `cancelled_by` (`student` | `mentor` | `system`), `cancel_reason`, `reschedule_count`, `version`, `created_at`, `updated_at`.

Ograniczenia (spec §4.4, ręczny SQL w migracji):

```sql
ALTER TABLE scheduling.booking ADD CONSTRAINT booking_mentor_no_overlap
  EXCLUDE USING gist (mentor_id WITH =, during WITH &&)
  WHERE (status IN ('hold', 'pending_payment', 'requested', 'scheduled', 'in_progress'));
ALTER TABLE scheduling.booking ADD CONSTRAINT booking_student_no_overlap
  EXCLUDE USING gist (student_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
  WHERE (status IN ('hold', 'pending_payment', 'requested', 'scheduled', 'in_progress'));
CREATE UNIQUE INDEX booking_one_trial_per_pair ON scheduling.booking (student_id, mentor_id)
  WHERE type = 'trial' AND status NOT IN ('expired', 'cancelled', 'refunded', 'no_show_mentor');
```

- `createHold` w tej samej transakcji, **przed** `INSERT`, wygasza nieaktualne blokady nachodzące na przedział (`UPDATE … SET status='expired' WHERE … hold_expires_at <= now() AND during && $2`) — predykat ograniczenia nie może zawierać `now()`. Job pg-boss co minutę sprząta resztę; odczyty slotów filtrują `hold_expires_at > now()`.
- `23P01` na `booking_mentor_no_overlap` → `scheduling.slot_taken` (409); na `booking_student_no_overlap` → `scheduling.student_busy` (409, „Masz już sesję w tym czasie”); `23505` na `booking_one_trial_per_pair` → `scheduling.trial_already_used` (409).
- `late_cancelled` (próbna anulowana < 12 h) **nadal** blokuje kolejną próbną u tego mentora — zgodnie z indeksem §4.4 (Q6).
- Przełożenie = `UPDATE starts_at, ends_at` tej samej rezerwacji w jednej transakcji (stary termin zwalnia się atomowo).

### Dostępność

| Obiekt | Pola | Reguły (źródło: KONCEPCJA M3, backlog E3-S2) |
|---|---|---|
| `MentorSchedule` (1 na mentora) | `mentor_id`, `time_zone` (IANA, domyślnie z przeglądarki przy pierwszym zapisie), `min_notice_minutes`, `buffer_minutes`, `version` | wyprzedzenie 2–48 h (domyślnie 6 h, KONCEPCJA U1); bufor 0–30 min co 5 (domyślnie 0) |
| `AvailabilityRule` (szablon tygodniowy, zapisywany w całości) | `weekday` (1–7, ISO), `start_local`, `end_local` (`Temporal.PlainTime`) | przedziały w dniu bez nakładania; każdy ≥ 30 min; granice w siatce 30 min; `end > start` (przedział przez północ = dwa przedziały); suma tygodniowa ≥ 3 h wymagana tylko do wysłania wniosku M1 (F2) |
| `AvailabilityException` | `starts_at`, `ends_at` (instant), `kind` (`off` = urlop / blokada, `extra` = dodatkowe godziny), `note?` | ≥ 30 min; nie w przeszłości; w horyzoncie rezerwacji (Q10); wyjątki tego samego rodzaju się nie nakładają |
| `CalendarConnection` (E3-S10) | `mentor_id`, `provider` (`google`), `status` (`connected` \| `error` \| `revoked`), zaszyfrowany refresh token, `last_synced_at`, `last_error` | jedno połączenie na mentora |
| `ExternalBusy` (cache) | `mentor_id`, `starts_at`, `ends_at`, `fetched_at` | TTL 5 min; odświeżany przy zapytaniu o sloty i przed potwierdzeniem (Q17) |

**Publiczne zapytanie dla `catalog`** (F2 krok 5, warunek wysłania wniosku): `getWeeklyAvailabilityMinutes(mentorUserId) → number` — suma minut szablonu w czasie lokalnym mentora (bez wyjątków). Kierunek zależności: `catalog → scheduling` (zapytanie). `scheduling` o `catalog` dowiaduje się wyłącznie ze zdarzeń (bez cyklu, reguła 5 §2.4).

**Zmiana dostępności nie anuluje sesji (Q11).** Zapis szablonu lub wyjątku `off`, który nachodzi na rezerwacje `requested`/`scheduled`, zwraca listę kolizji (`scheduling.availability_conflicts`, 409 z listą); ponowny zapis z `acknowledgeConflicts: true` zapisuje zmianę, a sesje zostają (M3 pokazuje je jako „poza dostępnością — przełóż lub odwołaj”).

### Silnik slotów `slotsFor` (spec §4.1, §4.10; `domain/policies/slots-for.policy.ts`)

```ts
slotsFor(input: {
  rules: readonly AvailabilityRule[]; exceptions: readonly AvailabilityException[];
  busy: readonly Interval[];          // rezerwacje blokujące (z buforem) + ExternalBusy
  timeZone: string;                   // strefa mentora
  settings: { minNotice: Duration; buffer: Duration };
  duration: Duration;                 // 30 | 60 min
  range: { from: Instant; to: Instant };
  now: Instant;
}): Instant[]                         // początki slotów, rosnąco, bez duplikatów
```

- Czysta funkcja, zero I/O. Strefa **oglądającego** nie wchodzi do funkcji — wynik to instanty, prezentację robi UI (`DateTime`, brief reguła 10).
- Algorytm: dla każdej lokalnej daty mentora w `range` (± 1 dzień) reguła dnia tygodnia → `ZonedDateTime` z `disambiguation: 'compatible'` (luka wiosenna → później, nakładka jesienna → wcześniejsze wystąpienie) → przedział instantów; plus wyjątki `extra`, minus wyjątki `off`; sloty co 30 min **na osi instantów** od początku przedziału; slot `[s, s + duration)` odpada, gdy `[s, s + duration + buffer)` nachodzi na `busy`, gdy `s < now + minNotice` (dla próbnej `max(minNotice, 6 h)` — Q9) albo `s > now + horyzont` (Q10).
- **Testy właściwości (fast-check, obowiązkowe — §9):** (1) każdy slot leży w całości w dostępności po wyjątkach; (2) `koniec − początek = duration` w czasie rzeczywistym, także w dni zmiany czasu; (3) żaden slot z buforem nie nachodzi na `busy`; (4) wszystkie sloty w `[now + minNotice, now + horyzont]`; (5) wynik posortowany i bez duplikatów; (6) dodanie rezerwacji na zwrócony slot usuwa ten slot i tylko sloty z nim kolidujące; (7) w ostatnią niedzielę marca i października (`Europe/Warsaw`, `Europe/London`, `America/New_York`, `Asia/Kolkata`) liczba slotów reguły = rzeczywista długość przedziału / 30 min; (8) przesunięcie `now` o 1 ms nie dodaje slotu przed `now + minNotice`. Generatory: strefy z listy IANA, reguły w siatce 30 min, `now` wokół dat zmiany czasu.
- Przykłady w testach jednostkowych: reguła 01:30–03:30 w niedzielę 29.03.2026 (`Europe/Warsaw`) daje 1 h rzeczywistego czasu (2 sloty 30 min); 01:30–03:30 w niedzielę 25.10.2026 daje 3 h (6 slotów); uczeń w `America/New_York` widzi te same instanty z innymi godzinami.

### Polityki (`domain/policies/`, stałe w `config.ts` z odnośnikiem do decyzji)

`canCancelFree` (jest; Z4, 12 h), `canReschedule(booking, now)` (status `scheduled` i `canCancelFree`), `canJoin(booking, now)` (`scheduled` i `now ≥ start − 10 min` — w F3 tylko do wyświetlenia), `autoAcceptDeadline(createdAt, startsAt) = min(createdAt + 24 h, startsAt − 2 h)` (§4.3), `holdExpiresAt(now) = now + 10 min` (reguła 5), `bookingHorizon` (Q10), `trialMinNotice` (Q9), `declineReasonPolicy` (lista + „inne” 10–300 znaków), `goalPolicy` (20–500 znaków), `trialPrice` (Q3), `isUpcoming(booking, now)` (Q4).

### Projekcja `mentor_bookability` (dane `catalog` w `scheduling`)

`mentor_id`, `mentor_profile_id`, `is_bookable` (profil `approved`), `accepting_new` (Q13), `rate_60_amount`, `currency`, `updated_at`. Źródło: zdarzenie `catalog.mentor_bookability_changed.v1` przez inbox `scheduling.inbox_event`. `createHold` odrzuca mentora niedostępnego (`scheduling.mentor_unavailable`, 404 w U1) i — dla próbnej — z wstrzymanym przyjmowaniem (`scheduling.not_accepting_new`, 409).

### Zdarzenia (spec §4.7, schematy w `packages/contracts/src/events`)

| Zdarzenie | Nadawca → odbiorcy | Ładunek (identyfikatory + minimum) | Skutek w F3 | Skutek w F4+ |
|---|---|---|---|---|
| `catalog.mentor_bookability_changed.v1` | `catalog` → `scheduling` | `mentorUserId`, `mentorProfileId`, `bookable`, `acceptingNew`, `rate60` | projekcja `mentor_bookability`; przy `bookable: false` z powodu zawieszenia → anulowanie przyszłych sesji (Q5) | — |
| `scheduling.booking_requested.v1` | `scheduling` → `notifications` | `bookingId`, `mentorId`, `studentId`, `startsAt`, `endsAt`, `acceptDeadlineAt` | e-mail i powiadomienie do mentora „Nowa prośba o sesję próbną” | — |
| `scheduling.booking_confirmed.v1` | `scheduling` → `notifications`, (F4) `ledger` | `bookingId`, `type`, `mentorId`, `studentId`, `startsAt`, `endsAt`, `price`, `confirmedBy` (`mentor` \| `auto` \| `credit`) | e-maile do obu stron z `.ics`, zaplanowanie przypomnień | `ledger`: dla `plan` kredyt już zarezerwowany synchronicznie (port) — zdarzenie tylko do audytu |
| `scheduling.booking_declined.v1` | `scheduling` → `notifications`, (F4) `billing` | `bookingId`, `reason` (`mentor_declined` \| `calendar_conflict` \| `mentor_suspended`), `comment?` | e-mail do ucznia + 3 podobnych mentorów (F1 KONCEPCJI) | `billing`: zwrot 100% próbnej |
| `scheduling.booking_rescheduled.v1` | `scheduling` → `notifications` | `bookingId`, `previousStartsAt`, `startsAt`, `endsAt` | e-mail do mentora, nowe przypomnienia (stare stają się nieaktualne) | — |
| `scheduling.booking_cancelled.v1` (zastępuje `booking.cancelled.v1` z F0) | `scheduling` → `notifications`, (F4) `ledger`, `billing` | `bookingId`, `type`, `cancelledBy`, `reason`, `isFree`, `startsAt` | e-mail do drugiej strony | `ledger`: `isFree` lub `cancelledBy ≠ student` → zwolnienie rezerwacji kredytu; `late` → kredyt zostaje do rozliczenia (§4.5); `billing`: próbna wycofana przed akceptacją → zwrot |
| `scheduling.booking_expired.v1` | `scheduling` → (F4) `billing` | `bookingId`, `fromStatus` | brak (wygasła blokada nie generuje powiadomień) | `billing`: płatność po wygaśnięciu → zwrot 100% (§4.4) |

Kierunki: `scheduling` nie importuje `notifications`, `ledger` ani `billing` (tylko zdarzenia); `notifications` importuje publiczne zapytania `scheduling` i `identity` (aktualny stan i adres przy wysyłce). Publikacja przez `eventPublisher.publish(em, events)` w transakcji zmiany, konsumpcja przez `withInbox` (`scheduling/AGENTS.md` „Wzoruj się na”).

### Powiadomienia (`notifications`)

`Notification`: `id`, `user_id`, `type`, `payload jsonb` (identyfikatory), `link` (głęboki link: U5, M2, M2·s, U1), `read_at`, `created_at`. Kanały w F3: **in-app (S2) + e-mail** (Q15). Szablony (React Email, teksty w kodzie szablonu po polsku — wyjątek od `messages/pl.json` uzgodniony w Q15):

| Typ | Odbiorca | Wyzwalacz |
|---|---|---|
| `trial_requested` | mentor | `booking_requested` (+ przypomnienie 2 h przed `acceptDeadlineAt`) |
| `booking_confirmed` | uczeń, mentor | `booking_confirmed` (z `.ics`) |
| `trial_declined` | uczeń | `booking_declined` (powód, 3 podobnych mentorów) |
| `booking_rescheduled` | mentor (uczeń — tylko in-app) | `booking_rescheduled` |
| `booking_cancelled` | druga strona | `booking_cancelled` |
| `reminder_24h`, `reminder_1h` | uczeń, mentor | job `sendAfter` = start − 24 h / − 1 h; pomijany, gdy rezerwacja powstała później niż termin przypomnienia |
| `calendar_sync_failed` | mentor | błąd `CalendarSync` (E3-S10) |
| `email_verification`, `password_reset`, `email_change` | użytkownik | `identity` (E3-S9) |

Przypomnienie: job z `singletonKey = reminder:{bookingId}:{24h|1h}:{startsAt}`; handler pobiera rezerwację przez zapytanie `scheduling` i wysyła tylko, gdy status to `scheduled`, a `startsAt` się zgadza (przełożona/anulowana → brak efektu). Wysyłka e-maila idempotentna po `notificationId` (nagłówek i klucz w transporcie).

### E-mail (`shared/infrastructure/email`)

`EmailTransport.send({ to, subject, html, text, idempotencyKey })`: adapter SES v2 (eu-central-1, konfiguracja w env zod), `LogEmailTransport` (dev, jak w F1), `FileEmailTransport` (E2E: plik JSON w katalogu tymczasowym, Playwright odczytuje link), fake w module z testem kontraktowym (lekcja backend 2026-11-23: fake obok portu, nie w `packages/testing`). Porty modułów (`EmailVerificationSender`, `PasswordResetSender`, `NotificationEmailSender`) mają adaptery na tym transporcie — `identity` nie zależy od `notifications`.

## Wymagania

1. **M3:** tydzień z sesjami (`requested`, `scheduled`) i dostępnością w strefie mentora (podpisanej), przewijanie tygodni. Edytor szablonu: klik i przeciągnięcie po siatce 30 min, pełna obsługa klawiaturą (strzałki, Spacja, Shift+strzałki — WCAG 2.1.1), podgląd sumy godzin tygodniowo. Wyjątki: dialog (zakres dat i godzin, rodzaj, notatka). Ustawienia: wyprzedzenie, bufor, wstrzymanie przyjmowania nowych uczniów. Pusta dostępność → baner „Uczniowie nie mogą cię zarezerwować” z akcją. Konflikt z sesjami → lista sesji (wymaganie Q11). Zapis → toast „Zapisano”.
2. **M1·5 (osadzenie):** edytor szablonu i pola strefy są eksportowane jako komponent-liść (`AvailabilityTemplateForm`) z serwisem zapisu, którego E2-S3 używa w kroku 5 bez kopii logiki; walidacja ≥ 3 h działa w `catalog` przez `getWeeklyAvailabilityMinutes`.
3. **U1:** nagłówek z mentorem (`MentorSummaryBar`), długość (próbna: 30 min stałe; kolejna sesja: 30/60 — Q2), tydzień z przewijaniem w horyzoncie (Q10), sloty w strefie ucznia z przełącznikiem strefy (Q12), `PolicyNotice` o regule 12 h, „Dalej” zablokowane z powodem do wyboru slotu. Stany: L szkielet siatki; E — brak slotów w tygodniu → „Następny wolny termin: …” + skok; brak w horyzoncie → informacja i podobni mentorzy; Er — „Nie udało się wczytać terminów” + Ponów; 409 → toast „Ten termin został właśnie zajęty” i odświeżona siatka. Gość widzi sloty; „Dalej” prowadzi przez logowanie z `returnTo` (zachowany slot w URL). Uczeń z nieweryfikowanym e-mailem: blokada z komunikatem i „Wyślij link ponownie” (GAP-03) — `createHold` zwraca `scheduling.email_not_verified` (403), UI pokazuje to samo przed kliknięciem. Mentor i admin nie rezerwują (403, przycisk ukryty — konto ma jedną rolę, Z10).
4. **Blokada:** „Dalej” → `POST /bookings/holds` (Idempotency-Key) → U2. Uczeń ma najwyżej **jedną** aktywną blokadę; nowa zwalnia poprzednią (Q18). Wygaśnięcie: `HoldCountdown` w U2, po czasie → powrót do U1 z zachowanym mentorem i komunikatem.
5. **U2 (bez płatności):** podsumowanie (mentor, termin w strefie ucznia, długość, cena — Q3), „Z czym przychodzisz?” (20–500 znaków, wymagane dla próbnej), `HoldCountdown`, „Zmień termin” (zwalnia blokadę), „Potwierdź rezerwację” → `POST /checkout` (F3: `{ kind: 'confirmed', bookingId }`; F4: `{ kind: 'payment_required', clientSecret }`). Tekst „Płatności uruchomimy wkrótce — ta rezerwacja jest bezpłatna” (Q1).
6. **U3:** próbna: „Prośba wysłana — mentor odpowie do <termin>”; kolejna sesja: „Sesja umówiona”. Przycisk „Dodaj do kalendarza” (`.ics`, UID = `bookingId@kompas`, `SEQUENCE` = `reschedule_count`), link do U5.
7. **U4:** zakładki Nadchodzące (rosnąco) / Minione (malejąco, z kursorem), `NextSessionCard` z „Dołącz” nieaktywnym do T-10 min i w F3 z opisem „Pokój sesji udostępnimy wkrótce” (Q4), wiersze `SessionListItem` ze statusem, filtr po mentorze. Prośba `requested`: „Czeka na potwierdzenie mentora do <termin>”. Stany L/E („Nie masz jeszcze sesji” + CTA do P2)/Er/S. Blokady (`hold`, `expired`) się nie wyświetlają.
8. **U5:** dane sesji, cel, `BookingStatusBadge`, akcje zależne od stanu: `requested` — „Wycofaj prośbę” (zawsze bez kosztów); `scheduled` ≥ 12 h — „Przełóż”, „Anuluj” (bez kosztów do <godzina>); `scheduled` < 12 h — przełożenie zablokowane z powodem, anulowanie z ostrzeżeniem „Sesja przepadnie” (`PolicyNotice` `late`, `AlertDialog`); po starcie — brak akcji zmiany z wyjaśnieniem. Cudza lub nieistniejąca sesja → jeden komunikat 404 (bez ujawniania istnienia). Mentor zawieszony → sesja anulowana przez system, komunikat „Mentor jest obecnie niedostępny” i podobni mentorzy (Q5, GAP-09).
9. **Przełożenie:** arkusz `Sheet` ze `SlotGrid` (te same sloty co U1, bez slotu obecnego), potwierdzenie z nowym terminem; wyścig o slot → 409 i odświeżenie; brak slotów w 14 dni → informacja „Mentor nie ma wolnych terminów w ciągu 14 dni” + podobni (wiadomość — F6) (Q8).
10. **M2:** „Dzisiaj” (`TodayAgenda`, „Dołącz” jak w U4), „Prośby o sesję próbną” (`TrialRequestCard` z terminem odpowiedzi i zdaniem o auto-akceptacji), status profilu (`ProfileStatusCard` z F2), baner braku dostępności. Odrzucenie przez wzorzec „Decyzja z powodem” (lista + „inne” 10–300 znaków). Błąd jednej sekcji → Ponów tylko w niej. Dla mentora przed `approved` `/mentor` zostaje stroną statusu z F2.
11. **Auto-akceptacja:** job pg-boss `sendAfter = acceptDeadlineAt`, `singletonKey = accept:{bookingId}`; handler: gdy rezerwacja nadal `requested` — sprawdza freebusy (gdy kalendarz podłączony i `connected`): wolne → `auto_accepted`, zajęte → `calendar_conflict`; bez kalendarza → `auto_accepted`. Ręczna akceptacja mentora też sprawdza freebusy i ostrzega (nie blokuje).
12. **Anulowanie przez mentora (M2·s):** `scheduled` lub `requested` przed startem, z powodem z listy + komentarzem; skutek dla ucznia zawsze bez kosztów (`cancelled_by_mentor` / `mentor_declined`). Mentor nie przekłada sesji (Q8).
13. **S2:** lista powiadomień (kursor, najnowsze na górze), głębokie linki, „Oznacz jako przeczytane” (pojedynczo i wszystkie), w `AppHeader` dzwonek z kropką nieprzeczytanych (bez licznika — zasada R02.4 design systemu).
14. **Weryfikacja e-maila (F1 Q2):** wymuszona w `createHold` i `checkout`; po rejestracji baner „Potwierdź e-mail, zanim zarezerwujesz pierwszą sesję” z „Wyślij link ponownie” (GAP-05) w U4/P3/U1, do czasu weryfikacji.
15. **s04/s05:** „Nie pamiętasz hasła?” na P4 → s04 (e-mail; zawsze ta sama odpowiedź „Jeśli konto istnieje, wysłaliśmy link” — brak enumeracji kont; limit prób Better Auth) → e-mail z linkiem ważnym 1 h → s05 (nowe hasło wg polityki F1, sprawdzenie HIBP, token jednorazowy; wygasły → „Link wygasł” + ponowne żądanie) → wylogowanie wszystkich sesji i logowanie (Q21).
16. **Zmiana e-maila (S3·e):** wymaga hasła; link weryfikacyjny na **nowy** adres, powiadomienie na stary; do kliknięcia obowiązuje stary adres; konto OAuth bez hasła → komunikat (Q21).
17. **Google Calendar (E3-S10):** „Połącz z Google Calendar” w M3 (OAuth, zakres `calendar.freebusy`, Q17), stan połączenia, „Rozłącz”; zajęte przedziały z kalendarza nie dają slotów; błąd tokenu → status `error`, karta „Połącz ponownie”, e-mail do mentora, a sloty liczone bez kalendarza (fail-open, Q17).
18. **Autoryzacja:** nowe uprawnienia `scheduling.availability.manage.own` (mentor), `scheduling.booking.create` (student), `scheduling.booking.manage.own` (uczestnik: student, mentor), `scheduling.trial_request.decide.own` (mentor), `notifications.read.own` (wszyscy). Identyfikatory użytkownika zawsze z sesji, nigdy z ciała żądania; cudza rezerwacja → 404.
19. **Teksty i stany:** wszystkie teksty UI w `apps/web/messages/pl.json`, stany L/E/Er/S na każdym ekranie, WCAG 2.2 AA (0 naruszeń axe serious/critical), 360 i 1280 px. Każda data i godzina przez `DateTime` w strefie oglądającego, z podpisaną strefą przy siatkach.
20. **Kontrakty (oRPC `/api/v1`, RFC 9457 dla błędów):** `GET /mentors/:id/availability?from=&to=&duration=&type=` (publiczne, `:id` = id profilu), `POST /bookings/holds`, `GET /bookings/holds/:id`, `DELETE /bookings/holds/:id`, `POST /checkout`, `GET /bookings/:id`, `GET /bookings/:id/ics`, `GET /me/bookings?status=upcoming|past&mentorId=&cursor=`, `POST /bookings/:id/reschedule`, `POST /bookings/:id/cancel` (odpowiedź z `refundToBalance: boolean` — w F3 informacyjnie), `POST /bookings/:id/accept`, `POST /bookings/:id/decline`, `GET /mentor/dashboard`, `GET /mentor/calendar?from=&to=`, `PUT /mentor/availability/template`, `POST /mentor/availability/exceptions`, `DELETE /mentor/availability/exceptions/:id`, `PATCH /mentor/settings`, `POST /integrations/google-calendar` (start OAuth), `GET /integrations/google-calendar/callback`, `DELETE /integrations/google-calendar`, `GET /me/notifications`, `POST /me/notifications/read`, `PATCH /me` (strefa czasowa). Reset hasła i zmiana e-maila — trasy Better Auth `/api/auth/*` (lekcja backend: limit prób działa tylko w handlerze HTTP).

## Kryteria akceptacji

- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone; testy integracyjne i E2E w CI zielone; brak nowych ostrzeżeń Knip i dependency-cruiser (granice `scheduling` ↔ `catalog` ↔ `notifications` ↔ `identity` tylko przez `index.ts` i zdarzenia, bez cykli).
- [ ] **[M3]** Polityki dostępności mają testy na granicach: przedział 29/30 min, nakładanie się, wyprzedzenie 1 h 59 min / 2 h / 48 h / 48 h 1 min, bufor 0/30/31 min, przedział przez północ odrzucony z podpowiedzią; pokrycie gałęzi `scheduling/domain` ≥ 90%.
- [ ] **[M3]** Usunięcie dostępności nachodzącej na sesję `scheduled` zwraca listę kolizji; zapis z potwierdzeniem nie zmienia rezerwacji (test integracyjny + E2E).
- [ ] **[M3]** Edytor obsługiwany samą klawiaturą (E2E: zaznaczenie wtorku 18:00–20:00 bez myszy); pusta dostępność → baner; E2E 360/1280 + axe.
- [ ] **[M1·5]** `getWeeklyAvailabilityMinutes` zwraca sumę szablonu (test jednostkowy przypadków 2 h 59 min / 3 h); komponent edytora osadzalny bez zmian w kroku 5 (story „W onboardingu”).
- [ ] **[U1]** `slotsFor` przechodzi testy właściwości fast-check (8 właściwości z „Silnik slotów”) i przykłady DST 29.03.2026 i 25.10.2026; uczeń w innej strefie widzi te same instanty (E2E ze zmianą strefy).
- [ ] **[U1]** Równoległe `createHold` na ten sam slot: dokładnie jedna blokada, reszta `scheduling.slot_taken` (test integracyjny z N równoległymi transakcjami); wygasła blokada nie blokuje slotu (FakeClock + `hold_expires_at`); uczeń nie ma dwóch nakładających się sesji u różnych mentorów (`scheduling.student_busy`); druga próbna u tego samego mentora → `scheduling.trial_already_used`, a po `expired`/`cancelled` próba jest znów możliwa.
- [ ] **[U1]** Nieweryfikowany e-mail → blokada z „Wyślij link ponownie” (E2E) i 403 z komendy; mentor `suspended` lub nie-`approved` → 404 „Profil niedostępny”; `accepting_new = false` → próbna zablokowana z komunikatem, kolejna sesja dozwolona.
- [ ] **[U1, U2]** Idempotency-Key: powtórzenie `POST /bookings/holds` z tym samym kluczem zwraca tę samą blokadę; ten sam klucz z innym ciałem → 422; równoległe → 409.
- [ ] **[U2]** Wygasła blokada → „Potwierdź” zwraca `scheduling.hold_expired` i UI wraca do U1 z komunikatem (E2E z FakeClock); cel 19/20/500/501 znaków; `checkout` w jednej transakcji zmienia stan i dodaje zadanie zdarzenia (rollback → brak zdarzenia).
- [ ] **[U2, U3]** E2E przepływu F1 KONCEPCJI bez płatności: P3 → U1 → logowanie z `returnTo` → U2 → U3 („Prośba wysłana”) → M2 mentor akceptuje → U4 pokazuje sesję `scheduled`; `.ics` ma poprawny `DTSTART` w UTC.
- [ ] **[U4]** Nadchodzące/minione wg Q4 (test zapytania z FakeClock); kursor nie gubi ani nie dubluje sesji przy równych `starts_at`; „Dołącz” nieaktywne przed T-10 min.
- [ ] **[U5]** Akcje zależne od stanu: `scheduled` 13 h przed startem — przełożenie i darmowe anulowanie; 11 h — przełożenie zablokowane, anulowanie z ostrzeżeniem i stanem `late_cancelled` (E2E z FakeClock, oba przypadki); cudza sesja → 404 (student i mentor innej pary).
- [ ] **[U5]** Dwa równoległe przełożenia różnych sesji na ten sam slot mentora: jedno się udaje, drugie dostaje 409, a sesja zostaje w starym terminie (test integracyjny wyścigu, §4.4).
- [ ] **[U5, M2·s]** Zawieszenie mentora (zdarzenie z `catalog`) anuluje jego przyszłe sesje `requested`/`scheduled` z `cancelledBy = system`, wysyła powiadomienia i nie wpływa na sesje minione; duplikat zdarzenia bez efektu (test inbox).
- [ ] **[M2]** Akceptacja i odrzucenie (powód wymagany, „inne” 10–300 znaków) — testy komend i E2E; auto-akceptacja po `acceptDeadlineAt` (FakeClock) i `calendar_conflict` przy zajętym freebusy (fake `CalendarSync`); ponowne wykonanie joba bez efektu; konkurencyjna decyzja mentora i joba → jedna wygrywa (`version`), druga bez efektu.
- [ ] **[S2]** Przypomnienia 24 h / 1 h: zaplanowane po potwierdzeniu, pominięte dla rezerwacji utworzonej < 24 h przed startem, bez efektu po przełożeniu (stary termin) lub anulowaniu (test z FakeClock i fake'iem transportu); lista S2 z głębokimi linkami i „Oznacz jako przeczytane” (E2E).
- [ ] **[S2]** Test kontraktowy `EmailTransport` przechodzi na fake'u i adapterze plikowym; adapter SES sprawdzony ręcznie na sandboksie SES (zapis w runie).
- [ ] **[s04, s05]** Reset: ta sama odpowiedź dla istniejącego i nieistniejącego adresu; link jednorazowy, wygasły → komunikat; hasło z listy HIBP odrzucone; po zmianie wszystkie sesje wylogowane (E2E z linkiem z adaptera plikowego).
- [ ] **[S3·e]** Zmiana e-maila: link na nowy adres, powiadomienie na stary, do potwierdzenia logowanie starym adresem (E2E).
- [ ] **[M3]** Google Calendar: test kontraktowy `CalendarSync` (fake i nagrane odpowiedzi API); przedział zajęty w kalendarzu nie daje slotu; `invalid_grant` → status `error`, karta „Połącz ponownie” i e-mail (E2E na fake'u). Refresh token zaszyfrowany w bazie (test czyta surową kolumnę).
- [ ] **[U1, U2, U3, U4, U5, M2, M2·s, M3, S2, s04, s05]** E2E 360 i 1280 px z axe (0 naruszeń serious/critical) dla każdego ekranu F3.
- [ ] Przegląd człowieka: migracje (`scheduling`, `notifications`, `identity`), moduł `identity` (reset hasła, zmiana e-maila, strefa), szyfrowanie tokenów Google — `.ai/agentic.config.json` `humanReview`.

## Projekt rozwiązania

### `packages/core`

- `src/modules/scheduling/` (rozbudowa szkieletu; struktura §2.4):
  - `domain/` — `booking.entity.ts` (pełny agregat: metody przejść przez `transition`), `booking.state.ts` (+ `hold_released`, `cancelled_by_student`), `booking.events.ts` (zdarzenia z tabeli), `booking.errors.ts` (`scheduling.slot_taken`, `scheduling.student_busy`, `scheduling.trial_already_used`, `scheduling.hold_expired`, `scheduling.mentor_unavailable`, `scheduling.not_accepting_new`, `scheduling.email_not_verified`, `scheduling.too_late_to_reschedule`, `scheduling.already_started`, `scheduling.availability_conflicts`, `scheduling.invalid_availability`, `scheduling.not_found`, `booking.invalid_transition`), `availability.entity.ts` (`MentorSchedule`, `AvailabilityRule`, `AvailabilityException`), `calendar-connection.entity.ts`, `policies/` (`slots-for.policy.ts`, `availability-template.policy.ts`, `can-cancel-free.policy.ts` — jest, `can-reschedule.policy.ts`, `can-join.policy.ts`, `auto-accept-deadline.policy.ts`, `hold.policy.ts`, `decline-reason.policy.ts`, `goal.policy.ts`, `trial-price.policy.ts`, `config.ts`), `ports/` (`payment-gate.ts`, `credit-reservation.ts`, `calendar-sync.ts`).
  - `application/` — `get-mentor-availability.query.ts` (sloty + „następny wolny”), `get-weekly-availability-minutes.query.ts` (publiczne dla `catalog`), `save-availability-template.command.ts`, `availability-exceptions.commands.ts`, `update-mentor-settings.command.ts`, `get-mentor-calendar.query.ts`, `create-hold.command.ts`, `release-hold.command.ts`, `checkout.command.ts`, `get-booking.query.ts`, `list-my-bookings.query.ts`, `reschedule-booking.command.ts`, `cancel-booking.command.ts`, `decide-trial-request.command.ts`, `auto-accept-trial.handler.ts`, `get-mentor-dashboard.query.ts`, `apply-mentor-bookability.handler.ts` (konsument + anulowanie przy zawieszeniu), `calendar-connection.commands.ts`, `get-cancellation-terms.query.ts` (jest).
  - `infrastructure/` — rekordy i repozytoria MikroORM, mapowanie `23P01`/`23505` na błędy domeny (po nazwie ograniczenia), `no-payment-gate.ts`, `unmetered-credit.ts`, `google-calendar-sync.ts` + `fake-calendar-sync.ts` (obok portu — lekcja 2026-11-23), `ics.ts` (generator `.ics` bez zależności).
  - `api/` — router oRPC (wymaganie 20). `jobs/` — `expire-holds` (co minutę), `auto-accept-trial` (per rezerwacja), `refresh-external-busy` (na żądanie, singleton per mentor).
  - `migrations/` — schemat `scheduling`: `mentor_schedule`, `availability_rule`, `availability_exception`, `booking` (+ ograniczenia z §4.4, indeksy `(student_id, starts_at)`, `(mentor_id, starts_at)`, `(status, hold_expires_at)`), `mentor_bookability`, `calendar_connection`, `external_busy`, `inbox_event`; `CREATE EXTENSION btree_gist` (jest w obrazie Postgres z F0).
  - `AGENTS.md` — aktualizacja „Niezmienników” (ograniczenia w bazie obowiązują) i „Wzoruj się na” (`slotsFor` + fast-check, `createHold` + test wyścigu).
- `src/modules/notifications/` (nowy, struktura §2.4): `domain/` (`notification.entity.ts`, `reminder.policy.ts`, `config.ts`), `application/` (konsumenci `scheduling.*`, `send-reminder.handler.ts`, `list-my-notifications.query.ts`, `mark-read.command.ts`), `infrastructure/` (repozytorium, `notification-email-sender.ts` na `EmailTransport`), `templates/` (React Email, po polsku), `migrations/` (schemat `notifications`: `notification`, `inbox_event`), `AGENTS.md` + `CLAUDE.md`.
- `src/shared/infrastructure/email/` — `email-transport.ts` (port), `ses-email-transport.ts`, `log-email-transport.ts`, `file-email-transport.ts`, fake + test kontraktowy; zmienne `SES_REGION`, `EMAIL_FROM`, `EMAIL_TRANSPORT=ses|log|file` w env zod.
- `src/shared/infrastructure/idempotency/` — tabela `platform.idempotency_key` (klucz, użytkownik, odcisk żądania, odpowiedź, `created_at`, wygaszanie po 24 h), middleware oRPC.
- `src/shared/infrastructure/crypto/` — `FieldCipher` (AES-256-GCM, wersja klucza) przeniesiony z `payouts` (F2 krok 7), żeby `scheduling` szyfrował tokeny Google tym samym mechanizmem (klucz `SCHEDULING_ENCRYPTION_KEY`). Jeśli krok 7 F2 nie jest jeszcze scalony — powstaje tu i `payouts` go używa.
- `src/modules/identity/` — kolumna `time_zone` w `user` (nullable; ustawiana z przeglądarki), `getCurrentUser` z `emailVerified` i `timeZone`, port `PasswordResetSender`, konfiguracja Better Auth `sendResetPassword`, `revokeSessionsOnPasswordReset`, `changeEmail` z `sendChangeEmailVerification`; nowe uprawnienia (wymaganie 18).
- `src/modules/catalog/` — publikacja `catalog.mentor_bookability_changed.v1` przy `approved`, `suspended`, `reinstated`, zmianie stawki i `accepting_new`; komenda `setAcceptingNew` (wywoływana z M3); zapytanie podobnych mentorów używane w U1/U5 (jest w planie F2 krok 13).

### `packages/contracts`

`scheduling/` (sloty, blokada, checkout z unią odpowiedzi, rezerwacja, lista, przełożenie, anulowanie, decyzja, szablon, wyjątki, ustawienia — te same kody problemów co domena, lekcja backend 2026-11-23), `notifications/`, `identity/` (strefa), `events/` (schematy zdarzeń z tabeli, w tym nowa wersja nazwy `scheduling.booking_cancelled.v1`), routery oRPC.

### `packages/ui` (Storybook — design system, ADR-0006)

- **Do użycia z istniejących:** `SlotGrid` (U1, arkusz przełożenia U5, P3), `HoldCountdown` (U2), `BookingStatusBadge` (U4, U5, M2·s), `SessionListItem` (U4, M2·s historia), `NextSessionCard` (U4), `TodayAgenda` (M2), `TrialRequestCard` (M2), `PolicyNotice` (U1, U5, dialog anulowania), `DateTime` (wszędzie), `Money` (U1–U3), `PageHeader`, `AppHeader` (dzwonek S2), `MentorCard` (podobni mentorzy), `ProfileStatusCard` (z F2, M2); wzorce `patterns/slot-hold` (U1→U2), `patterns/change-12h` (U5), `patterns/decision-reason` (odrzucenie prośby, anulowanie przez mentora), `patterns/form` (M3 ustawienia, s04, s05, S3·e), `patterns/detail-view` (U5, M2·s); ekrany-wzorce `screens/u1-booking`, `screens/u5-session`, `screens/m2-dashboard`; komponenty bazowe `ToggleGroup` (długość 30/60 — zamiast nowego `Segmented`, DS-04), `Combobox` (strefa czasowa, DS-20), `Sheet`, `AlertDialog`, `Dialog`, `Tabs`, `Alert`, `EmptyState`, `ErrorState`, `Skeleton`, `Toast`, `Switch`, `Field`, `Input`, `Select`, `Textarea`, `RadioGroup`.
- **Brakujące (nowe, ze stories, stanami i testem a11y):** `AvailabilityEditor` (DS-05: siatka tydzień × 30 min, klik/przeciągnięcie, klawiatura, suma godzin), `WeekCalendar` (M3: tydzień z sesjami i dostępnością), `ExceptionDialog`, `CalendarSyncCard` (rozłączony / połączony / błąd), `MentorSummaryBar` (U1, U2), `WeekPicker` (przewijanie tygodni z zakresem horyzontu), `TimezoneSelect` (na `Combobox`), `StickyContinueButton` (U1), `OrderSummary` (U2; w F4 dochodzi metoda płatności), `BookingConfirmation` (U3), `RescheduleSheet` (U5: `Sheet` + `SlotGrid`), `NotificationList` + `NotificationBell` (S2, `AppHeader`), `EmailVerificationBanner` (GAP-05). Nowe ekrany-wzorce: `screens/m3-calendar`, `screens/u4-sessions`, `screens/u2-summary`, `screens/s2-notifications`. Każdy dochodzi w kroku planu, który go używa, z dopiskiem w `docs/design-system.md`.

### `apps/web`

`app/mentor/kalendarz/page.tsx` (M3), `app/mentor/page.tsx` (M2 dla `approved`, status F2 wcześniej), `app/mentor/sesje/[id]/page.tsx` (M2·s), `app/rezerwacja/[mentorId]/page.tsx` (U1), `app/rezerwacja/[mentorId]/platnosc/page.tsx` (U2), `app/rezerwacja/[bookingId]/potwierdzenie/page.tsx` (U3 — segment dynamiczny wspólny z U1; rozróżnienie po prefiksie id lub trasa `/rezerwacja/potwierdzenie/[bookingId]` — decyzja w kroku 12 i wpis w „Decyzje i zmiany”), `app/sesje/page.tsx` (U4), `app/sesje/[id]/page.tsx` (U5), `app/powiadomienia/page.tsx` (S2), `app/haslo/reset/page.tsx` (s04), `app/haslo/nowe/page.tsx` (s05), sekcja zmiany e-maila i strefy w `app/konto`, `app/integracje/google-calendar/callback/route.ts`, `messages/pl.json`. Trasy U* tylko dla roli `student` (inna rola → 403 s08), M* dla `mentor` z profilem `approved` (strażnik z F2).

### `apps/worker`

Konsumenci: `scheduling` ← `catalog.mentor_bookability_changed.v1`; `notifications` ← `scheduling.booking_*`. Joby: `scheduling/expire-holds` (cron co minutę), `scheduling/auto-accept-trial`, `scheduling/refresh-external-busy`, `notifications/send-reminder`, `notifications/send-email` (ponawianie z backoffem, dead-letter), cron sprzątający `platform.idempotency_key`.

### Bezpieczeństwo (OWASP Top 10:2025, spec §8)

- A01: uczestnictwo w rezerwacji sprawdzane w każdym zapytaniu i komendzie (`studentId`/`mentorId` z sesji); cudza → 404; uprawnienia z wymagania 18; testy 403/404.
- A04/A02: refresh token Google szyfrowany (`FieldCipher`), minimalny zakres `calendar.freebusy`, `state` + PKCE w OAuth; tokeny resetu i zmiany e-maila jednorazowe, krótkie (1 h), w Better Auth.
- A07 (uwierzytelnianie): reset bez enumeracji kont, limit prób (handler Better Auth), HIBP, wylogowanie sesji po resecie.
- A05: `goal` i powody jako zwykły tekst (React escapuje; e-mail — escapowanie React Email); parametry zapytań przez zod.
- Nadużycia: jedna aktywna blokada na ucznia, limit 20 blokad / h / ucznia (429 + `Retry-After`) — chroni przed blokowaniem kalendarzy mentorów (Q18).
- Prywatność: e-maile i powiadomienia zawierają imię drugiej strony i termin, bez celu sesji w temacie wiadomości; logi bez treści celu (redakcja pino).

## Plan wdrożenia

Każdy krok to osobny PR (≤ ~400 linii poza migracjami, snapshotami i seedem), w tej kolejności. W nawiasie historia z backlogu. Krok oznaczony „człowiek” nie jest PR-em.

1. **(człowiek, zaraz po akceptacji)** Zgłoszenie weryfikacji aplikacji OAuth Google (zakres `calendar.freebusy`, polityka prywatności, domena) i sandbox SES z weryfikacją domeny nadawcy w eu-central-1. **(E3-S10 T1, E3-S8 T1)**
2. `feat(scheduling)`: domena dostępności — `MentorSchedule`, `AvailabilityRule`, `AvailabilityException`, polityka szablonu (nakładanie, ≥ 30 min, siatka 30 min, wyprzedzenie, bufor), suma tygodniowa; nowe przejścia `hold_released`, `cancelled_by_student` + testy; stałe w `config.ts`. **(E3-S2 T1)**
3. `feat(scheduling)`: migracja (`mentor_schedule`, `availability_rule`, `availability_exception`, `inbox_event`), komendy szablonu, wyjątków i ustawień z wykrywaniem kolizji (na razie bez rezerwacji — lista pusta), `getMentorCalendar`, publiczne `getWeeklyAvailabilityMinutes`, uprawnienie, router oRPC; testy integracyjne (własność, 409 przy wersji). **(E3-S2 T1, T3)** — odblokowuje E2-S3 (krok 8 F2).
4. `feat(ui)`: `AvailabilityEditor`, `WeekCalendar`, `ExceptionDialog`, `CalendarSyncCard` (stan rozłączony), ekran-wzorzec `screens/m3-calendar` ze stories (klawiatura, a11y). **(E3-S2 T2)**
5. `feat(web)`: M3 `/mentor/kalendarz` (tydzień, edytor, wyjątki, ustawienia, baner pustej dostępności), `AvailabilityTemplateForm` do osadzenia w M1·5; E2E 360/1280 + axe. **(E3-S2 T2, T4)**
6. `feat(scheduling)`: `slotsFor` jako czysta funkcja + testy właściwości fast-check (8 właściwości, DST marzec/październik, 4 strefy) i przykłady. **(E3-S3 T1)**
7. `feat(catalog)`: zdarzenie `catalog.mentor_bookability_changed.v1` (publikacja w transakcji zmian profilu), komenda `setAcceptingNew`; konsument w `scheduling` z projekcją `mentor_bookability` (migracja) i testem inbox. **(E3-S3 T2 — przygotowanie, E3-S5 T2 — zawieszenie)**
8. `feat(scheduling)`: `getMentorAvailability` (sloty w zakresie, „następny wolny termin”, horyzont), `GET /mentors/:id/availability`; testy integracyjne z bazą (wyjątki, bufor, strefa mentora). **(E3-S3 T2, T3)** — odblokowuje E2-S5 T4 i E2-S6 T2.
9. `feat(core)`: Idempotency-Key (`platform.idempotency_key` + middleware oRPC + testy: powtórka, inne ciało 422, równoległe 409); `identity`: `time_zone` użytkownika, `emailVerified`/`timeZone` w `getCurrentUser`, nowe uprawnienia `scheduling.*`, `notifications.*`. **(E3-S4 T1 — warunki wstępne)** Przegląd człowieka (`identity`).
10. `feat(scheduling)`: tabela `booking` z ograniczeniami §4.4, `createHold` (wygaszanie przed `INSERT`, mapowanie `23P01`/`23505`, jedna blokada na ucznia, limit, e-mail zweryfikowany, mentor dostępny, `accepting_new`), `releaseHold`, job `expire-holds`; testy integracyjne: N równoległych blokad, wygasła blokada, uczeń w dwóch miejscach, druga próbna, próbna po anulowaniu. Sloty uwzględniają rezerwacje. **(E3-S4 T1, T4)**
11. `feat(scheduling)`: porty `PaymentGate`/`CreditReservation` z adapterami `NoPaymentGate`/`UnmeteredCredit` (`BOOKING_PAYMENT_MODE`), komenda `checkout` (próbna → `requested`, kolejna → `scheduled`), `getBooking`, `.ics`, zdarzenia `scheduling.booking_requested|confirmed|expired.v1` w `contracts/events`; testy integracyjne (rollback = brak zdarzenia, wygasła blokada, cel). **(E3-S4 T3)**
12. `feat(ui)`: `MentorSummaryBar`, `WeekPicker`, `TimezoneSelect`, `StickyContinueButton`, `OrderSummary`, `BookingConfirmation`, `EmailVerificationBanner`; ekran-wzorzec `screens/u2-summary`; aktualizacja `screens/u1-booking` (stan nieweryfikowanego e-maila). **(E3-S4 T2)**
13. `feat(web)`: U1, U2, U3, stan nieweryfikowanego e-maila i baner po rejestracji, odblokowanie CTA na P3 (wyłączenie flagi z F2 Q12); E2E przepływu F1 do `requested` + axe. **(E3-S4 T2, T5; E3-S9 T1 — wymuszenie)**
14. `feat(scheduling)`: `listMyBookings` (kursor, nadchodzące/minione wg Q4, filtr mentora), autoryzacja uczestnika, `canJoin`; anulowanie przyszłych sesji przy zawieszeniu mentora (Q5) + zdarzenie `scheduling.booking_cancelled.v1` / `booking_declined.v1`; seed rezerwacji. **(E3-S5 T1, T2)**
15. `feat(web)`: U4 (`/sesje`), U5 (`/sesje/[id]` — stany, mentor zawieszony, 404), M2·s (`/mentor/sesje/[id]`, tylko podgląd); ekran-wzorzec `screens/u4-sessions`; E2E. **(E3-S5 T1–T3)**
16. `feat(scheduling)`: `canReschedule`, `rescheduleBooking` (`UPDATE` terminu w jednej transakcji, `reschedule_count`), `cancelBooking` (uczeń: `cancelled_free`/`cancelled_late`/`cancelled_by_student`; mentor: `cancelled_by_mentor` z powodem), zdarzenia `booking_rescheduled`/`booking_cancelled` z polami dla `ledger`; Idempotency-Key; test integracyjny wyścigu przełożeń. **(E3-S6 T1, T3)**
17. `feat(web)`: U5 akcje — `RescheduleSheet`, dialog anulowania z `PolicyNotice` (`late`), brak slotów w 14 dni; M2·s anulowanie z powodem; E2E z FakeClock (13 h / 11 h). **(E3-S6 T2, T4)**
18. `feat(scheduling)`: `acceptTrialRequest`/`declineTrialRequest` (powód z listy / „inne” 10–300), `autoAcceptDeadline`, job `auto-accept-trial` (`sendAfter`, singleton, sprawdzenie freebusy przez port — na razie fake/brak połączenia), `getMentorDashboard`, zdarzenie `booking_declined`; testy z FakeClock i wyścig decyzja vs job. **(E3-S7 T1, T2)**
19. `feat(web)`: M2 (`TodayAgenda`, `TrialRequestCard` + „Decyzja z powodem”, `ProfileStatusCard`, baner dostępności, błąd per sekcja); E2E akceptacji i odrzucenia. **(E3-S7 T3, T4)**
20. `feat(core)`: `shared/infrastructure/email` — `EmailTransport` (SES v2, log, plik, fake + test kontraktowy), React Email; adapter `EmailVerificationSender` z F1 na transporcie. **(E3-S8 T1)**
21. `feat(notifications)`: moduł — `Notification`, migracja, konsumenci `scheduling.booking_*`, szablony e-mail, przypomnienia 24 h / 1 h (pomijanie, nieaktualne po przełożeniu), przypomnienie mentorowi o prośbie, preferencja przypomnień (Q15); testy z FakeClock. **(E3-S8 T2, T4)**
22. `feat(web)`: S2 `/powiadomienia`, `NotificationBell` w `AppHeader`, `NotificationList`; ekran-wzorzec `screens/s2-notifications`; E2E. **(E3-S8 T3)**
23. `feat(identity)`: reset hasła s04/s05 (Better Auth `sendResetPassword` przez `PasswordResetSender`, HIBP, unieważnienie sesji, link na P4); E2E z adapterem plikowym. **(E3-S9 T2, T4)** Przegląd człowieka.
24. `feat(identity)`: zmiana e-maila w S3 (link na nowy adres, powiadomienie na stary, konto OAuth bez hasła), strefa czasowa w S3 (`TimezoneSelect`); E2E. **(E3-S9 T3, T4)** Przegląd człowieka.
25. `feat(scheduling)`: port `CalendarSync` + adapter Google (freebusy, OAuth z PKCE, odświeżanie tokenu) + fake + test kontraktowy, `CalendarConnection` (tokeny przez `FieldCipher`), cache `external_busy`, włączenie do `slotsFor`, akceptacji i auto-akceptacji (`calendar_conflict`), status `error` + e-mail. **(E3-S10 T2–T4)**
26. `feat(web)`: `CalendarSyncCard` w M3 (połącz, rozłącz, „Połącz ponownie”), trasa callback; E2E na fake'u. **(E3-S10 T2, T3)**

Zależności: kroki 2–5 odblokowują E2-S3 (krok 8 F2); 6–8 odblokowują E2-S5 T4 i E2-S6 T2; 9–13 wymagają E2-S6 (P3 z CTA); 20 może iść równolegle od kroku 2 (rozłączny zakres: `shared/infrastructure/email`), a 23–24 zaraz po 20; 25–26 po kroku 18 i po weryfikacji OAuth (do tego czasu tryb testowy Google — do 100 użytkowników testowych). Po kroku 26: kryteria odhaczone, `status: implemented`, `git mv` do `implemented/`, naniesienie zmian maszyny `Booking` w §4.3 spec stacku i tras w KONCEPCJI §3.

## Open Questions

Każde pytanie ma rekomendację; po odpowiedziach wpisujemy decyzje w „Decyzje i zmiany” i ustawiamy `status: approved`.

- **Q1. Potwierdzanie rezerwacji przed F4 (Q-B2, A8).** Rekomendacja: rezerwacja przechodzi **tą samą ścieżką co w F4** — `hold → pending_payment → requested` (próbna) przez port `PaymentGate`, którego adapter F3 `NoPaymentGate` „opłaca” natychmiast w tej samej transakcji, a kolejna sesja `hold → scheduled` przez port `CreditReservation` z adapterem `UnmeteredCredit`. Przełącznik `BOOKING_PAYMENT_MODE=none|stripe`, kolumna `payment_mode` w rezerwacji, API `POST /checkout` z unią odpowiedzi od razu. U2 pokazuje „Płatności uruchomimy wkrótce — ta rezerwacja jest bezpłatna”. Alternatywa: nowe przejście `hold → requested` (`confirmed_without_payment`) usuwane w F4 — prostsze dziś, ale zmienia maszynę dwa razy i łamie A8 („bez zmiany modelu rezerwacji”).
- **Q2. Typy rezerwacji w F3.** Rekomendacja: `trial` (pełny przepływ z akceptacją mentora) **i** „kolejna sesja” (`plan`, 30/60 min) — dostępna dla pary uczeń–mentor, której próbna była `scheduled` i jej termin minął; bez limitu N/tydzień (plany w F4). Bez tego reguła 12 h i „sesja wraca do salda” są w Now nie do sprawdzenia poza próbną. Typ `single` zostaje nieużywany. Alternatywa: tylko próbna w F3 (U1 bez wyboru długości).
- **Q3. Cena sesji próbnej.** KONCEPCJA mówi „obniżona cena”, mockupy mają cenę per mentor (0–59 zł), M1 z F2 nie zbiera ceny próbnej. Rekomendacja: **jedna cena platformowa** w `config.ts` (robocza 49 zł, ostateczna przed F4 razem z Q-B4), pokazywana na P3 (CTA), U1–U3 i zapisywana jako migawka w rezerwacji; cena kolejnej sesji = stawka mentora (30 min = połowa, F2 Q9). Alternatywa: mentor ustala cenę próbnej w M1 krok 4 (nowe pole, zmiana F2).
- **Q4. Sesje po terminie przed F5.** Bez pokoju i obecności sesja nie przejdzie do `in_progress`/`completed`. Rekomendacja: w F3 stan zostaje `scheduled`; U4/M2 klasyfikują „minione” po czasie (`ends_at < now`) z etykietą „Termin minął”; „Dołącz” widoczny i nieaktywny („Pokój sesji udostępnimy wkrótce”). F5 doda przejścia i jednorazowe domknięcie starych rezerwacji. Alternatywa: tymczasowe przejście `scheduled → completed` po czasie (zmiana maszyny, której F5 nie chce — rozliczenie zależy od obecności).
- **Q5. Mentor zawieszony a zaplanowane sesje (GAP-09, F2 Q8).** Rekomendacja: zawieszenie **anuluje przyszłe sesje** mentora (`requested` → `mentor_declined`, `scheduled` → `cancelled_by_mentor`, powód `mentor_suspended`, `cancelledBy = system`), aktywne blokady wygasają, uczniowie dostają e-mail z 3 podobnymi mentorami; w F4 to pełny zwrot (próbna) albo zwolnienie kredytu. U4/U5 pokazują „Anulowana — mentor jest obecnie niedostępny”. Przywrócenie mentora niczego nie odtwarza. Alternatywa: sesje zostają do decyzji `admin_trust` w A1 (więcej pracy admina, ryzyko sesji z zawieszonym mentorem).
- **Q6. Anulowanie sesji próbnej < 12 h (GAP-15, notatka prototypu U5).** Rekomendacja: **jak każda sesja (Z4)** — `cancelled_late` → `late_cancelled`, „sesja przepada”; w F4 bez zwrotu (przychód platformy, Z5). Próbna `late_cancelled` nadal zajmuje limit 1 próbnej na parę (indeks §4.4), więc uczeń umawia u tego mentora już kolejną sesję, nie drugą próbną. Gwarancja „darmowa zamiana mentora albo zwrot” dotyczy próbnej **odbytej**, nie anulowanej (F5). Alternatywa: próbna zawsze bez kosztów (zachęta, ryzyko pustych slotów mentora).
- **Q7. Zmiany maszyny `Booking`.** Rekomendacja: dopisać `hold.hold_released → expired` (uczeń zmienia termin w U2) i `requested.cancelled_by_student → cancelled` (wycofanie prośby przed decyzją, zawsze bez kosztów; w F4 zwrot 100%); `requested` nie da się przełożyć — wycofanie i nowa rezerwacja. Zmianę nanosimy w §4.3 spec stacku. Alternatywa: brak wycofania prośby (uczeń czeka na decyzję lub auto-akceptację).
- **Q8. Przełożenie i anulowanie — szczegóły.** Rekomendacja: przełożenie tylko z `scheduled` i tylko ≥ 12 h przed startem (Z4, story U5 `Late`), bez limitu liczby, nowy slot z tych samych reguł co U1, bez ponownej akceptacji mentora (slot pochodzi z jego dostępności), mentor dostaje powiadomienie. Mentor **nie przekłada** — anuluje z powodem (zawsze bez kosztów dla ucznia). Brak slotów w 14 dni → informacja + podobni mentorzy, a „Napisz do mentora” w F6. Alternatywa: przełożenie także < 12 h za zgodą mentora (wymaga przepływu zgody — F6).
- **Q9. Wyprzedzenie rezerwacji.** KONCEPCJA U1: „≥ 6 h”, M3: ustawienie 2–48 h. Rekomendacja: domyślnie 6 h, mentor ustawia 2–48 h; dla **próbnej** minimum `max(ustawienie, 6 h)`, żeby mentor miał ≥ 4 h na odpowiedź przed auto-akceptacją (`start − 2 h`). Alternatywa: jedno wyprzedzenie dla wszystkich typów.
- **Q10. Horyzont i siatka slotów.** Rekomendacja: rezerwacja do **8 tygodni** naprzód (U1 przewija tygodnie, wyjątki tylko w tym horyzoncie), sloty co 30 min od początku przedziału dostępności, długości 30/60 min. Alternatywa: horyzont ustawiany przez mentora (2–12 tygodni).
- **Q11. Kolizje dostępności z sesjami (notatka prototypu M3).** Rekomendacja: zmiana dostępności **nigdy nie anuluje** sesji — przy kolizji M3 pokazuje listę sesji i wymaga potwierdzenia, sesje zostają i są oznaczone „poza dostępnością”. Bufor jest migawką z chwili rezerwacji (zmiana bufora działa tylko na nowe rezerwacje). Wyjątek `off` na dzień z sesjami — to samo potwierdzenie. Alternatywa: blokada zapisu do czasu przełożenia/odwołania sesji przez mentora.
- **Q12. Strefa czasowa ucznia (notatka prototypu U1).** `identity` nie przechowuje dziś strefy. Rekomendacja: kolumna `time_zone` w `identity.user`, ustawiana z przeglądarki (`Intl`) przy pierwszym logowaniu po wdrożeniu, edycja w S3 (`TimezoneSelect`); przełącznik w U1 zmienia tylko bieżący widok (z linkiem „Ustaw jako domyślną”); gość — strefa przeglądarki; e-maile i przypomnienia w strefie odbiorcy (domyślnie `Europe/Warsaw`). Alternatywa: wyłącznie strefa przeglądarki, bez zapisu (e-maile zawsze w `Europe/Warsaw` z podpisem).
- **Q13. Wstrzymanie przyjmowania nowych uczniów.** `catalog.mentor_profile.accepting_new` istnieje od F2 (P3 CTA). Rekomendacja: źródłem prawdy zostaje `catalog`; przełącznik jest w ustawieniach M3 i woła komendę `catalog`; `scheduling` zna wartość ze zdarzenia. Wstrzymanie blokuje **tylko nowe próbne** — obecni uczniowie umawiają kolejne sesje. Alternatywa: wstrzymanie blokuje wszystkie nowe rezerwacje (urlop robimy wtedy wyjątkiem `off`).
- **Q14. SLA prośby o próbną (notatka prototypu M2).** Rekomendacja: zgodnie z §4.3 — termin odpowiedzi `min(utworzenie + 24 h, start − 2 h)`, po nim **auto-akceptacja**, jeśli freebusy mentora jest wolny (inaczej `calendar_conflict` → anulowanie, w F4 zwrot 100%); mentor dostaje e-mail przy prośbie i przypomnienie 2 h przed terminem. Alternatywa: auto-odrzucenie po SLA (chroni mentora, gorsze dla konwersji C2).
- **Q15. Kanały i reguły powiadomień (notatki prototypów S2, U3).** Rekomendacja: w F3 **e-mail + in-app (S2)**; e-maile transakcyjne (prośba, potwierdzenie, odrzucenie, przełożenie, anulowanie, reset hasła, zmiana e-maila) zawsze wysyłane; użytkownik może wyłączyć tylko przypomnienia e-mail (preferencja w S3, domyślnie włączone); push w v1.1 (L9). Treść e-maili w szablonach React Email po polsku (wyjątek od `messages/pl.json`, bo szablony renderuje worker), e-mail potwierdzający z terminem w strefie odbiorcy, linkiem do U5 i `.ics`. Alternatywa: pełne preferencje per typ już w F3.
- **Q16. Przypomnienia.** Rekomendacja: **24 h i 1 h** przed startem, do ucznia i mentora, e-mail + in-app; pomijane, gdy rezerwacja powstała po terminie przypomnienia; po przełożeniu planowane od nowa. Alternatywa: tylko 24 h dla mentora (mniej e-maili).
- **Q17. Google Calendar — zakres i awarie.** Rekomendacja: w F3 tylko zakres **`calendar.freebusy`** (najwęższy, bez audytu CASA; bez zapisu sesji do kalendarza mentora — mentor dostaje `.ics` w e-mailu), cache zajętości z TTL 5 min i sprawdzenie przed akceptacją; przy błędzie synchronizacji **fail-open** (sloty z samej dostępności) + e-mail i karta „Połącz ponownie”. Zapis wydarzeń (`calendar.events.owned`) i powiadomienia push Google w v1.1. Alternatywa: fail-closed (ukrycie slotów do ponownego połączenia — bezpieczniej dla mentora, ryzyko „znikającego” mentora).
- **Q18. Blokady.** Rekomendacja: jedna aktywna blokada na ucznia (nowa zwalnia poprzednią), 10 min bez przedłużania, limit 20 blokad na godzinę na ucznia (429). Alternatywa: kilka blokad równolegle (porównywanie mentorów — ryzyko blokowania kalendarzy).
- **Q19. Wymuszenie weryfikacji e-maila już w E3-S4.** Backlog umieszcza wymuszenie w E3-S9 T1, a stan w U1 w E3-S4 T2. Rekomendacja: wymuszenie (komenda + U1 + baner GAP-05) **w E3-S4** (krok 13), bo inaczej przez kilka PR-ów można rezerwować bez weryfikacji; link weryfikacyjny do czasu kroku 20 idzie przez adapter logujący z F1. E3-S9 zostaje z resetem hasła i zmianą e-maila. Alternatywa: trzymać się backlogu (krótkie okno bez wymuszenia na środowiskach testowych).
- **Q20. Widok sesji dla mentora.** KONCEPCJA nie ma ekranu szczegółów sesji mentora (M4 to uczniowie, F6). Rekomendacja: `/mentor/sesje/[id]` (M2·s) — dane sesji, cel ucznia, status, „Anuluj sesję” z powodem; link z M2 i M3. Alternatywa: wspólny U5 dla obu ról pod `/sesje/[id]` (miesza nawigację ról — Z10).
- **Q21. Reset hasła i zmiana e-maila (s04, s05, S3·e).** Rekomendacja: link resetu ważny 1 h, jednorazowy; po resecie wylogowanie wszystkich sesji; odpowiedź s04 identyczna dla istniejącego i nieistniejącego konta; zmiana e-maila wymaga hasła, link na nowy adres (ważny 24 h) i informacja na stary; konto tylko z Google/LinkedIn — zmiana e-maila niedostępna z wyjaśnieniem. Alternatywa: zmiana e-maila przez wsparcie (bez UI) w MVP.

## Decyzje i zmiany

- 2026-11-23 — Szkic specyfikacji (E3-S1, #36). Źródła: backlog E3 (z zadaniami przypisanymi z mapy F1 i tabelą pytań z prototypu `kompas-flow`), brief (A8, Q-B2), spec stacku (W9, §4.3, §4.4, §4.6, §4.10, §9), spec F2 (krok 5, Q8, Q12), spec F1 (Q2, s04/s05), KONCEPCJA, design system i istniejący kod `scheduling`, `catalog`, `identity`, `shared/infrastructure/events`. Pytania z notatek prototypu przeniesione do Open Questions: U1 → Q12, U3 → Q15, U4 → Q4 (zakres minionych; salda → F4), U5 → Q6 i Q8, S2 → Q15, M2 → Q14, M3 → Q11. Stany z mapy F1: GAP-03/GAP-05 → wymaganie 14 i Q19, GAP-09 → Q5, GAP-15 → Q6. Rozstrzygnięcia przyjęte bez pytania (zgodne ze spec stacku i dotychczasowymi decyzjami):
  - `mentor_id`/`student_id` w `scheduling` to identyfikatory `identity.user` (FK dozwolony, §2.3); publiczne API przyjmuje id profilu, a `scheduling` zna mapowanie z projekcji.
  - `scheduling` dowiaduje się o mentorze ze zdarzenia `catalog.mentor_bookability_changed.v1` (projekcja), a nie z zapytania — `catalog` już woła `scheduling` (suma dostępności), więc zapytanie w drugą stronę utworzyłoby cykl (reguła 5 §2.4).
  - Nazwy zdarzeń z prefiksem modułu (`scheduling.booking_*.v1`), jak w F2 (`catalog.*`, `trust.*`); typ `booking.cancelled.v1` z F0 zmienia nazwę na `scheduling.booking_cancelled.v1` (nie był nigdzie publikowany ani w `contracts`).
  - E-mail przez wspólny `EmailTransport` w `shared/infrastructure/email`, a porty zostają w modułach (`identity` nie zależy od `notifications`).
  - U2 i U3 powstają w F3 w wersji bez płatności (wcześniej całe w L1/F4) — inaczej nie ma gdzie podać celu sesji ani potwierdzić rezerwacji; F4 dokłada płatność w U2 bez zmiany trasy i API (`POST /checkout`).
  - Długość sesji 30/60 w U1 przez `ToggleGroup` (bez nowego `Segmented`, DS-04), strefa przez `Combobox` (DS-20); edytor dostępności jako nowy `AvailabilityEditor` (DS-05).
  - **Status `draft` — czeka na odpowiedzi Q1–Q21 i akceptację właściciela.**
- 2026-11-23 — **Odpowiedzi właściciela: Q1–Q21 przyjęte zgodnie z rekomendacjami, `status: approved`.** Najważniejsze zmiany zakresu: **Q1** potwierdzanie przed F4 ścieżką F4 (`hold → pending_payment → requested`) przez port `PaymentGate` z adapterem `NoPaymentGate` i `CreditReservation` z `UnmeteredCredit`, przełącznik `BOOKING_PAYMENT_MODE`; **U2 i U3 powstają w F3 w wersji bez płatności** (F4/L1 dokłada płatność bez zmiany trasy i API); **Q19** wymuszenie weryfikacji e-maila przed rezerwacją przechodzi z E3-S9 do E3-S4. Pozostałe: Q2 próbna + kolejna sesja (`plan`, bez limitu tygodniowego); Q3 jedna cena próbnej platformy, robocza 49 zł w `config.ts`; Q4 sesje po terminie zostają `scheduled` do F5; Q5 zawieszenie mentora anuluje jego przyszłe sesje; Q6 próbna < 12 h przepada jak każda sesja; Q7 nowe przejścia `hold.hold_released → expired` i `requested.cancelled_by_student → cancelled` (naniesione w §4.3 spec stacku); Q8 przełożenie tylko ze `scheduled` i ≥ 12 h, mentor tylko anuluje; Q9 wyprzedzenie domyślnie 6 h (2–48 h), dla próbnej min. 6 h; Q10 horyzont 8 tygodni, siatka 30 min; Q11 zmiana dostępności nie anuluje sesji; Q12 `time_zone` w `identity.user`; Q13 wstrzymanie blokuje tylko nowe próbne; Q14 auto-akceptacja po SLA przy wolnym freebusy; Q15 e-mail + in-app, wyłączalne tylko przypomnienia; Q16 przypomnienia 24 h i 1 h dla obu stron; Q17 Google tylko `calendar.freebusy`, fail-open; Q18 jedna blokada na ucznia, 10 min, limit 20/h; Q20 `/mentor/sesje/[id]`; Q21 reset hasła (link 1 h) i zmiana e-maila w UI. Człowiek: zgłosić weryfikację aplikacji OAuth Google i wyjście SES z sandboxa zaraz po akceptacji (trwa tygodnie). E3-S1 zamknięte; następna historia: E3-S2.
