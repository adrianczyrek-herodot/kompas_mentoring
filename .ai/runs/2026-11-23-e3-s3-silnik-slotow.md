---
title: E3-S3 — silnik slotów i API dostępności (F3 kroki 6–8)
date: 2026-11-23
agent: pi (cezar, run 0f1e218d)
status: done
spec: .ai/specs/2026-11-23-f3-dostepnosc-rezerwacje.md
branch: cez/0f1e218d
---

# E3-S3 — silnik slotów i API dostępności

## Zadanie
Zaimplementować kroki 6–8 planu F3 (issue #38, epik #24): `slotsFor` z testami właściwości
fast-check (DST i strefy), zdarzenie `catalog.mentor_bookability_changed.v1` z komendą
`setAcceptingNew` i projekcją `mentor_bookability` w `scheduling`, oraz `getMentorAvailability`
z publicznym `GET /mentors/:id/availability`.

## Przebieg
- 10:2x — start: przeczytana specyfikacja F3, AGENTS.md (root, core, scheduling, catalog),
  `.ai/lessons.md` i `lessons/areas/backend.md`; rozpoznany kod E3-S2 (domena dostępności,
  migracja, repozytorium, router oRPC, kontrakty) oraz szyna outbox/inbox.
- 10:3x — `pnpm install --frozen-lockfile`; `fast-check` 4.10.3 dodany do `packages/core`
  (devDependency) — spec §9 wymaga testów właściwości dla `scheduling`.
- 11:0x — krok 6: `domain/policies/slots-for.policy.ts` (`slotsFor` + `availabilityWindows`,
  czyste funkcje, `Temporal`), 8 właściwości fast-check + przykłady DST w trzech plikach testowych
  (`slots-for.availability`, `slots-for.results`, `slots-for.dst`). Uwagi: `temporal-polyfill` 1.x
  nie ma `PlainTime.toZonedDateTime` (użyte `PlainDate.toZonedDateTime` z `plainTime`, które daje
  disambiguation `compatible`); `Temporal.Instant.add` nie przyjmuje dni (zakresy w godzinach).
- 11:1x — krok 7: `catalog.mentor_bookability_changed.v1` (schemat w `contracts/events`, publikacja
  w transakcji zapisu profilu przez repozytorium), komenda `setAcceptingNew` (Q13, `PATCH
  /api/mentor/bookability`), projekcja `scheduling.mentor_bookability` (nowa migracja) i konsument
  z `withInbox`; testy: jednostkowe komendy + integracyjne (publikacja do kolejki, dedupe po
  `event_id`, upsert jednego wiersza). `accepting_new` było w migracji `catalog` z F2, ale nie
  w encji/recordzie/mapperze — dopisane.
- 12:0x — krok 8: `getMentorAvailability` (zakres, „następny wolny termin", horyzont 8 tygodni,
  próbna = 30 min + min. 6 h wyprzedzenia), port `BusyRepository` (adapter pusty do kroku 10),
  publiczne `GET /mentors/{id}/availability` (sloty + godziny lokalne w strefie pytającego) i
  kod `scheduling.mentor_unavailable` (404); testy integracyjne z bazą: szablon w strefie mentora,
  wyjątki `off`/`extra`, bufor mentora (fake busy), DST marzec/październik, „następny wolny termin",
  próbna vs kolejna sesja, 404. `temporal-polyfill` dodany do `apps/web` (router buduje instanty).
- 12:2x — weryfikacja: `pnpm lint` ujawnił cykl `orm.ts → scheduling/di.ts` (typ `Orm`
  w subskrypcji) — naprawiony typem `MikroORM`/`DatabaseCradle['orm']`; `pnpm test:e2e` ujawnił brak
  schematu pg-boss w środowisku bez workera — dodane `pnpm db:jobs:install` i wywołanie w global
  setup e2e.

## Wynik
- **Krok 6** (`faa245e`): `packages/core/src/modules/scheduling/domain/policies/slots-for.policy.ts`
  — `slotsFor`/`availabilityWindows`; testy `slots-for.availability.test.ts`,
  `slots-for.results.test.ts`, `slots-for.dst.test.ts` (8 właściwości fast-check + przykłady).
- **Krok 7** (`0903b2a`): `packages/contracts/src/events` (`catalog.mentor_bookability_changed.v1`),
  `catalog`: `acceptingNew` w encji/recordzie/mapperze, komenda `setAcceptingNew`, publikacja
  w transakcji; `scheduling`: migracja `Migration20261124000000SchedulingBookability`, rekord,
  repozytorium, konsument `mentor-bookability.subscription.ts`, subskrypcje w kontenerze;
  `PATCH /api/mentor/bookability` (+ `PATCH`/`DELETE` w handlerze oRPC).
- **Krok 8** (`f3c45e2`): `getMentorAvailability` + `mentor-availability.ts`, port `BusyRepository`
  z adapterem, kontrakt `GET /mentors/{id}/availability`, `toMentorAvailabilityView`, kod
  `scheduling.mentor_unavailable`, testy integracyjne i jednostkowe mapowania stref.
- Log zmian w specyfikacji: `.ai/specs/2026-11-23-f3-dostepnosc-rezerwacje.md` → „Decyzje i zmiany"
  (dwa wpisy z 2026-11-23).

## Weryfikacja
- `pnpm lint` — 0 błędów (136 ostrzeżeń `max-lines*` w `prototypes/`, `packages/ui` i formularzach
  M1 — wszystkie sprzed tej zmiany; pliki E3-S3 bez ostrzeżeń), `knip` i `dependency-cruiser` czyste.
- `pnpm typecheck` — 7/7 zadań.
- `pnpm test` — `@kompas/core` 252/252 (31 plików), `@kompas/contracts` 22/22.
- `pnpm test:integration` — 41/41 (8 plików, Testcontainers/Postgres 17): w tym 3 testy bookability
  i 7 testów publicznej dostępności.
- `pnpm build` — 2/2 zadania (Next.js).
- `pnpm test:e2e` — web 78/78, prototyp 21 (+1 skipped).
- `pnpm build-storybook` — zbudowany; `pnpm --filter @kompas/ui test:stories:themes` 408×2 (light/dark).
- Liczby: **8 właściwości fast-check** (`slotsFor`), **4 strefy IANA** w generatorach
  (`Europe/Warsaw`, `Europe/London`, `America/New_York`, `Asia/Kolkata`) + `Australia/Sydney`, `UTC`;
  przejścia DST: ostatnia niedziela marca i października 2026 (EU), 8.03/1.11.2026 (US), przykłady
  29.03.2026 i 25.10.2026.

## Problemy i otwarte kwestie
- Krok 8 nie ma jeszcze źródła zajętości: port `BusyRepository` zwraca pustą listę do kroku 10
  (E3-S4 — `scheduling.booking`) i E3-S10 (Google freebusy). Test integracyjny buforu podstawia
  fake portu przez rejestrację w kontenerze.
- Przełącznik „wstrzymaj przyjmowanie" w M3 jeszcze nie istnieje (krok 7 daje komendę i trasę;
  UI dochodzi z krokiem interfejsu) — odnotowane w specyfikacji.
- Publikacja zdarzenia bookability przy zmianach statusu profilu dołączy w E2-S4 (`trust`);
  dziś publikujemy przy zapisie stawki i `setAcceptingNew`.
- Przegląd człowieka: migracje (`scheduling`), zmiany w `catalog` i publiczne API dostępności.

## Wnioski
- Dopisana lekcja: `.ai/lessons/areas/backend.md` — publikacja zdarzenia z modułu wymaga
  zainstalowanego schematu pg-boss; środowisko bez workera (e2e) potrzebuje `db:jobs:install`.
