---
title: E3-S4 — U1 z blokadą 10 min i utworzenie rezerwacji (F3 kroki 9–13)
date: 2026-11-23
agent: pi (cezar, run 87e20d12)
status: done
spec: .ai/specs/2026-11-23-f3-dostepnosc-rezerwacje.md
branch: cez/87e20d12
---

# E3-S4 — U1 z blokadą 10 min i utworzenie rezerwacji

## Zadanie
Zaimplementować kroki 9–13 planu F3 (issue #39, epik #24): Idempotency-Key i `time_zone`/uprawnienia
w `identity`; tabela `booking` §4.4 z `createHold`/`releaseHold`/`expire-holds` i prawdziwym
`MikroOrmBusyRepository.listBusy`; porty `PaymentGate`/`CreditReservation` z `checkout`, `getBooking`,
`.ics` i zdarzeniami `booking_*`; komponenty UI U1/U2; ekrany `/rezerwacja/*` z wymuszeniem
weryfikacji e-maila i E2E.

Zakres świadomie ograniczony (decyzja właściciela 2026-11-23; P3/E2-S6 jeszcze nie istnieje):
bez odblokowania CTA na P3 i bez `NEXT_PUBLIC_BOOKING_ENABLED`; E2E wchodzi wprost na U1. Odnotowane
w „Decyzje i zmiany” spec F3 (bez zmiany Q1–Q21).

## Przebieg
- 10:45 — start: przeczytane brief/zlecenie, spec F3, AGENTS.md (root, core, scheduling, identity),
  `.ai/lessons.md` i pliki obszarowe (backend, ui, e2e), docs design systemu; rozpoznany kod E3-S2/S3.
- 11:0x — **krok 9**: `platform.idempotency_key` (migracja, store, fingerprint), oRPC helper
  `runIdempotent`; `identity`: kolumna `time_zone` (Q12), `emailVerified`/`timeZone` w
  `getCurrentUser`, uprawnienia `scheduling.*`/`notifications.*`; worker: cron sprzątający klucze.
- 11:2x — **krok 10**: migracja `scheduling.booking` z §4.4 (EXCLUDE gist mentor z buforem i uczeń,
  unique trial na parę), `createHold`/`releaseHold`, job `expire-holds`, prawdziwy `listBusy` na
  `booking.during`; testy integracyjne (5 równoległych blokad, wygasła blokada, student_busy, druga
  próbna i próba po anulowaniu, nieprzyjmujący mentor, niezweryfikowany e-mail).
- 11:5x — **krok 11**: porty `PaymentGate`/`CreditReservation` + `NoPaymentGate`/`UnmeteredCredit`,
  `BOOKING_PAYMENT_MODE` (zod, default `none`), `checkout` w jednej transakcji, `getBooking`, `.ics`,
  zdarzenia `scheduling.booking_requested|confirmed|expired.v1`, kontrakty oRPC + trasy (z
  Idempotency-Key na hold i checkout), `GET /api/bookings/:id/ics`; testy integracyjne zdarzeń
  (rollback = brak zdarzenia, wygasła blokada, cel) i jednostkowy `.ics`. Uwagi: granice modułu
  zabroniły budować zdarzenia w `application/` — buildery przeniesione do `infrastructure/`;
  `payment_mode` zapisuje adapter z `env`; `during` nie może być kolumną generowaną (nie-immutable).
- 12:0x — **krok 12**: `MentorSummaryBar`, `WeekPicker`, `TimezoneSelect`, `StickyContinueButton`,
  `OrderSummary`, `BookingConfirmation`, `EmailVerificationBanner`, ekran `screens/u2-summary`,
  aktualizacja `screens/u1-booking` (niezweryfikowany e-mail), dopisek w `docs/design-system.md`;
  stories z a11y, 426×2 (jasny/ciemny) zielone.
- 12:1x — **krok 13**: U1 `/rezerwacja/[mentorId]`, U2 `/rezerwacja/[mentorId]/platnosc`,
  U3 `/rezerwacja/potwierdzenie/[bookingId]`, klient API w przeglądarce (Idempotency-Key),
  wymuszenie weryfikacji e-maila, teksty w `messages/pl.json` (namespace `Booking`); fixtures
  E2E w seedzie (dwa bookowalne mentory — po jednym na projekt Playwright) i spec `booking.spec.ts`.
  Naprawione po drodze: `duration` z query jako `z.coerce`; `blockedEmail` tylko dla zalogowanego;
  unikalny slot na projekt (remis równoległych projektów w ograniczeniu EXCLUDE).

## Wynik
- **Krok 9** (`246474d`): `shared/infrastructure/idempotency/*` (migracja, store, fingerprint,
  cron), `runIdempotent`, `identity` (`time_zone`, uprawnienia, `getCurrentUser`).
- **Krok 10** (`1f07d0a`): `Migration20261126000000SchedulingBooking`, rozszerzony agregat `Booking`,
  błędy `slot_taken`/`student_busy`/`trial_already_used`/`hold_expired`/`email_not_verified`/
  `not_accepting_new`/`hold_rate_limited`, `createHold`/`releaseHold`/`expire-holds`,
  `MikroOrmBookingRepository`, `listBusy` na `booking.during`.
- **Krok 11** (`6119546`): `checkout` + `GetBooking` + `.ics`, porty i adaptery, zdarzenia `booking_*`
  w `contracts/events`, kontrakty oRPC i trasy, route handler `.ics`.
- **Krok 12** (`d1a542d`): 7 komponentów `packages/ui` + `screens/u2-summary` + aktualizacja U1.
- **Krok 13**: strony U1/U2/U3, klient API, `messages/pl.json`, seed i E2E.

## Weryfikacja
- `pnpm lint` — 0 błędów (150 ostrzeżeń `max-lines*` sprzed zmiany i kilka w nowych plikach),
  `knip` i `dependency-cruiser` czyste.
- `pnpm typecheck` — 7/7.
- `pnpm test` — `@kompas/core` 258/258, `@kompas/contracts` 22/22.
- `pnpm test:integration` — 61/61 (11 plików, Testcontainers/Postgres 17), w tym 5 równoległych
  blokad, wygasła blokada, uczeń w dwóch miejscach, druga próbna, zdarzenia checkoutu.
- `pnpm build` — 2/2 zadania (routes: `/rezerwacja/[mentorId]`, `/platnosc`, `/potwierdzenie/[bookingId]`,
  `/api/bookings/[id]/ics`).
- `pnpm test:e2e` — web 86/86, prototyp 21 (+1 skipped); `booking.spec.ts` 8/8 w 360 i 1280 px z axe.
- `pnpm build-storybook` — zbudowany; `test:stories:themes` 426×2 (light/dark).
- Uwaga środowiskowa: pierwszy `next build` przerwał `SecurityFatalError` (znana lekcja) — powtórzenie
  przeszło; nie wykonano proponowanego „security upgrade” (poza zakresem).

## Problemy i otwarte kwestie
- Poza zakresem (świadomie): odblokowanie CTA na P3 i `NEXT_PUBLIC_BOOKING_ENABLED` (E2-S6),
  powiadomienia (E3-S8), M2 (E3-S7), U4/U5 (E3-S5/S6), Google (E3-S10).
- U1 nie zna nazwy mentora (brak publicznego zapytania o profil — P3/E2-S6); `MentorSummaryBar`
  pokazuje placeholder. Zastąpi to E2-S6.
- Zamiana dostępności mentora nie anuluje sesji (Q11) i `reschedule`/`cancel` z Idempotency-Key
  to kroki 14/16 (E3-S5/S6) — trasy cancel/reschedule jeszcze nie istnieją.
- Przegląd człowieka: migracje (`scheduling`, `platform`, `identity`), `identity` (`time_zone`,
  uprawnienia), `.ics`. Akceptacja: `booking.during` jako zwykła kolumna (nie generated).

## Wnioski
- `.ai/lessons/areas/backend.md`: query oRPC jako tekst (`z.coerce`), kolumna generowana nie może
  użyć `timestamptz + interval`.
- `.ai/lessons/areas/e2e.md`: projekty Playwright 360/1280 równolegle → osobny fixture na projekt;
  świeży student na test (limit jednej próbnej na parę).
