---
status: accepted
date: 2026-10-21
decision-makers: [właściciel produktu]
---

# Dostawcy zewnętrzni za portami; hosting Google Cloud Run + Neon (Frankfurt, UE)

## Context and Problem Statement

Kompas korzysta z usług zewnętrznych (płatności, wideo, realtime, kalendarz, e-mail, pliki, faktury), które nie są rdzeniem produktu, ale mogą się zmienić (cena, awaria, regulacje). Dane osobowe muszą zostać w UE (RODO), a operacje — minimalne. Trzeba ustalić zasadę integracji z dostawcami i miejsce uruchomienia.

## Decision Drivers

* Wymienialność dostawców bez przepisywania domeny.
* Dane w UE; mało operacji (usługi zarządzane).
* Testowalność: fake'i w pamięci i testy kontraktowe.
* Gałąź bazy per PR i per worktree agenta (preview, e2e).
* Koszt rzędu kilkuset USD / mies. przy ~2000 sesji.

## Considered Options

* **Porty i adaptery (hexagonal)**; dostawcy MVP: LiveKit Cloud (`VideoProvider`), Ably (`RealtimePublisher`), Google Calendar API (`CalendarSync`), Amazon SES eu-central-1 + React Email (`EmailSender`); hosting **Cloud Run europe-west3** + **Neon eu-central-1 (Frankfurt)**.
* Dostawcy bez portów (wywołania SDK w domenie).
* Hosting: Render (Frankfurt), Vercel (limity czasu funkcji dla workera), AWS App Runner (wycofywany).
* Baza: Cloud SQL Warszawa (bez gałęzi), PlanetScale Postgres.
* Wideo: Daily, Twilio Video; realtime: Pusher lub własny WS; e-mail: Brevo; kalendarz: Nylas.

## Decision Outcome

Wybrana opcja: „porty + wybrani dostawcy + Cloud Run i Neon Frankfurt”.

* Port należy do modułu, który go potrzebuje; każdy port ma adapter produkcyjny, fake w `packages/testing` i wspólny zestaw testów kontraktowych. Typy dostawców nie wychodzą poza `infrastructure/`; webhooki tłumaczone na zdarzenia wewnętrzne (anti-corruption layer).
* Dostawcy MVP i fallbacki: LiveKit (≈ 275 USD/mies., fallback Daily ≈ 680 USD); Ably (fallback Pusher / własny WS w `worker`); Google Calendar (zakresy `calendar.freebusy`, `calendar.events.owned`; fallback Nylas); SES (fallback Brevo — uwaga na białą listę IP przy Cloud Run). Pozostałe porty (`PaymentProvider`, `FileStorage`, `InvoicingProvider` itd.) wg §1.3 spec stacku i [ADR-0003](0003-stripe-connect-kredyty-zamiast-portfela.md).
* Hosting: jeden obraz Dockera, dwa procesy — `web` (Cloud Run service) i `worker` (worker pool lub service z `min-instances=1`, obsługa SIGTERM). Neon z gałęzią na PR/worktree, produkcja bez scale-to-zero, PITR, cel RPO ≤ 5 min, RTO ≤ 4 h. Sekrety w GCP Secret Manager, OIDC z GitHub Actions.
* Region Frankfurt przyjęty dla F0 (Q8 — rekomendacja); Warszawa (Cloud SQL + europe-central2) jako alternatywa.

### Consequences

* Good, because zmiana dostawcy to nowy adapter i jedna rejestracja DI, a testy działają na fake'ach bez sieci.
* Good, because dane w UE, a hosting zarządzany ogranicza operacje; gałęzie Neon dają realistyczne preview.
* Bad, because koszt abstrakcji (port + fake + testy kontraktowe na każdego dostawcę).
* Bad, because LiveKit Ship nie przypina mediów do UE — decyzja prawna Q10 (Scale: +225 USD/mies.); wyczerpanie połączeń przy autoskalowaniu wymaga dyscypliny pooler/direct (ADR-0002).

## More Information

* Spec stacku: §1.3, §1.4, §4.2, §8 (RODO), §11, §14 (`.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`).
* Pytania powiązane: Q8 (region), Q10 (LiveKit w UE).
* Powiązane: [ADR-0001](0001-modulowy-monolit-nextjs-orpc.md), [ADR-0002](0002-mikroorm-postgres-pg-boss-outbox.md).
