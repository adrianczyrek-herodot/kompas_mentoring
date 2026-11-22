# `packages/core` — moduły domenowe

Dotyczy pracy w `packages/core` oraz importów z `apps/web` i `apps/worker`. Moduły z własnymi niezmiennikami mają `src/modules/<x>/AGENTS.md` (`identity`, `scheduling`). Nazwy domenowe PL ↔ EN: `docs/domain-glossary.md`.

**Reguły modułów** (`packages/core/src/modules/<x>/`, wymuszane lintem):

1. `domain/` importuje tylko własne `domain/` i `packages/core/src/shared/domain` (Money, Clock, Result, typy ID).
2. `application/` importuje `domain/` i porty, nigdy adaptery.
3. Inny moduł importujesz wyłącznie z `modules/<x>/index.ts`.
4. `apps/web` i `apps/worker` importują tylko `index.ts` modułów i `contracts`, bez encji i EntityManagera.
5. Zakaz cykli między modułami — reakcja innego modułu to zdarzenie domenowe.

**Pieniądze i czas:** kwoty zawsze jako `Money` (`bigint`, grosze; w bazie `bigint` + `currency`), nigdy `number`/`float`. Czas w domenie przez `Clock` i Temporal; **zakaz `Date.now()`, `new Date()`, `Math.random()` w `domain/**`**. Zmiany salda tylko przez ledger. Webhooki i komendy finansowe są idempotentne.
