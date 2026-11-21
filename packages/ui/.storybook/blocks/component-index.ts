/** Indeks komponentów do tabeli w „Zacznij tutaj” i „Komponenty”. Źródło: POSTEP.md. */
export const componentIndex = [
  // Primitives – Akcje
  { name: 'Button', import: 'Button', group: 'Akcje', when: 'Główna, drugorzędna, cicha lub destrukcyjna akcja na ekranie', whenNot: 'Nawigacja (użyj Link), przełącznik (Switch/ToggleGroup)' },
  { name: 'Link', import: 'Link', group: 'Akcje', when: 'Nawigacja do innego miejsca, akcja tekstowa w treści', whenNot: 'Wywoływanie akcji na stronie (Button)' },
  { name: 'ToggleGroup', import: 'ToggleGroup', group: 'Akcje', when: 'Wybór 1 lub kilku opcji widocznych obok siebie (np. 30/60 min, pora dnia)', whenNot: 'Wiele opcji ukrytych (Select), binarny przełącznik (Switch), wyłącznie (RadioGroup)' },

  // Primitives – Formularze
  { name: 'Field', import: 'Field', group: 'Formularze', when: 'Etykieta + pole + podpowiedź + błąd + opcjonalne/wymagane w jednym', whenNot: 'Samodzielne pola bez etykiety' },
  { name: 'Input', import: 'Input', group: 'Formularze', when: 'Krótki tekst, e-mail, hasło, URL, liczba', whenNot: 'Wielowierszowy tekst (Textarea), wybór z listy (Select/Combobox)' },
  { name: 'Textarea', import: 'Textarea', group: 'Formularze', when: 'Długi tekst z licznikiem (profil 300–2000, powód 10–300)', whenNot: 'Krótki tekst (Input)' },
  { name: 'Select', import: 'Select', group: 'Formularze', when: 'Wyбір z 7–20 opcji, zawsze pod polem (strefa czasowa, sortowanie)', whenNot: 'Wyszukiwanie (Combobox), 2–6 opcji (RadioGroup/ToggleGroup)' },
  { name: 'Combobox', import: 'Combobox', group: 'Formularze', when: 'Pole z wyszukiwaniem, wiele tagów (tematy, tagi mentora)', whenNot: 'Stała lista (Select), wyłącznie (RadioGroup)' },
  { name: 'Checkbox', import: 'Checkbox', group: 'Formularze', when: 'Binarne tak/nie, zgody, filtry wielokrotnego wyboru', whenNot: 'Wyłącznie jeden z wielu (RadioGroup), przełącznik on/off (Switch)' },
  { name: 'RadioGroup', import: 'RadioGroup', group: 'Formularze', when: 'Wyłącznie jeden z 2–6 opcji z opisami (rola, powód odrzucenia)', whenNot: 'Wiele opcji (Select/Combobox), binarny (Checkbox/Switch)' },
  { name: 'Switch', import: 'Switch', group: 'Formularze', when: 'Przełącznik on/off z natychmiastowym efektem (powiadomienia, przyjmowanie uczniów)', whenNot: 'Wyłącznie z opcji (RadioGroup), zatwierdzenie formularza (Checkbox)' },
  { name: 'Slider', import: 'Slider', group: 'Formularze', when: 'Zakres liczbowy z podglądem wartości (cena 0–1000 zł)', whenNot: 'Dokładna liczba (Input), dyskretne opcje (ToggleGroup)' },

  // Primitives – Treść
  { name: 'Card', import: 'Card', group: 'Treść', when: 'Panel z ramką i paddingiem (sekcje P3, M2, S3)', whenNot: 'Linia między wierszami (Separator), lista bez ramki' },
  { name: 'Separator', import: 'Separator', group: 'Treść', when: 'Cienna linia między wierszami/grupami (R01.4)', whenNot: 'Ramka panelu (Card)' },
  { name: 'Badge', import: 'Badge', group: 'Treść', when: 'Status zawsze z ikoną i tekstem (sesja, wniosek, prośba)', whenNot: 'Tylko kolor bez tekstu (WCAG 1.4.1), licznik (zwykły tekst)' },
  { name: 'Avatar', import: 'Avatar', group: 'Treść', when: 'Zdjęcie lub inicjały (mentor w karcie, uczeń w prośbie, nagłówek)', whenNot: 'Ikona statusu (Badge), dekoracja' },
  { name: 'Table', import: 'Table', group: 'Treść', when: 'Gęsta tabela liczb z wyrównaniem do prawej (kolejka A1)', whenNot: 'Prosta lista (SessionListItem), karty (MentorCard)' },
  { name: 'Tabs', import: 'Tabs', group: 'Treść', when: 'Zakładki z podkreśleniem (Nadchodzące/Minione, Logowanie/Rejestracja)', whenNot: 'Osobne strony, panel boczny (Sheet)' },

  // Primitives – Nakładki
  { name: 'Dialog', import: 'Dialog', group: 'Nakładki', when: 'Zadanie wymagające skupienia, formularz, potwierdzenie (A1, M3)', whenNot: 'Proste potwierdzenie (AlertDialog), panel boczny (Sheet), podpowiedź (Tooltip)' },
  { name: 'AlertDialog', import: 'AlertDialog', group: 'Nakładki', when: 'Nieodwracalna akcja z czasownikiem (Usuń konto, Anuluj < 12 h)', whenNot: 'Zwykłe zadanie (Dialog), panel boczny (Sheet)' },
  { name: 'Sheet', import: 'Sheet', group: 'Nakładki', when: 'Panel boczny/dolny (filtry mobile, przełożenie U5)', whenNot: 'Dialog środkowy, podpowiedź (Popover/Tooltip)' },
  { name: 'Menu', import: 'Menu', group: 'Nakładki', when: 'Menu profilu, akcje wiersza (nawigacja strzałkami)', whenNot: 'Podpowiedź (Tooltip), formularz (Dialog)' },
  { name: 'Popover', import: 'Popover', group: 'Nakładki', when: 'Pływające okienko pomocnicze (wybór tygodnia, filtr pory dnia)', whenNot: 'Blokujące tło (Dialog/Sheet), podpowiedź (Tooltip)' },
  { name: 'Tooltip', import: 'Tooltip', group: 'Nakładki', when: 'Krótki tekst przy ikonie/przycisku (tylko do odczytu, Escape zamyka)', whenNot: 'Interaktywna treść (Popover), błąd pola (FieldError)' },

  // Primitives – Komunikaty
  { name: 'Alert', import: 'Alert', group: 'Komunikaty', when: 'Baner statusu w treści (wstrzymanie M3, reguła 12 h U5)', whenNot: 'Dynamiczny błąd po akcji (role="alert" jawnie), toast' },
  { name: 'Toast', import: 'useToast', group: 'Komunikaty', when: 'Potwierdzenie akcji, 409 konflikt terminu, zapisano (aria-live polite)', whenNot: 'Błąd wymagający działania (Alert w treści), status w treści (Alert)' },
  { name: 'Skeleton', import: 'Skeleton', group: 'Komunikaty', when: 'Stan ładowania struktury (karta, wiersz, tabela)', whenNot: 'Pusty stan (EmptyState), błąd (ErrorState)' },
  { name: 'Spinner', import: 'Spinner', group: 'Komunikaty', when: 'Wskaźnik w przycisku (loading), sekcja (role="status")', whenNot: 'Szkielet całej struktury (Skeleton)' },
  { name: 'EmptyState', import: 'EmptyState', group: 'Komunikaty', when: 'Dlaczego pusto + następny krok (brak wyników filtrów vs pierwsze użycie)', whenNot: 'Ładowanie (Skeleton), błąd (ErrorState)' },
  { name: 'ErrorState', import: 'ErrorState', group: 'Komunikaty', when: 'Błąd wczytania widoku + przycisk „Ponów”', whenNot: 'Pusty stan (EmptyState), ładowanie (Skeleton)' },

  // Product – Wspólne
  { name: 'AppHeader', import: 'AppHeader', group: 'Wspólne', when: 'Nagłówek aplikacji z 5 pozycjami nawigacji per rola', whenNot: 'Nagłówek strony (PageHeader)' },
  { name: 'PageHeader', import: 'PageHeader', group: 'Wspólne', when: 'Tytuł + opcjonalna akcja auxiliary (profil, szczegóły)', whenNot: 'Nagłówek aplikacji (AppHeader)' },
  { name: 'Money', import: 'Money', group: 'Wspólne', when: 'Kwota w walucie użytkownika, cyfry tabelaryczne', whenNot: 'Zwykły tekst, liczba bez waluty' },
  { name: 'DateTime', import: 'DateTime', group: 'Wspólne', when: 'Data/godzina w strefie użytkownika, skrótowy format PL', whenNot: 'Timestamp ISO, tylko data bez strefy' },

  // Product – E1
  { name: 'PasswordField', import: 'PasswordField', group: 'E1 Tożsamość', when: 'Hasło z pokaż/ukryj i miernik siły (P4)', whenNot: 'Zwykłe pole (Input)' },
  { name: 'RoleChoice', import: 'RoleChoice', group: 'E1 Tożsamość', when: 'Wybór „uczyć się / mentorować” (P4)', whenNot: 'Inny RadioGroup' },
  { name: 'ConsentField', import: 'ConsentField', group: 'E1 Tożsamość', when: 'Zgoda z linkiem do regulaminu (P4, S3)', whenNot: 'Zwykły Checkbox' },
  { name: 'DataRequestRow', import: 'DataRequestRow', group: 'E1 Tożsamość', when: 'Wiersz żądania danych (S3)', whenNot: 'Zwykły wiersz tabeli' },

  // Product – E2
  { name: 'MentorCard', import: 'MentorCard', group: 'E2 Katalog', when: 'Karta/wiersz mentora w wynikach (P2, P1, E2-S8)', whenNot: 'Mini wersja (MentorCardMini), szczegóły (ProfileHero)' },
  { name: 'FilterPanel', import: 'FilterPanel', group: 'E2 Katalog', when: 'Panel filtrów z Select, Slider, Switch, Sheet (P2)', whenNot: 'Aktywne filtry (ActiveFilters)' },
  { name: 'ActiveFilters', import: 'ActiveFilters', group: 'E2 Katalog', when: 'Licznik + aktywne filtry z usuwaniem + reset (P2)', whenNot: 'Panel filtrów (FilterPanel)' },
  { name: 'ProfileHero', import: 'ProfileHero', group: 'E2 Katalog', when: 'Nagłówek profilu: awatar, nagłówek, statystyki, tagi, StickyBookingBar (P3)', whenNot: 'Karta w liście (MentorCard)' },
  { name: 'StickyBookingBar', import: 'StickyBookingBar', group: 'E2 Katalog', when: 'Przypięty pasek z regułą 12 h i CTA (P3)', whenNot: 'Zwykły Button' },
  { name: 'OnboardingStepper', import: 'OnboardingStepper', group: 'E2 Katalog', when: 'Kroki 1–6 onboardingu mentora (M1)', whenNot: 'Inne formularze' },
  { name: 'ApplicationQueue', import: 'ApplicationQueue', group: 'E2 Katalog', when: 'Wiersz kolejki weryfikacji z wiekiem i SLA (A1)', whenNot: 'Zwykły wiersz tabeli' },
  { name: 'DecisionForm', import: 'DecisionForm', group: 'E2 Katalog', when: 'Formularz decyzji weryfikacji (akceptuj / zmiany / odrzuć) (A1)', whenNot: 'Decyzja prośby (TrialRequestCard)' },

  // Product – E3
  { name: 'SlotGrid', import: 'SlotGrid', group: 'E3 Dostępność', when: 'Siatka terminów z blokadą, strefą czasową (U1, U5)', whenNot: 'Lista sesji (SessionListItem)' },
  { name: 'HoldCountdown', import: 'HoldCountdown', group: 'E3 Dostępność', when: 'Odliczanie blokady z wygaśnięciem (U1)', whenNot: 'Zwykły Timer' },
  { name: 'SessionListItem', import: 'SessionListItem', group: 'E3 Dostępność', when: 'Wiersz sesji ze statusem i akcją (U4, M2)', whenNot: 'Siatka terminów (SlotGrid)' },
  { name: 'NextSessionCard', import: 'NextSessionCard', group: 'E3 Dostępność', when: 'Najbliższa sesja z przyciskiem „Dołącz” (U4, M2)', whenNot: 'Lista sesji (SessionListItem)' },
  { name: 'BookingStatusBadge', import: 'BookingStatusBadge', group: 'E3 Dostępność', when: 'Status sesji (zaplanowana, w trakcie, zakończona, anulowana) (U4, U5)', whenNot: 'Inny status (Badge)' },
  { name: 'PolicyNotice', import: 'PolicyNotice', group: 'E3 Dostępność', when: 'Reguła 12 h pełnym tekstem przy akcji (U5, A04)', whenNot: 'Zwykły Alert' },
  { name: 'TrialRequestCard', import: 'TrialRequestCard', group: 'E3 Dostępność', when: 'Prośba o sesję próbną z akceptuj/odrzuć z powodem (M2)', whenNot: 'Decyzja weryfikacji (DecisionForm)' },
  { name: 'TodayAgenda', import: 'TodayAgenda', group: 'E3 Dostępność', when: 'Agenda dnia mentora z sekcjami (M2)', whenNot: 'Lista sesji (SessionListItem)' },
] as const;