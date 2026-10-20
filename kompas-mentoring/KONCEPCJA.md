# Kompas — wstępna koncepcja portalu mentoringowego

**Wersja:** 0.1 (koncepcja do dyskusji) · **Data:** 2026-10-20
**Benchmark:** Preply.com — wzorujemy się na sprawdzonych mechanizmach (wyszukiwarka z filtrami, profil z wideo, lekcja próbna, subskrypcja godzin, saldo lekcji, przekładanie, oceny). Nie przenosimy identyfikacji wizualnej, treści ani kodu. Nazwa „Kompas” jest robocza.

---

## 0. Założenia i decyzje do potwierdzenia

| # | Założenie | Dlaczego tak | Status |
|---|---|---|---|
| Z1 | Mentoring 1:1 online (IT, kariera, biznes, design), sesje 30 / 60 min | Najbliższy odpowiednik modelu lekcji 1:1 z Preply | hipoteza |
| Z2 | Pierwsza sesja to **sesja próbna 30 min** w obniżonej cenie; jeśli nie pasuje — darmowa zamiana na innego mentora albo zwrot | Mechanizm obniża barierę wejścia, główny driver konwersji w modelu marketplace | do potwierdzenia |
| Z3 | Po sesji próbnej uczeń wybiera **plan: N sesji / tydzień**, rozliczany co 4 tygodnie. Opłacone sesje trafiają do **salda** u danego mentora | Przewidywalny przychód mentora i platformy, mniej rezerwacji „jednorazowych” | do potwierdzenia |
| Z4 | Przełożenie / anulowanie bez kosztów **do 12 h** przed sesją; później sesja przepada (wyjątek: decyzja admina w sporze) | Ochrona czasu mentora, prosta reguła do zakodowania | do potwierdzenia |
| Z5 | Prowizja platformy malejąca z liczbą przepracowanych godzin; sesja próbna w całości dla platformy | Zachęta do utrzymywania uczniów | do potwierdzenia, wpływa na model finansowy |
| Z6 | Wideo przez zewnętrznego dostawcę (np. Daily, LiveKit, Whereby Embedded) w osadzonym „pokoju sesji” | Budowa własnego WebRTC jest nadmiarowa w MVP | rekomendacja |
| Z7 | Płatności i wypłaty przez operatora z obsługą marketplace (np. Stripe Connect / PayU Marketplace) | Split płatności, KYC mentorów i wypłaty poza naszą odpowiedzialnością | rekomendacja |
| Z8 | Wyróżnik vs Preply: **cele i plan rozwoju** — uczeń definiuje cel, mentor po każdej sesji zostawia notatkę i zadania (action items) | Mentoring mierzy się postępem, nie liczbą lekcji | propozycja |
| Z9 | UI po polsku, mobile-first, strefa czasowa ucznia wyświetlana wszędzie | Rezerwacje między strefami to częsty błąd | wiążące |

**Poza zakresem MVP:** zajęcia grupowe, aplikacje natywne, własny edytor tablicy, program afiliacyjny, firmowe konta B2B, AI-dopasowanie mentora (kandydat na v2).

---

## 1. Użytkownicy systemu i ich potrzeby

| Rola | Kim jest | Kluczowe potrzeby | Główne obawy |
|---|---|---|---|
| **Gość** | Osoba szukająca mentora, niezalogowana | Szybko zobaczyć, czy są mentorzy w jej temacie i budżecie; porównać ich; zobaczyć wideo i opinie | „Czy to nie strata pieniędzy?”, „Czy mentor jest prawdziwym ekspertem?” |
| **Uczeń (mentee)** | Junior, osoba przebranżawiająca się, specjalista szukający awansu | Znaleźć pasującego mentora, umówić termin w swojej strefie czasowej, płacić przewidywalnie, łatwo przełożyć sesję, widzieć postęp wobec celu | Utrata pieniędzy przy anulowaniu, brak „chemii” z mentorem, skomplikowane rozliczenia |
| **Mentor** | Praktyk z doświadczeniem, freelancer lub etatowiec dorabiający | Pozyskać uczniów bez marketingu, kontrolować dostępność, mieć regularny przychód, szybkie wypłaty, mało administracji | No-show uczniów, wysoka prowizja, niejasne zasady rankingu |
| **Administrator / Zespół zaufania** | Pracownik platformy | Weryfikować mentorów, rozstrzygać spory i zwroty, moderować opinie, monitorować nadużycia | Fałszywe profile, obchodzenie płatności poza platformą, chargebacki |
| **System (aktor techniczny)** | Zadania cykliczne, webhooki | Przypomnienia, odnowienia subskrypcji, rozliczenie sesji po czasie, wygaszanie salda | Idempotencja webhooków płatności, strefy czasowe |

---

## 2. Use case'y i przepływy użytkownika

### 2.1 Lista use case'ów

| ID | Use case | Aktor | Priorytet |
|---|---|---|---|
| UC1 | Wyszukanie i filtrowanie mentorów | Gość, Uczeń | MVP |
| UC2 | Przegląd profilu mentora (wideo, opinie, kalendarz) | Gość, Uczeń | MVP |
| UC3 | Rejestracja i logowanie (e-mail, Google, LinkedIn) | Gość | MVP |
| UC4 | Rezerwacja i opłacenie sesji próbnej | Uczeń | MVP |
| UC5 | Wiadomość do mentora przed rezerwacją | Uczeń | MVP |
| UC6 | Udział w sesji (pokój wideo, notatki) | Uczeń, Mentor | MVP |
| UC7 | Ocena po sesji i decyzja o kontynuacji | Uczeń | MVP |
| UC8 | Zakup planu (subskrypcji) i zarządzanie nim | Uczeń | MVP |
| UC9 | Rezerwacja kolejnych sesji z salda | Uczeń | MVP |
| UC10 | Przełożenie / anulowanie sesji | Uczeń, Mentor | MVP |
| UC11 | Zmiana mentora z przeniesieniem salda | Uczeń | MVP |
| UC12 | Onboarding i weryfikacja mentora | Kandydat na mentora, Admin | MVP |
| UC13 | Zarządzanie dostępnością i kalendarzem | Mentor | MVP |
| UC14 | Obsługa próśb o sesję i uczniów | Mentor | MVP |
| UC15 | Notatki i zadania po sesji, cele ucznia | Mentor, Uczeń | MVP (wyróżnik) |
| UC16 | Zarobki i wypłaty | Mentor | MVP |
| UC17 | Zgłoszenie problemu / spór / zwrot | Uczeń, Mentor, Admin | MVP |
| UC18 | Moderacja opinii i profili | Admin | v1.1 |

### 2.2 Przepływy (ścieżka szczęśliwa + ścieżki błędów)

#### F1. Od wyszukania do sesji próbnej (UC1 → UC2 → UC3 → UC4)

```
Strona główna ──(temat, budżet)──▶ Wyszukiwarka ──(karta)──▶ Profil mentora
     │                                  │                        │
     │                       filtry: temat, cena, dostępność,     │ „Zarezerwuj próbną”
     │                       język, doświadczenie, sortowanie     ▼
     │                                                    Wybór terminu (30 min)
     │                                                           │
     │                                       niezalogowany? ──▶ Rejestracja/Logowanie ──┐
     │                                                           │◀────────────────────────┘
     │                                                           ▼
     │                                              Checkout: cel sesji + płatność
     │                                                           │
     │                                                           ▼
     └──────────────────────────────────────────────── Potwierdzenie + dodaj do kalendarza
```

| Krok | Ścieżka błędu | Zachowanie systemu |
|---|---|---|
| Wyszukiwarka | Brak wyników | Empty state z sugestią poluzowania filtrów (pokazujemy, który filtr najbardziej zawęża) |
| Wybór terminu | Slot zajęty w międzyczasie | Blokada slotu na 10 min przy wejściu do checkoutu (`hold`); jeśli wygasła lub zajęta → komunikat i kalendarz z odświeżonymi slotami |
| Rejestracja | E-mail zajęty | Propozycja logowania / resetu hasła, zachowany wybrany slot |
| Płatność | Odrzucona / 3DS przerwane | Komunikat z powodem od operatora, slot nadal zablokowany do końca `hold`, możliwość innej metody |
| Płatność | Webhook nie dotarł | Status „Przetwarzamy płatność” + polling; rezerwacja potwierdzana dopiero po webhooku (idempotentny `payment_intent_id`) |
| Potwierdzenie | Mentor odrzuca sesję próbną (np. konflikt) | Automatyczny zwrot 100% + propozycja 3 podobnych mentorów |

#### F2. Sesja i ocena (UC6 → UC7 → UC8)

```
Przypomnienie (24 h, 1 h) ─▶ Pokój sesji (wejście od T-10 min) ─▶ Koniec sesji
                                                                      │
                                                    Ocena: gwiazdki + „czy kontynuować?”
                                                       │                     │
                                               tak ▼                         ▼ nie
                                     Wybór planu (N/tydz.)        Zamiana na innego mentora
                                               │                  (darmowa próbna) lub zwrot
                                               ▼
                                Płatność cykliczna ─▶ Saldo sesji ─▶ Rezerwacja kolejnych
```

| Krok | Ścieżka błędu | Zachowanie |
|---|---|---|
| Pokój | Mentor nie dołączył w 10 min | Przycisk „Mentor się nie pojawił” → zgłoszenie, automatyczny zwrot sesji do salda |
| Pokój | Brak dostępu do kamery/mikrofonu | Test sprzętu przed wejściem, instrukcja nadania uprawnień, możliwość wejścia tylko z czatem |
| Pokój | Zerwane połączenie | Automatyczny reconnect, sesja nie kończy się przed czasem |
| Ocena | Uczeń pominie ocenę | Przypomnienie po 24 h; sesja rozliczana automatycznie po 48 h, jeśli brak zgłoszenia |
| Plan | Płatność cykliczna nieudana | 3 próby w 7 dni, powiadomienia, po nieudanych — plan wstrzymany, saldo zachowane |

#### F3. Przełożenie i anulowanie (UC10)

```
Moje sesje ─▶ Szczegóły sesji ─▶ [Przełóż] ─▶ nowy slot ─▶ potwierdzenie (mentor powiadomiony)
                              └▶ [Anuluj]  ─▶ ≥12 h: sesja wraca do salda
                                            └▶ <12 h: ostrzeżenie „sesja przepadnie” ─▶ potwierdź
```
Błędy: brak wolnych slotów mentora w 14 dni → propozycja wiadomości do mentora; przełożenie sesji, która już trwa → zablokowane z wyjaśnieniem.

#### F4. Onboarding mentora (UC12)

```
„Zostań mentorem” ─▶ Konto ─▶ 1 O mnie ─▶ 2 Kompetencje ─▶ 3 Opis i wideo ─▶ 4 Stawka
                       ─▶ 5 Dostępność ─▶ 6 Weryfikacja (dokument, LinkedIn, dane do wypłat)
                       ─▶ Wysłano do weryfikacji ─▶ [Admin] zatwierdź / poproś o zmiany / odrzuć
                       ─▶ Profil publiczny
```
Błędy: przerwanie w trakcie → zapis szkicu po każdym kroku; wideo za duże / zły format → walidacja przed uploadem, możliwość linku YouTube/Vimeo; odrzucenie → konkretny powód i lista poprawek.

#### F5. Codzienna praca mentora (UC13, UC14, UC15, UC16)

```
Panel mentora ─▶ Dziś: sesje + prośby o sesję próbną (akceptuj / odrzuć z powodem)
             ─▶ Kalendarz: dostępność cykliczna + wyjątki (urlop), sync z Google Calendar
             ─▶ Uczniowie: cel, historia, notatki, zadania ─▶ notatka po sesji
             ─▶ Zarobki: sesje rozliczone / oczekujące, wypłata
```
Błędy: konflikt z Google Calendar → slot automatycznie niedostępny; wypłata poniżej minimum → przycisk nieaktywny z wyjaśnieniem; brak zweryfikowanych danych do wypłat → baner z linkiem do uzupełnienia.

#### F6. Spór i zwrot (UC17)

```
Szczegóły sesji ─▶ „Zgłoś problem” (powód, opis) ─▶ Admin: kolejka sporów
   ─▶ wysłuchanie drugiej strony (48 h) ─▶ decyzja: zwrot do salda / zwrot na kartę / brak zwrotu
   ─▶ powiadomienie obu stron, wpis w historii
```

---

## 3. Mapa ekranów i nawigacji

### 3.1 Struktura

```
PUBLICZNE
├── P1  Strona główna                         /
├── P2  Wyszukiwarka mentorów                 /mentorzy
├── P3  Profil mentora                        /mentorzy/:id
└── P4  Logowanie / Rejestracja               /logowanie, /rejestracja

UCZEŃ  (dolna nawigacja mobile: Szukaj · Sesje · Wiadomości · Postępy · Konto)
├── U1  Wybór terminu                         /rezerwacja/:mentorId
├── U2  Checkout                              /rezerwacja/:mentorId/platnosc
├── U3  Potwierdzenie                         /rezerwacja/:bookingId/potwierdzenie
├── U4  Moje sesje (nadchodzące / minione)    /sesje
├── U5  Szczegóły sesji (przełóż/anuluj/zgłoś)/sesje/:id
├── U6  Pokój sesji                           /sesje/:id/pokoj
├── U7  Ocena sesji                           /sesje/:id/ocena
├── U8  Plany i saldo                         /plany
├── U9  Postępy (cele, notatki, zadania)      /postepy
└── S1  Wiadomości (wspólny)                  /wiadomosci[/:threadId]

MENTOR (dolna nawigacja: Panel · Kalendarz · Uczniowie · Wiadomości · Zarobki)
├── M1  Onboarding (6 kroków)                 /mentor/onboarding/:krok
├── M2  Panel                                 /mentor
├── M3  Kalendarz i dostępność                /mentor/kalendarz
├── M4  Uczniowie i notatki                   /mentor/uczniowie[/:id]
└── M5  Zarobki i wypłaty                     /mentor/zarobki

ADMIN
├── A1  Weryfikacja mentorów                  /admin/weryfikacja
└── A2  Spory i zwroty                        /admin/spory

WSPÓLNE: S2 Powiadomienia (/powiadomienia), S3 Konto i ustawienia (/konto)
```

### 3.2 Nawigacja i zasady

- **Nagłówek:** logo, przełącznik waluty i strefy czasowej (gość), dzwonek powiadomień, awatar z menu (Konto, Zmień rolę — gdy użytkownik jest i uczniem, i mentorem, Wyloguj).
- **Mobile (<768 px):** dolny pasek z 5 pozycjami zależnymi od roli; **desktop:** pasek w nagłówku.
- **Głębokie linki** z e-maili i powiadomień prowadzą bezpośrednio do U5, U6, U7, M2 (prośby).
- **Strażnicy tras:** trasy U*/M*/A* wymagają zalogowania; po zalogowaniu powrót do trasy docelowej (`returnTo`). M2–M5 dostępne dopiero po zatwierdzeniu profilu; wcześniej przekierowanie do M1 ze statusem weryfikacji.

---

## 4. Specyfikacja ekranów

Konwencje: **API** = REST `/api/v1`, JSON, auth przez cookie sesji (HttpOnly). Stany zapisano jako L (loading), E (empty), Er (error), S (success). Wszystkie kwoty jako `{ amount: int (grosze), currency }`, wszystkie daty w UTC ISO 8601, prezentacja w strefie użytkownika.

### P1 · Strona główna
- **Cel:** w ciągu kilku sekund przekierować gościa do wyszukiwarki z wstępnym filtrem.
- **Funkcje:** wyszukiwanie po temacie, kafelki popularnych kategorii, sekcja „jak to działa” (3 kroki: znajdź, sesja próbna, plan), wyróżnieni mentorzy, gwarancja sesji próbnej, CTA „Zostań mentorem”.
- **Komponenty:** Header, SearchBar (autocomplete tematów), CategoryChips, MentorCardMini ×4, StepsStrip, TrustBadges, Footer.
- **Stany:** L — skeleton kart wyróżnionych; E — brak wyróżnionych → sekcja ukryta; Er — błąd autocomplete → pole działa jako zwykły tekst; S — wyniki podpowiedzi.
- **Walidacje:** fraza 2–80 znaków; puste zapytanie prowadzi do pełnej listy.
- **API:** `GET /topics?query=`, `GET /mentors/featured`.

### P2 · Wyszukiwarka mentorów
- **Cel:** porównać mentorów i wybrać 1–3 do obejrzenia.
- **Funkcje:** filtry (temat, cena za 60 min — suwak, dostępność: pora dnia + dni tygodnia, język sesji, lata doświadczenia, „tylko zweryfikowani”), sortowanie (trafność, cena ↑↓, ocena, liczba sesji), paginacja nieskończona, zapis do ulubionych, podgląd wideo na hover (desktop).
- **Komponenty:** FilterBar (mobile: bottom sheet), SortSelect, MentorCard (zdjęcie, imię, headline, tagi, ocena, liczba sesji, cena, „odpowiada zwykle w X h”, przyciski Zarezerwuj / Napisz), ActiveFilterChips, ResultCount.
- **Stany:** L — 6 skeletonów; E — „Brak mentorów dla tych filtrów” + przycisk „Wyczyść filtr X” dla filtra najbardziej zawężającego; Er — „Nie udało się wczytać listy” + Ponów; S — lista.
- **Walidacje:** cena min ≤ max, zakres 0–1000 zł; filtry serializowane w URL (udostępnialny link).
- **API:** `GET /mentors?topic=&priceMin=&priceMax=&days=&timeOfDay=&lang=&expMin=&verified=&sort=&cursor=`, `POST/DELETE /me/favorites/:mentorId`.

### P3 · Profil mentora
- **Cel:** zbudować zaufanie i doprowadzić do rezerwacji sesji próbnej.
- **Funkcje:** wideo-wprowadzenie, opis, kompetencje, doświadczenie (firmy, role), statystyki (ocena, sesje, % powracających uczniów, czas odpowiedzi), kalendarz dostępności (tydzień, w strefie ucznia), opinie z filtrowaniem, sticky CTA „Zarezerwuj sesję próbną — X zł” + „Napisz wiadomość”, podobni mentorzy.
- **Komponenty:** ProfileHero, VideoPlayer, StatsRow, SkillTags, ExperienceList, AvailabilityWeek, ReviewList + RatingBreakdown, StickyBookingBar, SimilarMentors.
- **Stany:** L — skeleton hero i kalendarza; E — brak opinii → „Nowy mentor”, brak slotów w 14 dni → „Napisz, by ustalić termin”; Er — 404 „Profil niedostępny” (np. zawieszony) + podobni mentorzy; S — pełny profil.
- **Walidacje:** — (tylko odczyt); przycisk rezerwacji nieaktywny, gdy mentor ma wstrzymane przyjmowanie nowych uczniów.
- **API:** `GET /mentors/:id`, `GET /mentors/:id/availability?from=&to=&tz=`, `GET /mentors/:id/reviews?cursor=`, `GET /mentors/:id/similar`.

### P4 · Logowanie / Rejestracja
- **Cel:** założyć konto bez utraty kontekstu rezerwacji.
- **Funkcje:** e-mail + hasło, Google, LinkedIn; wybór „Chcę się uczyć / Chcę mentorować”; reset hasła; zgody (regulamin — wymagany, marketing — opcjonalny, niezaznaczony).
- **Komponenty:** AuthTabs, SocialButtons, TextField, PasswordField z miernikiem siły, ConsentCheckbox, InlineError.
- **Stany:** L — przycisk z spinnerem, blokada podwójnego wysłania; E — n/d; Er — „Nieprawidłowy e-mail lub hasło” (bez ujawniania, który), 429 → „Za dużo prób, spróbuj za X min”; S — przekierowanie do `returnTo`.
- **Walidacje:** e-mail RFC; hasło ≥ 10 znaków, nie z listy wycieków; imię 2–50; akceptacja regulaminu wymagana.
- **API:** `POST /auth/register`, `POST /auth/login`, `GET /auth/oauth/:provider`, `POST /auth/password-reset`, `GET /me`.

### U1 · Wybór terminu
- **Cel:** wybrać slot sesji próbnej lub kolejnej sesji.
- **Funkcje:** długość sesji (próbna: 30 min stałe; plan: 30/60), tydzień z przewijaniem, sloty w strefie ucznia (zmiana strefy), informacja o zasadzie 12 h.
- **Komponenty:** MentorSummaryBar, DurationToggle, WeekPicker, SlotGrid, TimezoneSelect, StickyContinueButton.
- **Stany:** L — skeleton siatki; E — brak slotów w tygodniu → „Następny wolny termin: …” + skok; Er — błąd pobrania → Ponów; konflikt `hold` (409) → toast „Ten termin został właśnie zajęty”; S — slot zaznaczony, aktywny „Dalej”.
- **Walidacje:** slot ≥ 6 h od teraz (minimalne wyprzedzenie ustawiane przez mentora); maks. 1 sesja próbna na parę uczeń–mentor.
- **API:** `GET /mentors/:id/availability`, `POST /bookings/holds` → `{ holdId, expiresAt }`.

### U2 · Checkout
- **Cel:** opłacić rezerwację i przekazać mentorowi kontekst.
- **Funkcje:** podsumowanie (mentor, termin, czas trwania, cena, opłata serwisowa), pole „Z czym przychodzisz?” (cel sesji), wybór metody (karta, BLIK, Przelewy24), kod rabatowy, licznik ważności blokady, informacja o gwarancji.
- **Komponenty:** OrderSummary, HoldCountdown, GoalTextarea, PaymentMethodSelector (osadzone pola operatora), PromoCodeField, PayButton, GuaranteeNote.
- **Stany:** L — „Przetwarzamy płatność…”, przycisk zablokowany; E — n/d; Er — odrzucona płatność (komunikat operatora), wygasła blokada → powrót do U1 z zachowanym mentorem, nieprawidłowy kod; S — przekierowanie do U3.
- **Walidacje:** cel sesji 20–500 znaków (wymagany dla próbnej); kod rabatowy weryfikowany na serwerze; kwota liczona wyłącznie po stronie serwera.
- **API:** `GET /bookings/holds/:id`, `POST /promo-codes/validate`, `POST /checkout` → `{ clientSecret }`, webhook `POST /webhooks/payments` (serwer), `GET /bookings/:id` (polling statusu).

### U3 · Potwierdzenie rezerwacji
- **Cel:** dać pewność, że sesja jest umówiona, i przygotować ucznia.
- **Funkcje:** szczegóły terminu, dodaj do kalendarza (Google/Outlook/.ics), link do pokoju, checklista przygotowania, napisz do mentora.
- **Komponenty:** SuccessHeader, BookingCard, CalendarButtons, PrepChecklist.
- **Stany:** L — oczekiwanie na webhook (do 30 s, potem „Potwierdzimy e-mailem”); Er — płatność niepotwierdzona po 5 min → kontakt z pomocą, bez podwójnego obciążenia; S — potwierdzenie.
- **API:** `GET /bookings/:id`, `GET /bookings/:id/ics`.

### U4 · Moje sesje
- **Cel:** jedno miejsce z nadchodzącymi i minionymi sesjami.
- **Funkcje:** zakładki Nadchodzące / Minione, karta najbliższej sesji z „Dołącz” (aktywny od T-10 min), saldo per mentor, szybkie akcje (przełóż, napisz), filtr po mentorze.
- **Komponenty:** Tabs, NextSessionHero, SessionListItem, BalancePill, EmptyIllustration.
- **Stany:** L — skeleton listy; E — „Nie masz jeszcze sesji” + CTA do wyszukiwarki; Er — Ponów; S — lista.
- **API:** `GET /me/bookings?status=upcoming|past&cursor=`, `GET /me/balances`.

### U5 · Szczegóły sesji
- **Cel:** zarządzać pojedynczą sesją.
- **Funkcje:** dane sesji, cel, notatka mentora i zadania (po sesji), Przełóż, Anuluj (z informacją o skutkach wg zasady 12 h), Zgłoś problem, Dołącz.
- **Komponenty:** SessionHeader, PolicyNotice, ActionButtons, ConfirmDialog, RescheduleSheet (SlotGrid), ProblemReportForm, NotesPanel.
- **Stany:** L; Er — 404/403 (nie twoja sesja); S — po akcji toast i odświeżony status; stany statusu sesji: `scheduled`, `in_progress`, `completed`, `cancelled`, `no_show`, `disputed`.
- **Walidacje:** przełożenie/anulowanie zablokowane po rozpoczęciu; zgłoszenie problemu do 72 h po sesji; opis 30–1000 znaków.
- **API:** `GET /bookings/:id`, `POST /bookings/:id/reschedule`, `POST /bookings/:id/cancel` (odpowiedź zawiera `refundToBalance: bool`), `POST /bookings/:id/disputes`.

### U6 · Pokój sesji
- **Cel:** przeprowadzić sesję bez tarcia technicznego.
- **Funkcje:** test sprzętu przed wejściem, wideo/audio, udostępnianie ekranu, czat z linkami i plikami, wspólne notatki, licznik czasu, „Mentor się nie pojawił” (po 10 min), zakończenie.
- **Komponenty:** DeviceCheck, VideoStage, ControlBar, ChatPanel, SharedNotes, Timer, NoShowButton.
- **Stany:** L — łączenie; E — czekanie na drugą osobę; Er — brak uprawnień do kamery, utrata połączenia (auto-reconnect), pokój przed czasem (odliczanie); S — połączono.
- **Walidacje:** wejście możliwe od T-10 min do końca sesji; pliki ≤ 10 MB.
- **API:** `POST /bookings/:id/room-token`, `POST /bookings/:id/no-show`, `PUT /bookings/:id/shared-notes`, WebSocket `/ws/bookings/:id/chat`.

### U7 · Ocena sesji
- **Cel:** zebrać ocenę i skierować ucznia do kontynuacji (po próbnej) lub zamiany mentora.
- **Funkcje:** ocena 1–5, tagi (np. „konkretny”, „dobrze przygotowany”), opinia publiczna, uwaga prywatna dla mentora; po próbnej: „Kontynuuj z mentorem” → U8 lub „Spróbuj z innym mentorem” (darmowa zamiana).
- **Komponenty:** StarRating, TagSelector, Textarea ×2, ContinueChoice.
- **Stany:** L — wysyłanie; Er — błąd zapisu (dane zachowane lokalnie); S — podziękowanie + następny krok.
- **Walidacje:** ocena wymagana; opinia publiczna 0 lub 20–1000 znaków; ocena ≤ 2 wymaga uzasadnienia; jedna ocena na sesję, edycja do 7 dni.
- **API:** `POST /bookings/:id/review`, `POST /trial-replacements`.

### U8 · Plany i saldo
- **Cel:** wybrać/zmienić plan i rozumieć saldo.
- **Funkcje:** wybór planu (1/2/3/5 sesji tygodniowo × 30/60 min) z ceną za 4 tygodnie, data odnowienia, saldo per mentor, zmiana planu (od kolejnego okresu), wstrzymanie, anulowanie, przeniesienie salda do innego mentora, historia płatności i faktury.
- **Komponenty:** PlanPicker, PriceBreakdown, ActivePlanCard, BalanceTable, TransferBalanceDialog, InvoiceList.
- **Stany:** L; E — brak planu → „Zacznij od sesji próbnej”; Er — nieudane odnowienie → baner „Zaktualizuj metodę płatności”; S — aktywny plan.
- **Walidacje:** przeniesienie salda tylko do mentora, z którym odbyła się próbna lub w ramach UC11; kwota przeliczana wg stawki nowego mentora (pokazujemy wynik przed potwierdzeniem).
- **API:** `GET /me/subscriptions`, `POST /subscriptions`, `PATCH /subscriptions/:id` (plan, pause, cancel), `POST /balances/transfer`, `GET /me/invoices`.

### U9 · Postępy (wyróżnik)
- **Cel:** pokazać, że mentoring przybliża do celu.
- **Funkcje:** cel główny (np. „Pierwsza praca jako frontend dev do marca”), kamienie milowe, notatki mentora po sesjach, zadania z odhaczaniem, oś czasu sesji.
- **Komponenty:** GoalCard, MilestoneList, ActionItemChecklist, SessionNotesTimeline.
- **Stany:** L; E — „Ustal cel z mentorem na pierwszej sesji” + formularz celu; Er — Ponów; S.
- **Walidacje:** cel 10–200 znaków; termin celu w przyszłości.
- **API:** `GET/PUT /me/goals`, `GET /me/action-items`, `PATCH /action-items/:id`.

### S1 · Wiadomości
- **Cel:** komunikacja przed i między sesjami, w obrębie platformy.
- **Funkcje:** lista wątków, wątek z historią, załączniki, kontekst (najbliższa sesja), oznaczenie nieprzeczytanych; ostrzeżenie przy próbie przekazania danych kontaktowych/płatności poza platformę.
- **Komponenty:** ThreadList, ThreadView, MessageBubble, Composer, ContextCard, OffPlatformWarning.
- **Stany:** L; E — „Brak wiadomości”; Er — nie wysłano → „Ponów” przy wiadomości; S.
- **Walidacje:** wiadomość 1–2000 znaków; pierwsza wiadomość ucznia do mentora bez rezerwacji: limit 5 nowych wątków / dobę (antyspam).
- **API:** `GET /threads`, `GET /threads/:id/messages?cursor=`, `POST /threads`, `POST /threads/:id/messages`, WebSocket `/ws/threads`.

### M1 · Onboarding mentora (6 kroków)
- **Cel:** zebrać dane potrzebne do publikacji i weryfikacji profilu.
- **Funkcje:** 1) O mnie (zdjęcie, imię, kraj, języki), 2) Kompetencje (kategorie, tagi, lata doświadczenia, firmy), 3) Opis i wideo, 4) Stawka (60 min; 30 min liczona proporcjonalnie, podgląd zarobku po prowizji), 5) Dostępność cykliczna, 6) Weryfikacja (LinkedIn, dokument tożsamości przez operatora KYC, dane do wypłat). Pasek postępu, zapis szkicu, podgląd profilu.
- **Komponenty:** Stepper, PhotoUploader z kadrowaniem, TagInput, RichTextarea z licznikiem, VideoUploader / VideoLinkField, RateInput + EarningsPreview, WeeklyAvailabilityEditor, KycEmbed, ProfilePreview.
- **Stany:** L — zapis kroku; E — n/d; Er — błędy pól inline, upload nieudany → ponów; status po wysłaniu: `draft` → `submitted` → `changes_requested` / `approved` / `rejected`; S — „Wysłano do weryfikacji, zwykle do 2 dni roboczych”.
- **Walidacje:** zdjęcie JPG/PNG ≥ 400×400, ≤ 5 MB, widoczna twarz (weryfikacja przez admina); headline 20–80 znaków; opis 300–2000 znaków; 1–5 kategorii, 3–15 tagów; wideo MP4/MOV ≤ 200 MB, 30 s–3 min, lub link YouTube/Vimeo; stawka 40–1000 zł; dostępność ≥ 3 h tygodniowo; dane do wypłat wymagane przed publikacją.
- **API:** `GET/PUT /me/mentor-profile`, `POST /uploads` (presigned URL), `PUT /me/mentor-profile/availability`, `POST /me/mentor-profile/submit`, `POST /me/kyc/session`.

### M2 · Panel mentora
- **Cel:** zobaczyć, co wymaga uwagi dzisiaj.
- **Funkcje:** dzisiejsze sesje z „Dołącz”, prośby o sesję próbną (akceptuj / odrzuć z powodem — SLA 24 h, potem auto-akceptacja jeśli slot wolny), nieodpisane wiadomości, zadania „uzupełnij notatkę po sesji”, statystyki tygodnia (godziny, przychód, konwersja próbnych na plany), status profilu.
- **Komponenty:** TodayAgenda, RequestCard, TaskList, KpiTiles, ProfileHealthCard.
- **Stany:** L; E — „Brak sesji dzisiaj” + wskazówki zwiększenia widoczności; Er — Ponów per sekcja; S.
- **Walidacje:** odrzucenie prośby wymaga powodu (lista + „inne” 10–300 znaków).
- **API:** `GET /mentor/dashboard`, `POST /bookings/:id/accept`, `POST /bookings/:id/decline`.

### M3 · Kalendarz i dostępność
- **Cel:** kontrolować, kiedy uczniowie mogą rezerwować.
- **Funkcje:** widok tygodnia z sesjami, edycja szablonu tygodniowego, wyjątki (urlop, dodatkowe godziny), minimalne wyprzedzenie rezerwacji, bufor między sesjami, synchronizacja z Google Calendar, wstrzymanie przyjmowania nowych uczniów.
- **Komponenty:** WeekCalendar, AvailabilityTemplateEditor, ExceptionDialog, SettingsForm, CalendarSyncCard.
- **Stany:** L; E — brak dostępności → baner „Uczniowie nie mogą cię zarezerwować”; Er — konflikt z istniejącą sesją przy usuwaniu dostępności → komunikat z listą sesji do przełożenia; błąd sync → ponowne połączenie; S — „Zapisano”.
- **Walidacje:** przedziały bez nakładania; min. 30 min; wyprzedzenie 2–48 h; bufor 0–30 min.
- **API:** `GET /mentor/calendar?from=&to=`, `PUT /mentor/availability/template`, `POST/DELETE /mentor/availability/exceptions`, `PATCH /mentor/settings`, `POST /integrations/google-calendar`.

### M4 · Uczniowie i notatki
- **Cel:** prowadzić ucznia w czasie.
- **Funkcje:** lista uczniów (aktywni / próbni / nieaktywni), profil ucznia z celem, historią sesji i saldem, notatka po sesji z zadaniami (szablon: co omówiliśmy / zadania / na następną sesję), prywatne notatki mentora.
- **Komponenty:** StudentList z filtrami, StudentDetail, SessionNoteEditor, ActionItemEditor.
- **Stany:** L; E — „Nie masz jeszcze uczniów”; Er; S — „Notatka wysłana uczniowi”.
- **Walidacje:** notatka 20–3000 znaków; zadanie 3–200 znaków, opcjonalny termin.
- **API:** `GET /mentor/students`, `GET /mentor/students/:id`, `POST /bookings/:id/notes`, `POST /action-items`.

### M5 · Zarobki i wypłaty
- **Cel:** przejrzystość przychodu.
- **Funkcje:** dostępne do wypłaty, oczekujące (sesje do 48 h po zakończeniu), aktualny próg prowizji i ile godzin do kolejnego, historia sesji z kwotami brutto/prowizja/netto, wypłata, eksport CSV, dane do faktur.
- **Komponenty:** BalanceSummary, CommissionTierProgress, EarningsTable, PayoutButton, PayoutHistory.
- **Stany:** L; E — „Brak zarobków”; Er — brak danych do wypłat → baner; wypłata nieudana → powód od operatora; S — „Wypłata zlecona”.
- **Walidacje:** minimum wypłaty 100 zł; maks. 1 wypłata ręczna / dobę.
- **API:** `GET /mentor/earnings?from=&to=`, `GET /mentor/payouts`, `POST /mentor/payouts`, `GET /mentor/earnings/export.csv`.

### A1 · Weryfikacja mentorów
- **Cel:** wpuszczać tylko wiarygodnych mentorów.
- **Funkcje:** kolejka zgłoszeń (wiek zgłoszenia, SLA), podgląd profilu, wynik KYC, link LinkedIn, checklista weryfikacji, decyzja: zatwierdź / poproś o zmiany (lista pól + komentarz) / odrzuć (powód).
- **Komponenty:** QueueTable, ApplicationDetail, ChecklistPanel, DecisionDialog, AuditLog.
- **Stany:** L; E — „Kolejka pusta”; Er; S — zgłoszenie znika z kolejki, wpis w audycie.
- **Walidacje:** prośba o zmiany wymaga min. 1 pola i komentarza; odrzucenie wymaga powodu; decyzje tylko dla roli `admin_trust`.
- **API:** `GET /admin/mentor-applications?status=submitted`, `GET /admin/mentor-applications/:id`, `POST /admin/mentor-applications/:id/decision`.

### A2 · Spory i zwroty
- **Cel:** sprawiedliwie i szybko rozstrzygać problemy.
- **Funkcje:** kolejka sporów, oś zdarzeń sesji (kto i kiedy dołączył do pokoju — dowód), stanowiska stron, decyzja (zwrot do salda / na kartę / częściowy / brak), komunikat do stron.
- **Komponenty:** DisputeQueue, SessionEventTimeline, StatementsPanel, ResolutionForm.
- **Stany:** L; E; Er; S — „Spór rozstrzygnięty”.
- **Walidacje:** kwota zwrotu ≤ kwota sesji; uzasadnienie 20–1000 znaków.
- **API:** `GET /admin/disputes`, `GET /admin/disputes/:id`, `POST /admin/disputes/:id/resolve`.

### S2 · Powiadomienia, S3 · Konto
- **S2:** lista powiadomień z głębokimi linkami, oznacz jako przeczytane; `GET /me/notifications`, `POST /me/notifications/read`.
- **S3:** dane profilu, strefa czasowa, waluta, metody płatności, zgody i preferencje powiadomień (e-mail/push per typ), eksport danych i usunięcie konta (RODO); `GET/PATCH /me`, `GET/DELETE /me/payment-methods/:id`, `POST /me/data-export`, `DELETE /me`.

---

## 5. Model danych (szkic)

```
User(id, email, name, avatarUrl, timezone, currency, roles[student|mentor|admin_*], createdAt)
MentorProfile(userId, status[draft|submitted|changes_requested|approved|rejected|suspended],
              headline, bio, videoUrl, categories[], tags[], yearsExp, languages[],
              rate60, minNoticeHours, bufferMin, acceptingNew, ratingAvg, sessionsCount)
AvailabilityRule(mentorId, weekday, startLocal, endLocal, timezone)
AvailabilityException(mentorId, startsAt, endsAt, type[off|extra])
BookingHold(id, studentId, mentorId, startsAt, durationMin, expiresAt)
Booking(id, studentId, mentorId, startsAt, durationMin, type[trial|plan|single],
        status[pending_payment|requested|scheduled|in_progress|completed|cancelled|no_show|disputed],
        goal, subscriptionId?, priceAmount, currency)
Subscription(id, studentId, mentorId, sessionsPerWeek, durationMin, periodAmount,
             status[active|paused|past_due|cancelled], currentPeriodEnd)
Balance(studentId, mentorId, sessionsAvailable)        ← ledger: BalanceEntry(+/-, reason, bookingId)
Payment(id, providerId, amount, status, bookingId?|subscriptionId?)  ← idempotentnie po providerId
Review(bookingId, rating, tags[], publicText, privateText)
SessionNote(bookingId, mentorId, body) · ActionItem(id, studentId, bookingId?, text, dueAt?, doneAt?)
Goal(studentId, text, targetDate, milestones[])
Thread(id, participants[]) · Message(id, threadId, senderId, body, attachments[], createdAt)
Dispute(id, bookingId, openedBy, reason, status, resolution, refundAmount)
Payout(id, mentorId, amount, status, providerId) · AuditLog(actorId, action, entity, payload, at)
```

**Reguły domenowe jako czyste funkcje (deterministyczne, testowalne):** `canCancelFree(booking, now)`, `commissionRate(hoursCompleted)`, `slotsFor(rules, exceptions, bookings, tz, range)`, `transferBalance(sessions, fromRate, toRate)`, `autoCompleteAt(booking)`.

---

## 6. Ryzyka i otwarte pytania

| Ryzyko | Mitygacja |
|---|---|
| Obchodzenie płatności (kontakt poza platformą) | Detekcja numerów/e-maili w wiadomościach przed pierwszą sesją, wartość dodana na platformie (postępy, gwarancja, notatki) |
| Strefy czasowe i zmiana czasu (DST) | Przechowywanie w UTC, reguły dostępności w czasie lokalnym mentora z jego strefą, testy na przełomie marca/października |
| Podwójna rezerwacja | `BookingHold` z TTL + unikalny indeks na (mentorId, przedział czasu) w transakcji |
| Webhooki płatności (duplikaty, kolejność) | Idempotencja po `providerId`, maszyna stanów płatności, dead-letter queue |
| RODO: nagrania i notatki | Brak nagrań w MVP; notatki widoczne tylko dla stron sesji; eksport i usunięcie danych |
| Jakość mentorów | Weryfikacja ręczna + KYC, monitorowanie ocen i no-show, zawieszenie przy progach |

**Otwarte pytania:**
1. Czy mentorzy mogą oferować pakiety jednorazowe obok subskrypcji (np. „przegląd CV”)?
2. Model prowizji — progi i stawki (wymaga modelu finansowego).
3. Czy saldo wygasa (np. po 6 miesiącach nieaktywności)?
4. Faktury: platforma jako pośrednik czy agent rozliczeniowy mentora (konsultacja księgowa)?
5. Czy dopuszczamy mentorów spoza PL (waluty, podatki, KYC)?

---

## 7. Mockupy

Klikalne mockupy w katalogu `mockupy/` (HTML/CSS/TypeScript, bez frameworka). Instrukcja w `README.md`. Pokrywają ścieżki F1–F6 oraz podgląd stanów loading / empty / error / success dla każdego ekranu (`?state=…` w adresie lub przełącznik w pasku narzędzi mockupu).
