---
title: Product brief — Kompas, portal mentoringu 1:1
status: approved          # dokument żyjący — aktualizowany przy każdej zmianie zakresu Now/Later
created: 2026-11-11
updated: 2026-11-11
implemented:
related:
  - .ai/specs/backlog.md
  - kompas-mentoring/KONCEPCJA.md
  - .ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md
  - .ai/specs/2026-11-10-f1-tozsamosc.md
  - docs/decisions/
---

# Product brief — Kompas, portal mentoringu 1:1

Dokument żyjący: jedno miejsce, które mówi **co budujemy, dla kogo, po co i co teraz**. Szczegóły ekranów, przepływów i modelu danych są w źródłach (sekcja „Źródła informacji”); ten brief ich nie powtarza, tylko wskazuje. Zmiana zakresu Now/Later → najpierw tutaj, potem w [backlogu](backlog.md) i zgłoszeniach.

## 1. Produkt

**Kompas** (nazwa robocza) to marketplace mentoringu 1:1 online — IT, kariera, biznes, design. Uczeń znajduje mentora w wyszukiwarce, ogląda profil z wideo i opiniami, rezerwuje tańszą **sesję próbną 30 min**, a potem wykupuje **plan N sesji tygodniowo** rozliczany co 4 tygodnie. Sesje odbywają się w osadzonym pokoju wideo. Mechanizmy wzorujemy na Preply (wyszukiwarka, sesja próbna, subskrypcja, saldo, przekładanie, oceny); identyfikacja wizualna, treści i kod są własne.

**Wyróżnik:** mentoring mierzy się postępem, nie liczbą lekcji — uczeń ma cel i kamienie milowe, mentor po każdej sesji zostawia notatkę i zadania (KONCEPCJA Z8, U9, M4).

## 2. Odbiorcy

| Rola | Kim jest | Czego potrzebuje | Czego się boi |
|---|---|---|---|
| Gość | Osoba szukająca mentora, niezalogowana | Szybko sprawdzić, czy jest mentor w jej temacie i budżecie; porównać, zobaczyć wideo i opinie | Strata pieniędzy, „czy to prawdziwy ekspert?” |
| Uczeń | Junior, osoba przebranżawiająca się, specjalista szukający awansu | Pasujący mentor, termin w swojej strefie czasowej, przewidywalne płatności, łatwe przełożenie, widoczny postęp | Utrata pieniędzy przy anulowaniu, brak „chemii”, zawiłe rozliczenia |
| Mentor | Praktyk — freelancer lub etatowiec dorabiający | Uczniowie bez marketingu, kontrola dostępności, regularny przychód, szybkie wypłaty, mało administracji | No-show, wysoka prowizja, niejasny ranking |
| Zespół zaufania (admin) | Pracownik platformy (`admin_trust`, `admin_finance`) | Weryfikacja mentorów, rozstrzyganie sporów i zwrotów, moderacja | Fałszywe profile, płatności poza platformą, chargebacki |

Rynek startowy: Polska (UI po polsku, PLN, BLIK), dane i pieniądze w UE.

## 3. Cele

| # | Cel | Miara (do potwierdzenia — Q-B1) |
|---|---|---|
| C1 | Gość szybko znajduje pasującego mentora | Odsetek sesji wyszukiwania kończących się wejściem na profil; mediana czasu od wejścia do rezerwacji próbnej |
| C2 | Sesja próbna zamienia się w stałą współpracę | Konwersja sesja próbna → plan (KPI z panelu mentora M2) |
| C3 | Pieniądze i czas zawsze się zgadzają | 0 podwójnych rezerwacji, 0 podwójnych obciążeń, 0 błędów stref czasowych/DST na produkcji |
| C4 | Mentor ma mało administracji | Czas onboardingu do wysłania wniosku; SLA weryfikacji ≤ 2 dni robocze |
| C5 | Widać postęp ucznia | Odsetek sesji z notatką mentora; odsetek uczniów z celem |
| C6 | Zgodność z prawem PL/UE od pierwszego dnia | WCAG 2.2 AA (0 naruszeń axe serious/critical), RODO, DAC7, Omnibus, DSA wg §13 spec stacku |

## 4. Reguły działania

Reguły produktu (wiążące dla specyfikacji faz; wartości liczbowe są w KONCEPCJA §0 i §4 oraz w spec stacku):

1. **Sesja próbna** 30 min w obniżonej cenie, maks. jedna na parę uczeń–mentor; gdy nie pasuje — darmowa zamiana mentora albo zwrot.
2. **Plan** = N sesji (1/2/3/5) tygodniowo × 30/60 min, rozliczany co 4 tygodnie; opłacone sesje trafiają do salda u mentora.
3. **Saldo to przedpłacone kredyty na sesje, nie portfel** (PSD2, ADR 0003): przechowywane jako kwota w groszach, niewypłacalne, zwrot tylko na pierwotną metodę płatności, wygasają przed limitem 90 dni Stripe (propozycja 60 dni — Q4 spec stacku).
4. **Przełożenie / anulowanie** bez kosztów do 12 h przed sesją; później sesja przepada (wyjątek: decyzja admina w sporze). Po rozpoczęciu sesji przełożenie i anulowanie są zablokowane.
5. **Blokada terminu (hold)** 10 min przy wejściu do checkoutu; rezerwacja potwierdzana dopiero po webhooku płatności (idempotentnie).
6. **Rozliczenie z mentorem** dopiero po zamknięciu okna zgłoszeń (72 h po sesji) i gdy nie ma otwartego sporu (W10).
7. **Opinie** tylko od ucznia po ukończonej i opłaconej sesji, z oznaczeniem „zweryfikowana sesja” (Omnibus).
8. **Mentor jest widoczny publicznie** dopiero po zatwierdzeniu wniosku przez zespół zaufania (KYC, LinkedIn, dane do wypłat i DAC7).
9. **Komunikacja w platformie:** wykrywamy próby przekazania kontaktu lub płatności poza platformą; limit 5 nowych wątków ucznia na dobę.
10. **Czas:** przechowywany w UTC, wyświetlany w strefie użytkownika wszędzie; reguły dostępności w czasie lokalnym mentora.
11. **Prywatność:** brak nagrań sesji w MVP; notatki widoczne tylko dla stron sesji; eksport i usunięcie danych (RODO).
12. **Administratorzy** tylko z CLI/seeda, z obowiązkowym 2FA.

Reguły inżynieryjne (stack, moduły, Money, Clock, ledger, idempotencja) — w `AGENTS.md` i spec stacku; proces — w `SDLC.md`.

## 5. Now — co budujemy teraz

Zakres Now kończy się na **działającej rezerwacji sesji (bez płatności)**: mentor przechodzi onboarding i weryfikację, uczeń go znajduje, rezerwuje termin z blokadą, może przełożyć i anulować wg reguły 12 h. Granica jest celowa: fazy F4–F7 (pieniądze, wypłaty, faktury) blokują otwarte pytania prawne i finansowe (Q3–Q7, Q9–Q12 spec stacku), a F1–F3 nie zależą od nich.

| Epik | Faza | Co dostarcza | Moduły |
|---|---|---|---|
| E1 Domknięcie tożsamości | F1 | Krok 7 (CLI adminów, 2FA) na `main`, zamknięcie specyfikacji F1 | `identity` |
| E2 Katalog i onboarding mentora | F2 | M1 (6 kroków, szkice, zdjęcie, wideo jako link, pola DAC7), A1 weryfikacja, P1–P3 | `catalog`, `trust` |
| E3 Dostępność i rezerwacje | F3 | Silnik slotów, M3, U1 z holdem, U4/U5, przełożenie/anulowanie, prośby o próbną w M2, Google Calendar, przypomnienia i e-maile | `scheduling`, `notifications`, `identity` |
| E4 Fundamenty i decyzje | — | Środowisko preview per PR (bramka QA), odpowiedzi na otwarte pytania blokujące F4–F7 | infrastruktura, właściciel |

Szczegóły, kolejność i zależności — [backlog.md](backlog.md).

## 6. Later — co odkładamy

**Later — reszta MVP** (po odpowiedziach na Q3–Q7, Q9–Q12 i po zakończeniu Now):

- F4 Płatności i ledger — Stripe Connect, checkout próbnej (karta, BLIK, P24), webhooki, ledger, U3, plany, U8, zwroty, wygasanie kredytów.
- F5 Sesja i ocena — pokój LiveKit (U6), obecność, no-show, rozliczenie po 72 h, U7, opinie.
- F6 Mentoring, wiadomości, spory — U9, M4, S1 + Ably, wykrywanie kontaktu poza platformą, A2, DSA notice & action.
- F7 Wypłaty i dokumenty — transfery, M5, progi prowizji, KSeF, eksport DAC7.
- F8 Gotowość produkcyjna — testy obciążeniowe, ASVS L2, audyt WCAG, Stryker dla ledgera, runbooki, SLO, PostHog, realizacja eksportu i usunięcia danych.

**Later — po MVP (pomysły, bez zobowiązań):** moderacja opinii i profili (UC18, v1.1), passkeys, synchronizacja z Outlookiem, Web Push i PWA, pakiety jednorazowe (np. przegląd CV), zajęcia grupowe, konta firmowe B2B, AI-dopasowanie mentora, aplikacje natywne, własna tablica.

## 7. Źródła informacji

| Źródło | Co zawiera |
|---|---|
| [`kompas-mentoring/KONCEPCJA.md`](../../kompas-mentoring/KONCEPCJA.md) | Użytkownicy, UC1–UC18, przepływy F1–F6 z błędami, mapa i specyfikacja 22 ekranów, model danych, ryzyka |
| `kompas-mentoring/mockupy/` | Klikalne mockupy wszystkich ekranów ze stanami L/E/Er/S; reguły w `src/domain.ts` |
| [Spec stacku](2026-10-21-tech-stack-i-standardy-inzynieryjne.md) | Stack, moduły, wzorce, implikacje regulacyjne (§13), plan faz F0–F8, Q1–Q12, wnioski z researchu W1–W11 |
| [Spec F1](2026-11-10-f1-tozsamosc.md) | Tożsamość — decyzje Q1–Q8 i ustalenia z wdrożenia |
| [`docs/decisions/`](../../docs/decisions/README.md) | ADR 0001–0005 |
| [`SDLC.md`](../../SDLC.md), [`CODE_REVIEW.md`](../../CODE_REVIEW.md) | Proces, priorytety zgłoszeń, przegląd |
| `.ai/runs/`, `.ai/lessons.md` | Przebieg dotychczasowych prac i wnioski |
| GitHub — [Issues](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues), PR-y #1–#21 | Zgłoszenia backlogu, historia zmian |

Benchmark: Preply.com (mechanizmy marketplace'u lekcji 1:1). Stan rynku i przepisów sprawdzony 2026-10-21 (źródła w spec stacku).

## 8. Założenia

| # | Założenie | Status |
|---|---|---|
| A1 | Mentoring 1:1 online, sesje 30/60 min (KONCEPCJA Z1) | hipoteza |
| A2 | Sesja próbna i plan tygodniowy to główny mechanizm konwersji i przychodu (Z2, Z3) | do potwierdzenia |
| A3 | Reguła 12 h dla przełożeń i anulowań (Z4) | przyjęte do implementacji w F3 |
| A4 | Prowizja malejąca z liczbą godzin, próbna w całości dla platformy (Z5) | do potwierdzenia — wymaga modelu finansowego |
| A5 | Wideo, płatności, KYC, e-mail u zewnętrznych dostawców za portami (LiveKit, Stripe Connect, SES; ADR 0005) | przyjęte |
| A6 | Rynek startowy PL, mentorzy z PL; UI po polsku, mobile-first, WCAG 2.2 AA | przyjęte (mentorzy spoza PL — Q-B5) |
| A7 | Mały zespół + agenci AI; praca fazami, PR ≤ ~400 linii, bramka QA na preview | przyjęte |
| A8 | Rezerwacja w Now działa bez płatności (dane testowe/seed) — płatność dochodzi w F4 bez zmiany modelu rezerwacji (`pending_payment` w maszynie stanów §4.3) | przyjęte (Q-B2, 2026-11-11) |

## 9. Otwarte pytania

Produktowe (ten brief):

- **Q-B1.** Docelowe wartości miar C1–C5 (np. konwersja próbna → plan) — kto i kiedy je ustala?
- ~~**Q-B2.**~~ Czy Now kończy się rezerwacją bez płatności (A8), czy pilotażem z płatnościami? — **Rozstrzygnięte 2026-11-11:** F1–F3 bez płatności. Sposób potwierdzania rezerwacji do czasu F4 ustala spec F3 (E3-S1).
- **Q-B3.** Pakiety jednorazowe obok subskrypcji (np. „przegląd CV”) — KONCEPCJA §6 p. 1.
- **Q-B4.** Model i progi prowizji — KONCEPCJA §6 p. 2, A4.
- **Q-B5.** Mentorzy spoza Polski (waluty, podatki, KYC) — KONCEPCJA §6 p. 5.
- **Q-B6.** Nazwa produktu („Kompas” jest robocza) i domena.

Techniczne, prawne i finansowe — otwarte w spec stacku i blokujące Later: **Q3** (PSD2, opinia prawna), **Q4** (wygasanie kredytów), **Q5** (Przelewy24), **Q6** (fakturowanie, KSeF), **Q7** (kredyt jako kwota), **Q9** (retencja), **Q10** (LiveKit w UE), **Q11** (drogie plany), **Q12** (rozliczenie po 72 h). Śledzone w zgłoszeniu E4-S2 ([backlog](backlog.md)).

## Decyzje i zmiany

- 2026-11-11 — Pierwsza wersja na podstawie KONCEPCJA, spec stacku i stanu repozytorium po F1. Now = E1–E4 (domknięcie F1, F2, F3, preview i decyzje); Later = F4–F8 i pomysły po MVP. Plik ma stałą nazwę `product-brief.md` (dokument żyjący, na życzenie właściciela) — wyjątek od konwencji `YYYY-MM-DD-slug.md` opisany w `AGENTS.md`.
- 2026-11-11 — Właściciel: Now = F1–F3 bez płatności (Q-B2, A8 przyjęte). Zgłoszenia Now utworzone w GitHub Issues: epiki #22–#25, historie #26–#47 (numery w backlogu).
