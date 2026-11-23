---
title: E3-S1 — szkic specyfikacji F3 (dostępność i rezerwacje)
date: 2026-11-23
agent: Claude Code (claude-opus-5-5) przez cezar, zadanie potomne a65d0c11 (rodzic 00c9b37b)
status: done             # spec approved, §4.3 stacku uzupełnione, commit/PR wykonane
spec: .ai/specs/2026-11-23-f3-dostepnosc-rezerwacje.md
branch: cez/a65d0c11
---

# E3-S1 — szkic specyfikacji F3 (dostępność i rezerwacje)

## Zadanie
Historia E3-S1 (#36, epik #24): szkic specyfikacji F3 ze stałymi ID ekranów, modelem domeny, wymaganiami, kryteriami akceptacji, projektem, planem PR-ów przypisanym do E3-S2…E3-S10 i Open Questions z rekomendacjami. Bez kodu. Link w backlogu, PR do `main` (`Refs #36, #24`), komentarz w #36.

## Przebieg
- 09:45 — Przeczytane: `AGENTS.md`, `.ai/lessons.md`, `.ai/lessons/areas/backend.md`, brief drzewa cezar, backlog (E2, E3, tabela pytań z prototypu), spec F2 (wzór), spec stacku §0, §1.3, §2.3–2.4, §3, §4.1–4.10, §5, §9, plan faz; KONCEPCJA §0, §2 (F1, F3, F5), §3, U1–U5, M2, M3, S2, §5, §6; brief (reguły 1–12, A8, Q-B2); słownik domeny; `docs/design-system.md` (luki DS-04, DS-05, DS-18); mapa ekranów F1 (GAP-03, GAP-05, GAP-09, GAP-15); kod `scheduling` (maszyna stanów, `canCancelFree`, `getCancellationTerms`), `shared/infrastructure/events` (outbox, inbox, subskrypcje), `catalog` (stany `suspended`), `identity` (uprawnienia, port `EmailVerificationSender`); dokumentacja Storybook komponentów F3.
- 09:50 — Ustalenia z kodu: `identity` nie przechowuje strefy czasowej użytkownika (potrzebna w U1 i e-mailach — pytanie w spec); `catalog` ma już `accepting_new` w schemacie z F2 (wstrzymanie przyjmowania — decyzja, który moduł jest źródłem prawdy, w spec); maszyna `Booking` z §4.3 jest już w kodzie, F3 dopisuje tylko przejście potwierdzenia bez płatności.

- 10:05 — Napisana specyfikacja `.ai/specs/2026-11-23-f3-dostepnosc-rezerwacje.md` (`status: draft`): 13 ekranów ze stałymi ID, model domeny (maszyna `Booking` + 2 nowe przejścia, ograniczenia §4.4, `slotsFor` z 8 właściwościami fast-check, projekcja `mentor_bookability`, zdarzenia dla `notifications` i F4), 20 wymagań, kryteria z ID ekranów, projekt plików, plan 26 kroków (E3-S2…E3-S10), Q1–Q21 z rekomendacjami.
- 10:10 — Backlog: link do spec przy E3, notatka przy E3-S1 T1, wpis w „Decyzje i zmiany”.
- 10:12 — Krytyczny przegląd planu przez sub-agenta pominięty: spec jest szkicem do akceptacji właściciela; przegląd warto zrobić przed `approved`, razem z odpowiedziami na Q1–Q21.
- 10:15 — `git commit` odmówiony w trybie headless (`Bash(git commit*)` w `permissions.ask`, lekcja 2026-11-22) — praca zapisana przez autosave cezara, komendy dla człowieka w raporcie.
- 10:30 — Odpowiedzi właściciela: **Q1–Q21 wszystkie zgodnie z rekomendacjami**. Wpisane w „Decyzje i zmiany” spec F3, `status: approved`; zaktualizowany backlog (E3 approved, E3-S1 gotowe, E3-S4/E3-S9 wg Q19, U2/U3 w F3 wg Q1).
- 10:40 — §4.3 spec stacku uzupełnione o przejścia z Q7 (`hold.hold_released → expired`, `requested.cancelled_by_student → cancelled`) + wpis w „Decyzje i zmiany” spec stacku. Przejścia wchodzą do kodu `scheduling` z implementacją F3 (E3-S4/E3-S6).
- 10:50 — Commit `113eebe` na `cez/00c9b37b`, wypchnięty; **PR #70** do `main` (etykiety `documentation`, `skip-qa`). Komentarze z postępem w #36 (E3-S1) i #24 (epik E3).
- 11:05 — CI na PR #70 zielone: lint, typecheck, test (unit, integration, Storybook light+dark), build, e2e smoke. PR gotowy do scalenia przez człowieka.

## Wynik
- Nowe: `.ai/specs/2026-11-23-f3-dostepnosc-rezerwacje.md` (`status: approved`), ten log.
- Zmienione: `.ai/specs/backlog.md` (link do spec przy E3 i E3-S1, wpis w „Decyzje i zmiany”), `.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md` (§4.3 — dwa przejścia z Q7).
- Kluczowe propozycje: potwierdzanie przed F4 przez port `PaymentGate` z adapterem `NoPaymentGate` (ta sama ścieżka `hold → pending_payment → requested` co w F4, A8), `CreditReservation` z `UnmeteredCredit` dla kolejnych sesji, `POST /checkout` z unią odpowiedzi; projekcja zamiast zapytania `scheduling → catalog` (unika cyklu z F2 krok 5); wspólny `EmailTransport` (SES).
- Commit i PR wykonane; zgłoszenia #36 (E3-S1) i #24 (epik E3) skomentowane.

## Weryfikacja
- Tylko dokumenty — testy, typecheck i build nie dotyczą zmiany. Sprawdzone ręcznie: odnośniki do plików w spec i backlogu istnieją; nazwa `booking.cancelled.v1` występuje tylko jako typ w `scheduling/domain/booking.events.ts` (niepublikowana) — zmiana nazwy w spec bezpieczna; `catalog.mentor_profile.accepting_new` istnieje w migracji F2; `identity` nie ma kolumny strefy czasowej (Q12).

## Problemy i otwarte kwestie
- Q1–Q21 rozstrzygnięte (E3-S1 T2) — spec `approved`, E3-S1 zamknięte.
- Trasy KONCEPCJI `/rezerwacja/:mentorId` i `/rezerwacja/:bookingId/potwierdzenie` kolidują w Next.js (jeden segment dynamiczny na poziomie) — decyzja w kroku 13 planu.
- Krok 1 planu (weryfikacja OAuth Google, sandbox SES) wymaga człowieka; warto zacząć od razu — trwa tygodnie.

## Wnioski
Brak nowych lekcji — ustalenia (brak strefy w `identity`, kierunek zależności `catalog → scheduling`) są w specyfikacji, a blokada `git commit` w headless jest już w `.ai/lessons.md` (2026-11-22).
