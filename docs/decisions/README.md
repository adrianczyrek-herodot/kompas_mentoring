# Architecture Decision Records (ADR)

ADR zapisuje **dlaczego** podjęto decyzję trudną do odwrócenia; specyfikacja w `.ai/specs/` mówi **co** budujemy. Format: [MADR 4.0](https://adr.github.io/madr/). Treść po polsku, nagłówki MADR po angielsku.

## Indeks

| Nr | Tytuł | Status | Data |
|---|---|---|---|
| [0001](0001-modulowy-monolit-nextjs-orpc.md) | Modułowy monolit, struktura repo, Next.js 16 + oRPC | accepted | 2026-10-21 |
| [0002](0002-mikroorm-postgres-pg-boss-outbox.md) | MikroORM 7 + PostgreSQL + pg-boss jako outbox | accepted | 2026-10-21 |
| [0003](0003-stripe-connect-kredyty-zamiast-portfela.md) | Stripe Connect i kredyty na sesje zamiast portfela (PSD2, limit 90 dni) | accepted (czeka na Q3/Q4/Q7) | 2026-10-21 |
| [0004](0004-ledger-podwojny-partie-kredytu.md) | Księga podwójna z partiami kredytu | accepted (czeka na Q4/Q7) | 2026-10-21 |
| [0005](0005-porty-dostawcow-hosting-ue.md) | Dostawcy za portami, hosting Cloud Run + Neon w UE | accepted | 2026-10-21 |

Źródło pierwszych pięciu: `.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`.

## Jak dodać ADR

1. Dodaj ADR tylko dla decyzji trudnej do odwrócenia (stack, model danych, granice systemu, dostawca rdzeniowy). Drobne wybory zostają w specyfikacji.
2. Skopiuj szablon poniżej do `NNNN-tytul.md` — kolejny numer, 4 cyfry, tytuł w kebab-case ASCII (bez polskich znaków).
3. Wypełnij nagłówki; opcje odrzucone zapisuj z powodem. Status: `proposed` → `accepted` (lub `rejected`, `deprecated`, `superseded by ADR-NNNN`).
4. Dopisz wiersz do indeksu powyżej i powiąż ADR ze specyfikacją (`related`).
5. Zaakceptowanego ADR **nie edytujemy merytorycznie** — nową decyzją go zastępujemy: nowy ADR + zmiana statusu starego na `superseded by …`.
6. ADR commitujemy razem ze zmianą, której dotyczy (`docs(adr): …`).

## Szablon

```markdown
---
status: proposed        # proposed | accepted | rejected | deprecated | superseded by ADR-NNNN
date: YYYY-MM-DD
decision-makers: []
---

# <krótki tytuł: problem i rozwiązanie>

## Context and Problem Statement

<2–4 zdania: jaki problem rozwiązujemy i w jakim kontekście.>

## Decision Drivers

* <siła projektowa / wymaganie>

## Considered Options

* <opcja 1>
* <opcja 2>

## Decision Outcome

Wybrana opcja: „<opcja>”, ponieważ <uzasadnienie>.

### Consequences

* Good, because …
* Bad, because …

## More Information

<odnośniki do specyfikacji, ADR, źródeł; warunki ponownej oceny.>
```
