---
status: accepted
date: 2026-10-21
decision-makers: [właściciel produktu]
---

# Księga podwójna (ledger) z partiami kredytu

> **Uwaga:** model kredytu jako wartości pieniężnej z terminem ważności partii zależy od odpowiedzi na **Q4** (wygasanie kredytów) i **Q7** (kredyt jako wartość pieniężna, reszta po przeniesieniu do droższego mentora). Do czasu potwierdzenia — założenia robocze; pełna tabela księgowań trafi do specyfikacji F4.

## Context and Problem Statement

Mockup liczy saldo w sesjach (`floor(sessions × fromRate / toRate)`) na liczbach zmiennoprzecinkowych — gubi wartość przy zmianie mentora (W8). Potrzebujemy modelu, w którym suma pieniędzy zawsze się zgadza, każda zmiana jest audytowalna, a kredyty wygasają przed limitem 90 dni Stripe (W2) i mogą być zużywane od najstarszej partii.

## Decision Drivers

* Poprawność: suma wszystkich sald zawsze 0; saldo kredytu nigdy ujemne.
* Audytowalność: brak edycji wpisów, korekta = przelew odwracający z powodem i autorem.
* Wygasanie partii (W2) i przenoszenie salda między mentorami bez utraty wartości (W8).
* Uzgadnianie ze Stripe (konto `stripe_clearing`).

## Considered Options

* **Księga podwójna** (transakcje = przelewy między kontami, w groszach), kredyt w **partiach** (`CreditLot`: `source_charge_id`, `expires_at`), bufor sald z `version`.
* Jedna kolumna salda na parę uczeń–mentor aktualizowana in-place.
* Saldo liczone w sesjach (jak w mockupie).
* Event sourcing całego systemu.

## Decision Outcome

Wybrana opcja: „księga podwójna z partiami kredytu”.

* Konta: `stripe_clearing`, `student_credit:{studentId}:{mentorId}`, `student_credit_reserved:…`, `trial_deferred`, `mentor_payable:{mentorId}`, `platform_commission`, `platform_trial_revenue`, `promo_costs`, `provider_fees`, `chargeback_losses`.
* Każde zdarzenie pieniężne to przelew z konta na konto w jednej walucie; kwoty jako `bigint` w groszach, podział prowizji przez `allocate` (Dinero 2).
* Rezerwacja kredytu przy umawianiu sesji z planu (cena zablokowana na okres subskrypcji); rozliczenie po zamknięciu okna sporu (72 h).
* Saldo = suma przelewów z buforem `ledger.balance` aktualizowanym w tej samej transakcji (`version`); dzienne zadanie uzgadnia `stripe_clearing` ze saldem Stripe.
* Event sourcing tylko w ledgerze (jest dziennikiem); reszta systemu — widoki SQL (CQRS-lite).

### Consequences

* Good, because niezmienniki (suma = 0, saldo ≥ 0) da się wyrazić testami właściwości (fast-check) i mutacyjnymi (Stryker od F8).
* Good, because pełna historia i łatwe uzgadnianie ze Stripe oraz audyt ręcznych korekt (przez `trust`).
* Bad, because większa złożoność niż jedno pole salda i obowiązek definiowania księgowań dla każdego zdarzenia płatniczego.
* Bad, because ścisła zależność od polityki wygasania i przenoszenia reszty (Q4, Q7) — zmiana wymaga migracji danych partii.

## More Information

* Spec stacku: §0 (W2, W8, W10), §4.5, §9 (`.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`).
* **Otwarte, czekają na właściciela/prawnika:** Q4, Q7.
* Powiązane: [ADR-0002](0002-mikroorm-postgres-pg-boss-outbox.md), [ADR-0003](0003-stripe-connect-kredyty-zamiast-portfela.md).
