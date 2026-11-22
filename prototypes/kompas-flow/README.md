# Prototyp kompas-flow

Klikalny prototyp przepływu mentoringu 1:1 — 23 ekrany z mapy (KONCEPCJA §3.1), złożone
z komponentów i tokenów `@kompas/ui`. Służy do klikania i komentowania (właściciel produktu /
klient) oraz jako wzorzec zachowania i wyglądu dla developera. **Nie jest importowany przez
aplikację** i nie zawiera kodu produkcyjnego.

Plan i stan prac: [`POSTEP.md`](POSTEP.md). Specyfikacja:
[`.ai/specs/implemented/2026-11-21-prototyp-kompas-flow.md`](../../.ai/specs/implemented/2026-11-21-prototyp-kompas-flow.md).

## Uruchomienie

```bash
pnpm install

# tryb deweloperski
pnpm --filter @kompas/prototype-kompas-flow dev        # http://localhost:5173

# wersja zbudowana
pnpm --filter @kompas/prototype-kompas-flow build
pnpm --filter @kompas/prototype-kompas-flow preview    # http://localhost:4173
```

Podgląd w Storybooku design systemu (tylko ze zbudowanym Storybookiem, nie w `storybook dev`):

```bash
pnpm build-storybook
pnpm --filter @kompas/prototype-kompas-flow build:storybook
# → storybook-static/prototypes/kompas-flow/index.html
```

## Testy

```bash
pnpm --filter @kompas/prototype-kompas-flow test:e2e
```

Playwright w dwóch szerokościach (320 i 1440 px) sprawdza: renderowanie każdego ekranu na każdym
koncie, bramki dostępu, przepływ F1, każdą kontrolkę scenariusza, tryby silnika przeglądu, brak
poziomego przewijania oraz brak poważnych naruszeń WCAG 2.2 AA (axe) na każdym ekranie w jasnym
i ciemnym motywie.

## Pasek przeglądu

Pasek u góry jest **poza produktem** (zasada 5) — nawigacja produktu go nie zawiera:

- **Ekran** — skok do każdego z 23 ekranów (także do kroku M1),
- **Konto demo** — przełączenie roli bez utraty trasy,
- **Scenariusze** — jak odpowie następne *symulowane* żądanie (patrz niżej),
- **Motyw** — jasny / ciemny,
- tryby silnika komentarzy: **Clickable**, **Comment**, **Presentation**, **Threads**,
  **Show/Hide pins**, **Show/Hide hotspots**, **← Back**.

Komentarze zapisują się lokalnie (przeglądarka) pod identyfikatorem prototypu `kompas-flow`.

## Konta demo

Dane fikcyjne z briefu i `kompas-mentoring/mockupy/src/mocks.ts`; zegar demo jest stały:
**wtorek 20.10.2026, 14:00**.

| Konto | Rola | Stan | Do czego |
|---|---|---|---|
| Gość | — | niezalogowany | P1–P4, bramka „zaloguj się”, wybór terminu (F1) |
| Adrian C. | uczeń | plan 1×60 min/tydz., saldo 3, sesja dziś 14:05 | U4–U9, reguła 12 h, pokój |
| Julia M. | uczeń | plan 2×60 min/tydz., saldo 5 | wiele sesji, „dużo danych” |
| Paweł R. | uczeń | próbny, saldo 0 | F1 od zera, prośba czeka na mentora |
| Kasia Nowicka | mentor | profil zatwierdzony | M2–M5 |
| Adam Górski | mentor | wniosek w weryfikacji | bramka „profil czeka na weryfikację”, M1 |
| Zespół zaufania | admin | — | A1 Weryfikacja, A2 Spory |

## Scenariusze (panel „Scenariusze”)

| Kontrolka | Wartości | Gdzie działa |
|---|---|---|
| Stan danych ekranu | Dane / Ładowanie / Pusto / Błąd | ekrany z listą lub danymi |
| Wynik płatności | Sukces / Odrzucona przez bank / 3-D Secure przerwane / Potwierdzenie opóźnione | U2, U8 |
| Błąd następnego żądania | Brak / Brak sieci / Błąd serwera | każdy formularz i akcja |
| Następna blokada terminu | konflikt 409 | U1, przełożenie w U5 |
| Następne żądanie | sesja logowania wygasła | ekrany po zalogowaniu |
| Wygaś blokadę terminu teraz | — | U2, gdy trwa blokada |
| Zegar demo | stały „teraz” + presety (m.in. „mniej niż 12 h do sesji”) | U5, U6, M2 |
| Mentor nie dołącza (U6) | tak / nie | U6 |
| Mentor odpowiada na próbną | Akceptuje / Odrzuca | M2, konto z prośbą (np. Paweł R.) |

## Ograniczenia symulacji

Nic w prototypie nie łączy się z prawdziwą usługą. Symulacje to:

- **Płatności** (U2, U8, M5) — brak pól karty, żadnych obciążeń; wynik zależy od kontrolki.
  Prototyp nigdy nie zbiera danych karty ani haseł.
- **Logowanie i rejestracja** (P4) — w tym Google/LinkedIn i reset hasła; żadne konto nie powstaje.
- **E-mail i powiadomienia** (S2, U3) — pokazujemy tylko stan w aplikacji.
- **Pokój sesji** (U6) — brak transmisji wideo/audio; przyciski nie proszą o dostęp do urządzeń.
- **Weryfikacja tożsamości i zdjęcie** (M1) — pliki nigdzie nie trafiają.
- **Synchronizacja kalendarza** (M3), **dodanie do kalendarza** (U3), **eksport danych RODO** (S3),
  **zlecenie wypłaty i eksport CSV** (M5) — wszystko atrapy.
- **Oceny i opinie** (P3, U7) — dane fikcyjne; nie pochodzą z realnych sesji.

Każdy ekran ma pod ramką krótką notatkę: numery historii, co jest symulacją i czego prototyp nie
rozstrzyga (pytanie do specyfikacji).

## Mapa ekranów

Publiczne: P1 Strona główna, P2 Wyszukiwarka, P3 Profil mentora, P4 Logowanie/Rejestracja.
Uczeń: U1 Wybór terminu, U2 Checkout, U3 Potwierdzenie, U4 Moje sesje, U5 Szczegóły sesji,
U6 Pokój sesji, U7 Ocena, U8 Plany i saldo, U9 Postępy.
Wspólne: S1 Wiadomości, S2 Powiadomienia, S3 Konto i ustawienia.
Mentor: M1 Onboarding, M2 Panel, M3 Kalendarz, M4 Uczniowie, M5 Zarobki.
Zespół zaufania: A1 Weryfikacja mentorów, A2 Spory i zwroty.

## Luki w design systemie

Część elementów zbudowano z komponentów bazowych `@kompas/ui` + tokenów, bo brak ich w pakiecie
(oznaczone w kodzie `// DS-GAP`). Pełna tabela jest w [`POSTEP.md`](POSTEP.md) → „Komponenty
`@kompas/ui` na ekran”. Osobno do zgłoszenia: `packages/ui/POSTEP.md` opisuje 45 komponentów
produktu, a kod eksportuje 16, oraz usterka `checkbox.tsx` (brak spacji w `hover:bg-surface-hover…`).
