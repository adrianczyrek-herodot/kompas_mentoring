# Moduł `scheduling` — wzorzec dla kolejnych modułów

Odpowiada za: reguły dostępności, silnik slotów, blokady (`hold`), rezerwacje (`booking`), przełożenia, anulowania, no-show, auto-rozliczenie (spec stacku §2.3, faza F3).

## Język domeny
- `booking` — umówiona sesja; `hold` — blokada terminu na 10 min (stan rezerwacji, nie osobna encja).
- `trial` / `plan` / `single` — typ rezerwacji (`BookingType`); `reschedule` / `cancel` — przełożenie / anulowanie.

## Niezmienniki
- Cykl życia tylko przez tabelę przejść `domain/booking.state.ts` (spec §4.3); nowy stan = nowy wiersz tabeli + test.
- Z4: darmowe anulowanie do 12 h przed startem — `domain/policies/can-cancel-free.policy.ts`; stałe w `domain/policies/config.ts`.
- Czas: polityki dostają `now: Temporal.Instant`; w `application/` czas tylko z `Clock` z kontenera. Zero `new Date()` w `domain/`.
- Brak podwójnych rezerwacji gwarantuje baza (ograniczenie wykluczające, spec §4.4), nie kod — dojdzie w F3.

## Struktura (spec §2.4)
- `domain/` czysty TS · `application/` komendy i zapytania (fabryki z zależnościami) · `infrastructure/` repozytoria MikroORM · `api/` router oRPC · `jobs/` handlery pg-boss · `migrations/`.
- `index.ts` to jedyne publiczne API; `di.ts` rejestruje usługi w Awilix (`scoped()` — per request / per job).

## Wzoruj się na
- Polityka + test: `domain/policies/can-cancel-free.policy.ts`, test DST w `*.policy.test.ts`.
- Zapytanie z `Clock`: `application/get-cancellation-terms.query.ts` + test z `FakeClock` z `@kompas/testing`.
