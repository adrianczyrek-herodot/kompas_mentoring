---
status: accepted
date: 2026-10-21
decision-makers: [właściciel produktu]
---

# MikroORM 7 + PostgreSQL 17 + pg-boss jako transactional outbox

## Context and Problem Statement

Rdzeń domeny to rezerwacje (brak podwójnego zajęcia slotu), saldo kredytów i księga podwójna oraz niezawodne dostarczanie zdarzeń (e-mail, realtime, płatności) przy gwarancji „co najmniej raz”. Potrzebujemy warstwy dostępu do danych z kontrolą współbieżności oraz mechanizmu zadań w tle, który nie gubi zdarzeń przy awarii między zapisem a publikacją.

## Decision Drivers

* Poprawność współbieżna: optimistic locking, blokady pesymistyczne, ograniczenia wykluczające (`tstzrange` + `btree_gist`).
* Zdarzenie domenowe atomowe ze zmianą stanu (outbox) bez dodatkowej infrastruktury.
* Mało operacji — bez Redisa i brokera wiadomości.
* Spójność ze stackiem kursu i wzorcami Open Mercato; agent musi łatwo czytać kod.

## Considered Options

* **MikroORM 7** (Unit of Work, identity map, `@Version`) + Kysely do zapytań raportowych; PostgreSQL 17; **pg-boss 12** jako kolejka i outbox.
* Drizzle (1.0 wciąż RC) lub Prisma 7 (brak Unit of Work).
* Graphile Worker (pre-1.0), Inngest / Trigger.dev (zarządzane) zamiast pg-boss.
* Osobna tabela `outbox` + proces relay + broker (Redis/SQS).

## Decision Outcome

Wybrana opcja: „MikroORM 7 + PostgreSQL 17 + pg-boss”.

* Schemat PostgreSQL per moduł; migracje generowane z encji MikroORM, commitowane w `modules/<x>/migrations/`; fragmenty niemodelowane przez ORM (exclusion constraints, indeksy częściowe) jako ręczny SQL w migracji.
* **Outbox = pg-boss:** zadanie wysyłane w tej samej transakcji co zmiana domenowa (opcja `db` z klientem transakcji MikroORM). Commit = zdarzenie w kolejce, rollback = brak zdarzenia. Handlery są idempotentne (inbox z unikalnym `event_id`).
* `web` tylko wysyła zadania (`supervise: false`, `schedule: false`, przez pooler); wyłącznie `worker` ma połączenie bezpośrednie, pobiera zadania i uruchamia cron.
* Better Auth używa adaptera Kysely na wspólnej puli `pg`; MikroORM mapuje `User` tylko do odczytu.

### Consequences

* Good, because rezerwacje i saldo korzystają z ograniczeń bazy i transakcji, a zdarzenia nie giną.
* Good, because brak Redisa, brokera i osobnego relay — jedna baza do utrzymania.
* Bad, because kolejka i dane domenowe dzielą zasoby bazy — ryzyko wyczerpania połączeń; łagodzone podziałem pooler/direct i alertem na opóźnienie kolejki (> 5 min).
* Bad, because dostarczanie jest „co najmniej raz” — każdy handler musi być idempotentny (wymóg w CODE_REVIEW.md).
* Bad, because Better Auth nie ma adaptera MikroORM — SQL z jego CLI commitujemy jako migrację modułu `identity`.

## More Information

* Spec stacku: §1.1, §3, §4.4, §4.6 (`.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`).
* Fallbacki: Graphile Worker; Inngest / Trigger.dev przy potrzebie długich workflow; Drizzle przy rezygnacji z kontenera DI (Q1 rozstrzygnięte rekomendacją: MikroORM + Awilix).
* Powiązane: [ADR-0001](0001-modulowy-monolit-nextjs-orpc.md), [ADR-0004](0004-ledger-podwojny-partie-kredytu.md).
