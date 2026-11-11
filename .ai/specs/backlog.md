---
title: Backlog — Kompas
status: approved          # dokument żyjący
created: 2026-11-11
updated: 2026-11-11
implemented:
related:
  - .ai/specs/product-brief.md
  - .ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md
  - SDLC.md
---

# Backlog — Kompas

Backlog wynika z [product briefu](product-brief.md): zakres **Now** ma epiki, historie i zadania ze zgłoszeniami w [GitHub Issues](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues); zakres **Later** to pozycje bez zgłoszeń (zgłoszenie powstaje przy przeniesieniu do Now). Zasady priorytetów i zgłoszeń — [`SDLC.md` §2a](../../SDLC.md#2a-backlog-zgłoszenia-i-priorytety).

**Identyfikatory:** epik `E<n>`, historia `E<n>-S<m>`, zadanie `E<n>-S<m>-T<k>`, pozycja Later `L<n>`. Identyfikator nie zmienia się, a usunięta pozycja nie zwalnia numeru. Tytuł zgłoszenia zaczyna się od identyfikatora, np. `[E2-S3] …`.

**Kolumny:** P — priorytet (`ext`/`high`/`med`/`low` = etykieta `priority-*`); Zależy od — pozycje, które muszą być skończone wcześniej; Zgłoszenie — numer w GitHub Issues. Zadania są listą kontrolną w zgłoszeniu historii (osobne zgłoszenia dla zadań nie powstają).

## Now

### Ścieżka krytyczna

```
E1-S1 ─▶ E1-S2
E2-S1 ─▶ E2-S2 ─▶ E2-S3 ─▶ E2-S4 ─▶ E2-S5 ─▶ E2-S7, E2-S8
                    ▲                 └──▶ E2-S6 ─┐
E3-S1 ─▶ E3-S2 ─────┘                             ▼
            └──▶ E3-S3 ─────────────────────▶ E3-S4 ─▶ E3-S5 ─▶ E3-S6
                    └──▶ E3-S10                  ├──▶ E3-S7
                                                 └──▶ E3-S8 ─▶ E3-S9
E1-S1 ─▶ E2-S4 (admin z 2FA)        E4-S1, E4-S2 — równolegle, bez zależności w kodzie
```

### E1 — Domknięcie tożsamości (F1)

Zgłoszenie epiku: [#22](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/22)  ·  P: high  ·  Spec: [F1](2026-11-10-f1-tozsamosc.md)

| ID | Historia | P | Zależy od | Zgłoszenie |
|---|---|---|---|---|
| E1-S1 | Krok 7 F1 na `main`: CLI kont administratorów i wymuszone 2FA TOTP | high | — | [#26](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/26) |
| E1-S2 | Zamknięcie specyfikacji F1 (kryteria, logowanie społecznościowe, zrzuty wzorcowe, `implemented/`) | med | E1-S1 | [#27](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/27) |

- **E1-S1** — PR #19 i #20 scalono do gałęzi stosu `cez/f1-6-account`, nie do `main` (commity `3326c2d`, `3a7e47b`, `f5a119e`).
  - T1 PR na `main` z commitami kroku 7 (rebase na `main`, bez konfliktów w JSON-ach — lekcja 2026-11-10).
  - T2 Walidacja (`pnpm lint/typecheck/test/build`), testy integracyjne i e2e 2FA (360/1280 px, axe).
  - T3 Przegląd człowieka (`identity`, ścieżka obowiązkowa w `CODE_REVIEW.md`).
- **E1-S2**
  - T1 Logowanie Google i LinkedIn sprawdzone z kluczami dev; bez kluczy przyciski ukryte.
  - T2 Zrzuty wzorcowe Playwright generowane w CI (Linux) dla P4 i S3.
  - T3 Kryteria akceptacji F1 odhaczone, `status: implemented`, `git mv` do `implemented/`, run F1 zamknięty.

### E2 — Katalog i onboarding mentora (F2)

Zgłoszenie epiku: [#23](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/23)  ·  P: high  ·  Moduły: `catalog`, `trust`

| ID | Historia | P | Zależy od | Zgłoszenie |
|---|---|---|---|---|
| E2-S1 | Specyfikacja F2 z otwartymi pytaniami i akceptacją właściciela | high | — | [#28](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/28) |
| E2-S2 | Onboarding mentora M1, kroki 1–4 (O mnie, kompetencje, opis i wideo, stawka) z zapisem szkicu | high | E2-S1 | [#29](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/29) |
| E2-S3 | Onboarding M1, kroki 5–6 (dostępność, weryfikacja i dane do wypłat/DAC7) i wysłanie wniosku | high | E2-S2, E3-S2 | [#30](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/30) |
| E2-S4 | Weryfikacja mentorów A1 (kolejka, decyzje, audyt, publikacja profilu) | high | E2-S3, E1-S1 | [#31](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/31) |
| E2-S5 | Wyszukiwarka mentorów P2 (filtry w URL, sortowanie, paginacja) | high | E2-S4 | [#32](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/32) |
| E2-S6 | Profil mentora P3 | high | E2-S4 | [#33](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/33) |
| E2-S7 | Strona główna P1 (wyszukiwanie tematu, kategorie, wyróżnieni) | med | E2-S5 | [#34](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/34) |
| E2-S8 | Ulubieni mentorzy | low | E2-S5 | [#35](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/35) |

- **E2-S1** — T1 Spec `.ai/specs/YYYY-MM-DD-f2-katalog-onboarding.md`: model `MentorProfile` i `MentorApplication`, maszyna stanów profilu (`draft → submitted → changes_requested/approved/rejected/suspended`), porty `StorageProvider` (R2) i KYC, read model wyszukiwarki (widok SQL, `pg_trgm`, `unaccent`), pola DAC7. T2 Odpowiedzi właściciela (m.in. dostawca KYC przed F4, szyfrowanie danych DAC7), `status: approved`.
- **E2-S2** — T1 Domena profilu i polityki walidacji (headline 20–80, opis 300–2000, 1–5 kategorii, 3–15 tagów, stawka 40–1000 zł jako `Money`). T2 Port `StorageProvider` + adapter R2 + fake, upload zdjęcia przez presigned URL (JPG/PNG ≥ 400×400, ≤ 5 MB). T3 UI: stepper, kroki 1–4, wideo jako link YouTube/Vimeo, podgląd zarobku, zapis szkicu po każdym kroku. T4 E2E.
- **E2-S3** — T1 Krok 5: edytor dostępności z E3-S2 osadzony w onboardingu (≥ 3 h tygodniowo). T2 Krok 6: LinkedIn, dane DAC7 (adres, TIN + kraj, data urodzenia, NIP/REGON, IBAN), KYC wg decyzji z E2-S1. T3 Wysłanie → zdarzenie `MentorApplicationSubmitted` → wniosek w `trust`; status weryfikacji i przekierowanie M2–M5 do M1. T4 E2E.
- **E2-S4** — T1 `trust`: `MentorApplication`, decyzje (zatwierdź / poproś o zmiany z listą pól / odrzuć z powodem), wpis w audycie, tylko `admin_trust`. T2 UI A1: kolejka z wiekiem i SLA, szczegóły, checklista, dialog decyzji. T3 Zdarzenie decyzji → `catalog` publikuje lub cofa do poprawek. T4 E2E.
- **E2-S5** — T1 Read model wyszukiwarki (tylko zatwierdzeni). T2 Filtry (temat, cena 0–1000 zł, język, doświadczenie, „tylko zweryfikowani”) w URL, sortowanie, paginacja kursorem. T3 UI z bottom sheet na mobile, stany L/E/Er/S, „Wyczyść filtr X” dla filtra najbardziej zawężającego. T4 Filtr dostępności (pora dnia, dni) po E3-S3. T5 E2E.
- **E2-S6** — T1 Hero, wideo, kompetencje, doświadczenie, statystyki; „Nowy mentor” bez opinii; 404 dla profilu niedostępnego + podobni. T2 Tydzień dostępności w strefie ucznia (po E3-S3). T3 Sticky CTA „Zarezerwuj sesję próbną — X zł” (prowadzi do U1 z E3-S4), nieaktywne przy wstrzymanym przyjmowaniu. T4 E2E.
- **E2-S7** — T1 Autocomplete tematów (2–80 znaków, błąd → zwykłe pole). T2 Kategorie, „jak to działa”, wyróżnieni mentorzy (pusta lista → sekcja ukryta), CTA „Zostań mentorem”. T3 E2E.
- **E2-S8** — T1 Dodaj/usuń z ulubionych (zalogowany uczeń; gość → logowanie z `returnTo`). T2 Lista ulubionych. T3 E2E.

### E3 — Dostępność i rezerwacje (F3, moduł wzorcowy)

Zgłoszenie epiku: [#24](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/24)  ·  P: high  ·  Moduły: `scheduling`, `notifications`, `identity`

| ID | Historia | P | Zależy od | Zgłoszenie |
|---|---|---|---|---|
| E3-S1 | Specyfikacja F3 z otwartymi pytaniami i akceptacją właściciela | high | — | [#36](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/36) |
| E3-S2 | Dostępność mentora M3 (szablon tygodniowy, wyjątki, wyprzedzenie, bufor, wstrzymanie przyjmowania) | high | E3-S1 | [#37](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/37) |
| E3-S3 | Silnik slotów z poprawną obsługą stref czasowych i DST | high | E3-S2 | [#38](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/38) |
| E3-S4 | Wybór terminu U1 z blokadą 10 min i utworzenie rezerwacji | high | E3-S3, E2-S6 | [#39](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/39) |
| E3-S5 | Moje sesje U4 i szczegóły sesji U5 | med | E3-S4 | [#40](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/40) |
| E3-S6 | Przełożenie i anulowanie sesji z regułą 12 h | high | E3-S5 | [#41](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/41) |
| E3-S7 | Prośby o sesję próbną w panelu mentora M2 (akceptuj / odrzuć, SLA 24 h) | med | E3-S4 | [#42](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/42) |
| E3-S8 | Powiadomienia: e-mail (SES), przypomnienia 24 h i 1 h, lista S2 | med | E3-S4 | [#43](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/43) |
| E3-S9 | Weryfikacja e-maila przed pierwszą rezerwacją, reset hasła, zmiana e-maila | med | E3-S8 | [#44](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/44) |
| E3-S10 | Synchronizacja z Google Calendar (freebusy) | med | E3-S3 | [#45](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/45) |

- **E3-S1** — T1 Spec `.ai/specs/YYYY-MM-DD-f3-dostepnosc-rezerwacje.md`: maszyna stanów `Booking` (§4.3 spec stacku), oba ograniczenia wykluczające i indeks sesji próbnej (§4.4), sposób potwierdzania rezerwacji przed F4 (Q-B2 briefu), zdarzenia dla F4 (rezerwacja kredytu). T2 Odpowiedzi właściciela, `status: approved`.
- **E3-S2** — T1 Domena `AvailabilityRule`/`AvailabilityException` (przedziały bez nakładania, min. 30 min, wyprzedzenie 2–48 h, bufor 0–30 min). T2 UI M3: tydzień, edytor szablonu (klik/przeciągnięcie), wyjątki, ustawienia; pusta dostępność → baner. T3 Konflikt z istniejącą sesją przy usuwaniu dostępności → lista sesji. T4 E2E.
- **E3-S3** — T1 `slotsFor(rules, exceptions, bookings, tz, range)` jako czysta funkcja z testami właściwości (fast-check) przez zmiany czasu marzec/październik. T2 API dostępności w strefie ucznia (`GET /mentors/:id/availability`). T3 Testy integracyjne z bazą.
- **E3-S4** — T1 Komenda `createHold` z wygaszaniem nieaktualnych blokad, ograniczenia wykluczające (mentor i uczeń), maks. 1 próbna na parę; 409 przy zajęciu. T2 UI U1: długość, tydzień, sloty w strefie ucznia, zmiana strefy, informacja o regule 12 h, „Następny wolny termin”. T3 Utworzenie rezerwacji z blokady wg decyzji z E3-S1. T4 Testy integracyjne: równoległe blokady, wygasła blokada. T5 E2E.
- **E3-S5** — T1 U4: nadchodzące/minione, karta najbliższej sesji („Dołącz” od T-10 min — link aktywny w F5), filtr po mentorze. T2 U5: dane, cel, statusy, akcje zależne od stanu; 404/403 dla cudzej sesji. T3 E2E.
- **E3-S6** — T1 `canCancelFree(booking, now)` i komendy `reschedule`/`cancel` (zablokowane po rozpoczęciu), zdarzenia dla ledgera (F4). T2 UI: ostrzeżenie „sesja przepadnie” < 12 h, arkusz przełożenia ze slotami, brak slotów w 14 dni → wiadomość do mentora. T3 Test integracyjny wyścigu przełożeń. T4 E2E.
- **E3-S7** — T1 Komendy akceptacji i odrzucenia (powód z listy lub „inne” 10–300 znaków). T2 Zadanie pg-boss: auto-akceptacja po 24 h, jeśli slot wolny. T3 UI M2 (dzisiejsze sesje, prośby, status profilu). T4 E2E.
- **E3-S8** — T1 Port `EmailSender` + adapter SES + fake (zastępuje adapter logujący z F1). T2 Moduł `notifications`: przypomnienia 24 h i 1 h (pg-boss), szablony po polsku. T3 Lista S2 z głębokimi linkami, oznacz jako przeczytane. T4 Testy.
- **E3-S9** — T1 Weryfikacja e-maila wymagana przed pierwszą rezerwacją (decyzja F1 Q2). T2 „Nie pamiętasz hasła?” (P4). T3 Zmiana e-maila w S3 z weryfikacją. T4 E2E. Przegląd człowieka (`identity`).
- **E3-S10** — T1 Zgłoszenie weryfikacji aplikacji OAuth Google (trwa tygodnie — zacząć wcześnie; człowiek). T2 Połączenie kalendarza w M3, freebusy → zajęte sloty niedostępne. T3 Błąd synchronizacji → ponowne połączenie. T4 Testy kontraktowe portu.

### E4 — Fundamenty i decyzje

Zgłoszenie epiku: [#25](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/25)  ·  P: med

| ID | Historia | P | Zależy od | Zgłoszenie |
|---|---|---|---|---|
| E4-S1 | Środowisko preview per PR (Cloud Run + gałąź Neon) i Sentry z DSN | med | — | [#46](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/46) |
| E4-S2 | Odpowiedzi na otwarte pytania blokujące Later (Q3–Q7, Q9–Q12 spec stacku, Q-B1–Q-B6 briefu) | med | — | [#47](https://github.com/adrianczyrek-herodot/kompas_mentoring/issues/47) |

- **E4-S1** — T1 Konta i sekrety GCP/Neon (człowiek), OIDC z GitHub Actions. T2 Włączenie szkicu wdrożenia z F0: tagged revision + gałąź Neon + migracje. T3 E2E na preview, link w PR (bramka QA z `SDLC.md`). T4 Sentry DSN dla web i worker.
- **E4-S2** — T1 Opinia prawna PSD2 (Q3) i doradcy podatkowego (Q6). T2 Decyzje właściciela Q4, Q5, Q7, Q9–Q12 i Q-B1–Q-B6 wpisane w „Decyzje i zmiany” spec stacku i briefu. T3 Aktualizacja Now/Later w briefie.

## Later

Pozycje bez zgłoszeń. Przeniesienie do Now: wpis w „Decyzje i zmiany” briefu, rozbicie na historie i zadania tutaj, zgłoszenia w GitHub Issues.

### Reszta MVP (fazy F4–F8 spec stacku)

| ID | Pozycja | Zależy od |
|---|---|---|
| L1 | F4 Płatności i ledger — Stripe Connect, checkout próbnej (karta, BLIK, P24), webhooki + inbox, ledger z partiami kredytu, U3, plany (Billing, BLIK cykliczny), U8, zwroty, wygasanie kredytów, przeniesienie salda (UC11) | E3, E4-S2 (Q3–Q7, Q11) |
| L2 | F5 Sesja i ocena — pokój LiveKit (U6), obecność, no-show, rozliczenie po 72 h, U7, opinie ze „zweryfikowaną sesją” | L1, E4-S2 (Q10, Q12) |
| L3 | F6 Mentoring, wiadomości, spory — U9, M4, S1 + Ably, wykrywanie kontaktu poza platformą, A2, DSA notice & action | L2, E4-S2 (Q9) |
| L4 | F7 Wypłaty i dokumenty — transfery, M5, progi prowizji, KSeF, eksport DAC7 | L1, E4-S2 (Q6, Q-B4) |
| L5 | F8 Gotowość produkcyjna — testy obciążeniowe, ASVS L2, audyt WCAG, Stryker dla ledgera, runbooki, SLO, PostHog, deklaracja dostępności, realizacja eksportu i usunięcia danych (żądania z F1) | L1–L4 |

### Pomysły po MVP

| ID | Pomysł | Źródło |
|---|---|---|
| L6 | Moderacja opinii i profili (UC18) | KONCEPCJA, v1.1 |
| L7 | Passkeys | spec F1, v1.1 |
| L8 | Synchronizacja z Outlookiem | spec stacku W9, v1.1 |
| L9 | Web Push i PWA (preferencje push w S3) | spec stacku, v1.1 |
| L10 | Pakiety jednorazowe obok subskrypcji (np. przegląd CV) | KONCEPCJA §6 p. 1, Q-B3 |
| L11 | Mentorzy spoza Polski (waluty, podatki, KYC) | KONCEPCJA §6 p. 5, Q-B5 |
| L12 | Zajęcia grupowe | KONCEPCJA, poza MVP |
| L13 | Konta firmowe B2B | KONCEPCJA, poza MVP |
| L14 | AI-dopasowanie mentora | KONCEPCJA, v2 |
| L15 | Aplikacje natywne | KONCEPCJA, poza MVP |
| L16 | Własna tablica w pokoju sesji | KONCEPCJA, poza MVP |

## Decyzje i zmiany

- 2026-11-11 — Pierwsza wersja. Zadania jako listy kontrolne w zgłoszeniach historii (bez osobnych zgłoszeń), Later bez zgłoszeń. Krok 5 onboardingu (E2-S3) korzysta z edytora dostępności z E3-S2 — jedyna zależność między epikami F2 i F3 w tę stronę.
