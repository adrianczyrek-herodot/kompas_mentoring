---
status: accepted
date: 2026-10-21
decision-makers: [właściciel produktu]
---

# Modułowy monolit w monorepo pnpm; Next.js 16 + oRPC jako warstwa web i kontrakt API

## Context and Problem Statement

Kompas to marketplace mentoringu 1:1 budowany przez mały zespół z agentami AI. Potrzebujemy publicznych stron SEO (wyszukiwarka, profile mentorów), aplikacji zalogowanej, publicznego API `/api/v1` (aplikacje mobilne w v2, partnerzy) oraz procesu w tle (zadania, cron). Trzeba wybrać architekturę systemu, strukturę repozytorium i stack web/API tak, aby granice domeny były pilnowane automatycznie, a agent dostawał szybki feedback.

## Decision Drivers

* Pieniądze i czas muszą się zgadzać — prosta, transakcyjna architektura z jedną bazą.
* Mały zespół + agenci AI — przewidywalny kod z „czujnikami” (typy, lint, testy architektury).
* Mało operacji — jedno wdrożenie, usługi zarządzane poza rdzeniem.
* SEO publicznych stron i jeden schemat zod jako źródło walidacji, typów klienta i OpenAPI.
* Możliwość wydzielenia modułu w przyszłości bez zmian w domenie.

## Considered Options

* **Modułowy monolit** w monorepo (pnpm + Turborepo), dwa procesy z jednego obrazu (`web`, `worker`), Next.js 16 (App Router) + React 19, oRPC + zod 4.
* Mikroserwisy per moduł.
* Next.js 16 z TanStack Start 1.0 lub React Router 8 zamiast Next.js.
* ts-rest zamiast oRPC; `zod-openapi` z własnymi handlerami.
* Budowa na Open Mercato jako frameworku.

## Decision Outcome

Wybrana opcja: „modułowy monolit + Next.js 16 + oRPC”.

* Struktura repo wg §2.2 spec stacku: `apps/web`, `apps/worker`, `packages/{core,contracts,ui,testing,config}`; moduły domenowe w `packages/core/src/modules/*` (`identity`, `catalog`, `scheduling`, `billing`, `ledger`, `payouts`, `sessions`, `mentoring`, `messaging`, `trust`, `notifications`).
* Moduły nie współdzielą tabel; komunikują się przez `index.ts` i zdarzenia domenowe. 5 reguł zależności (§2.4) wymusza `eslint-plugin-boundaries` (edytor + CI), cykle wykrywa `dependency-cruiser` w CI.
* Next.js: RSC domyślnie, `/api/v1` jako kontrakt (oRPC → OpenAPI 3.1), Server Actions tylko jako cienkie adaptery, `proxy.ts` tylko na strażników tras i nagłówki.
* Mockupy (`kompas-mentoring/mockupy`) zostają osobnym pakietem npm poza workspace pnpm.

### Consequences

* Good, because transakcje i ograniczenia bazy obejmują całą domenę, a jedno wdrożenie to mało operacji.
* Good, because granice modułów są sprawdzane maszynowo, więc agenci równolegle pracują na rozłącznych modułach.
* Good, because jeden schemat zod daje walidację, klienta i OpenAPI.
* Bad, because wszystkie moduły skalują się razem (w MVP akceptowalne); wydzielenie usługi wymaga później pracy infrastrukturalnej.
* Bad, because oRPC i TanStack Start są młodsze niż konkurencja — ryzyko zmian API; ograniczone przypięciem wersji i izolacją w `packages/contracts`.

## More Information

* Spec stacku: §1.1, §2.1–§2.5, §5 (`.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`).
* Fallbacki: TanStack Start (za młody na rdzeń SEO), React Router 8; `zod-openapi` + własne handlery zamiast oRPC; ts-rest odrzucony (brak wydań od 03.2025).
* Open Mercato: odrzucony jako framework (wersja 0.9, CRM/ERP i multi-tenancy bez rezerwacji i subskrypcji, wymaga Redisa i Meilisearch) — przejmujemy jego wzorce (moduły, `di.ts`, zdarzenia, RBAC). Do ponownej oceny po 1.0 (Q2).
* Powiązane: [ADR-0002](0002-mikroorm-postgres-pg-boss-outbox.md), [ADR-0005](0005-porty-dostawcow-hosting-ue.md).
