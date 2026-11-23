---
title: E3-S3 — silnik slotów i API dostępności (F3 kroki 6–8)
date: 2026-11-23
agent: pi (cezar, run 0f1e218d)
status: in-progress
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

## Wynik
(w toku)

## Weryfikacja
(w toku)

## Problemy i otwarte kwestie
(w toku)

## Wnioski
(w toku)
