---
title: E3-S4 — U1 z blokadą 10 min i utworzenie rezerwacji (F3 kroki 9–13)
date: 2026-11-23
agent: pi (cezar, run 87e20d12)
status: in-progress
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
bez odblokowania CTA na P3 i bez `NEXT_PUBLIC_BOOKING_ENABLED`; E2E wchodzi wprost na U1.

## Przebieg
- 10:45 — start: przeczytane brief/zlecenie, spec F3, AGENTS.md (root, core, scheduling, identity),
  `.ai/lessons.md` i pliki obszarowe (backend, ui, e2e); rozpoznany kod E3-S2/S3.
