---
status: accepted
date: 2026-10-21
decision-makers: [właściciel produktu]
---

# Stripe Connect (separate charges and transfers) i kredyty na sesje zamiast portfela

> **Uwaga:** decyzja zależy od odpowiedzi właściciela i prawnika na pytania **Q3** (opinia prawna PSD2), **Q4** (polityka wygasania kredytów) i **Q7** (kredyt jako wartość pieniężna). Do czasu potwierdzenia są to założenia robocze; ewentualna zmiana wymaga nowego ADR. Blokuje to dopiero fazy F4–F7.

## Context and Problem Statement

Platforma, która przyjmuje pieniądze ucznia i trzyma je dla mentora, zbliża się do usługi płatniczej (PSD2, licencja KNF) — W1. Stripe Connect pozwala trzymać środki przed transferem do mentora maksymalnie 90 dni — W2. Koncepcja zakłada „saldo sesji” u mentora, a transfer po 48 h kolidowałby z oknem zgłoszeń problemu (72 h) — W10. Jak przyjmować i rozliczać płatności, nie stając się instytucją płatniczą?

## Decision Drivers

* Pieniądze trzyma wyłącznie licencjonowany operator.
* Twardy limit 90 dni trzymania środków w Stripe Connect.
* BLIK (w tym cykliczny, ≤ 2000 zł za obciążenie), karta, KYC mentorów i wypłaty w jednym API.
* Brak cofania przelewów do mentorów przy sporach.
* Saldo bez utraty wartości przy zmianie mentora (W8).

## Considered Options

* **Stripe Connect (Accounts v2), separate charges and transfers + Stripe Billing**; „saldo” jako przedpłacone kredyty na sesje (nie portfel, niewypłacalne, zwrot na pierwotną metodę płatności).
* Własny portfel / escrow prowadzony przez Kompas (wymaga licencji instytucji płatniczej).
* PayU Marketplace (KYC osób fizycznych, BLIK recurring przez aneks; retry i wstrzymanie środków po naszej stronie).

## Decision Outcome

Wybrana opcja: „Stripe Connect SCT + kredyty na sesje”.

* Mentor = konto z konfiguracją `recipient`, dashboard Express, `losses_collector: application` (chargebacki pokrywa platforma — konto w ledgerze).
* Kredyt ucznia = wartość pieniężna w groszach (nie liczba sesji), przechowywana w partiach z datą ważności; przeniesienie salda przenosi kwotę, a partie zachowują `expires_at` (W8, Q7).
* Propozycja wygasania: 60 dni od obciążenia, przypomnienia od 45. dnia, po terminie automatyczny zwrot na metodę płatności (W2, Q4).
* Transfer do mentora dopiero 72 h po sesji i bez otwartego sporu (W10, Q12).
* Metody płatności zależne od kwoty: plan > 2000 zł tylko karta; P24 tylko jednorazowo i po potwierdzeniu kategorii MCC 8299 (W3, W11, Q5, Q11).

### Consequences

* Good, because nie przechowujemy cudzych pieniędzy — ryzyko regulacyjne PSD2 zmniejszone (do potwierdzenia przez prawnika).
* Good, because jedno API obejmuje płatności, KYC, wypłaty i wstrzymanie środków.
* Bad, because kredyty wygasają (≤ 60 dni), więc „wstrzymanie planu z zachowaniem salda” zachowuje saldo najwyżej do terminu partii — zmiana względem KONCEPCJA, wymaga akceptacji (Q4).
* Bad, because zależność od jednego dostawcy płatności (fallback: PayU z większą pracą po naszej stronie) i opóźnienie wypłat mentora o ~doby (Q12).

## More Information

* Spec stacku: §0 (W1–W3, W8, W10, W11), §1.3, §4.5, §13 (`.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`).
* **Otwarte, czekają na właściciela/prawnika:** Q3, Q4, Q7 (oraz Q5, Q11, Q12 dla szczegółów checkoutu i rozliczeń).
* Powiązane: [ADR-0004](0004-ledger-podwojny-partie-kredytu.md), [ADR-0005](0005-porty-dostawcow-hosting-ue.md).
