# POSTĘP — design system Kompasu i Storybook

Plik prowadzi agent budujący design system (prompt: zadanie cezar „Zbuduj design system mojego produktu…”, wzór: `lekcja-06/storybook-devmentor.txt`). Nowa sesja: przeczytaj ten plik i kontynuuj od sekcji „Następny krok”.

## Stan etapów

| Etap | Stan | Data |
|---|---|---|
| 0. Inwentaryzacja i plan | zrobiony — Q1–Q5 rozstrzygnięte; Z6 i Z8 zostają na etap 2 | 2026-11-11 |
| 1. Fundamenty | w toku — **tabela tokenów czeka na zatwierdzenie** (nic nie zapisano w kodzie) | 2026-11-11 |
| 2. Komponenty bazowe | nie zaczęty | — |
| 3. Komponenty produktu, wzorce, ekrany | nie zaczęty | — |
| 4. Strony, które uczą | nie zaczęty | — |
| 5. Sprawdzenie i raport | nie zaczęty | — |

## Materiały (ustalone przez agenta — w prompcie były puste pola `{{…}}`)

| Pole promptu | Wartość | Uwagi |
|---|---|---|
| Produkt i użytkownicy | Kompas: marketplace mentoringu 1:1 online (IT, kariera, biznes, design) — gość szuka i porównuje mentorów, uczeń rezerwuje sesję próbną i plan, mentor prowadzi dostępność, sesje i notatki, zespół zaufania weryfikuje mentorów | z `.ai/specs/product-brief.md` §1–2 |
| Brief i badania | `.ai/specs/product-brief.md`, `kompas-mentoring/KONCEPCJA.md` | wywiadów brak (brief, referencje) |
| Backlog i specyfikacje | `.ai/specs/backlog.md`, `.ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md`, `.ai/specs/2026-11-10-f1-tozsamosc.md`, mockupy `kompas-mentoring/mockupy/` | |
| Referencje | `lekcja-06/referencje.md` (R01–R06, A01–A04, K1–K6) | |
| Tokeny | brak `lekcja-06/tokeny.md` — agent proponuje tabelę w etapie 1, po zatwierdzeniu zapis do `lekcja-06/tokeny.md` (Q1) | punkt wyjścia: `packages/ui/src/styles/globals.css` |
| Audyt z ćwiczenia 1 | brak (`lekcja-06/audyt.md` nie istnieje) | |
| Baza komponentów | shadcn/ui w wariancie Base UI (`@base-ui/react` 1.9.0, styl `base-nova`) | już wybrane w spec stacku §2.1 i F1 |
| Design system | `packages/ui` (`@kompas/ui`) | istnieje |
| Storybook | `packages/ui/.storybook` | nie istnieje |
| Język UI / dokumentacji | polski / polski (kod i identyfikatory po angielsku) | `AGENTS.md` → „Język”; potwierdzone (Q4) |

## Inwentaryzacja repozytorium

- Monorepo pnpm 11.28.6 (corepack) + Turborepo 2.11, Node ≥ 24 (lokalnie 25.4). Aplikacja: Next.js 16.4, React 19.3, next-intl (teksty w `apps/web/messages/pl.json`).
- `packages/ui`: Tailwind CSS 4.3.3 (CSS-first, `@theme inline`), shadcn `base-nova`, lucide-react 1.70, cva, tailwind-merge. Komponenty: Alert, Button, Card, Checkbox, Field (+ podkomponenty), Input, Label, Separator; `cn()`. Brak testów, brak Storybooka, brak fontów w projekcie (fonty systemowe).
- Tokeny: `globals.css` — zmienne shadcn (`--primary`, `--muted`…) + własne `--signal`, `--success`, `--warning`; motyw jasny i `.dark` (aplikacja nigdzie nie przełącza motywu). Wartości z mockupu: zieleń `#13463d`, bursztyn `#e07b2f`, papier `#f6f3ec`, szeryf w h1–h3.
- Użycie w aplikacji: P4 logowanie/rejestracja, S3 konto, nagłówek, strona główna szkieletu (13 importów z `@kompas/ui`).
- Narzędzia: Biome + ESLint (boundaries) + knip + dependency-cruiser; Vitest 5.0.5, Vite 8.3.4 w lockfile; Playwright 1.64.1 + axe w e2e aplikacji. `minimumReleaseAge` 3 dni w `pnpm-workspace.yaml`.
- **Konflikt z decyzją:** spec stacku, tabela narzędzi (wiersz „Storybook”): „Nie w MVP (koszt utrzymania > zysk przy małym zespole)”. Wymaga wpisu w „Decyzje i zmiany” spec stacku (i ADR) — pytanie Q4.

## Decyzje z materiałów (skrót)

1. Charakter: czytelny, gęsty, ciepły, uporządkowany, rzeczowy. Antycharakter: generyczny, efekciarski, hałaśliwy, bezbarwny, natarczywy.
2. Gęsto w listach i tabelach, przestronnie w rezerwacji i pokoju sesji; cele dotyku ≥ 44 px (R01.1, K1).
3. Wiersze dzielone cienkimi liniami, nie karty z cieniem (R01.4); gęste tabele liczb w kolumnach (R03.3).
4. Jedna wyróżniona akcja główna na ekranie, reszta drugorzędna / linki (R01.6, R05.3, P2).
5. Kolor: ciepłe, złamane tło i ciepłe szarości, tekst w kolorze atramentu; jeden nasycony ciepły akcent tylko dla akcji głównej i stanów (R03.1, R04.1, R04.2, R06.2, K4); nie fiolet (A01).
6. Typografia: jedna rodzina bezszeryfowa z wersją o stałej szerokości (tekst, dane, kod); cyfry tabelaryczne dla godzin i kwot; mono tylko dla kodu; szeryf tylko w dużych nagłówkach P1 i P3 (R01.2, R01.3, R05.1, K6).
7. Ton: bezpośredni, ludzki, prosty język, błąd mówi co poprawić; humor tylko w pustych stanach i powitaniach, nigdy przy pieniądzach, terminach i sporach (R05.2, R06.1, K5).
8. Powiadomienia tylko o tym, co wymaga działania lub zmienia termin; bez liczników wszędzie; bez emoji, ikony tylko funkcyjne (R02.4, R02.5, P6, P7). Nawigacja: 5 stałych pozycji (R02.6, P8). Rozmowa w centrum tylko w S1 i U6 (K2).
9. Antyreferencje: A01 generyczny wygląd AI (gradienty, szkło, iskierki, hero + 3 karty, duże zaokrąglenia i cienie wszędzie, zmyślone loga/opinie); A02 sztuczna presja (wyjątek: odliczanie blokady); A03 gamifikacja; A04 drobny druk (zasady 12 h pełnym tekstem przy akcji).
10. Rozstrzygnięte konflikty K1–K6 jak wyżej (gęstość, rozmowa, postęp bez gamifikacji, ilość koloru, ton, szeryf).

## Plan (propozycja do zatwierdzenia)

### Technika

- Pakiet: `packages/ui` (bez nowego pakietu). Storybook w `packages/ui/.storybook`; stories obok komponentów (`*.stories.tsx`), strona dokumentacji komponentu jako `*.mdx` obok; strony przewodnika w `packages/ui/.storybook/pages/`, bloki pomocnicze (próbka koloru, tabela kontrastu) w `packages/ui/.storybook/blocks/` — bez eksportu z pakietu.
- Storybook **10.6.x** z `@storybook/react-vite` (pakiet to biblioteka React; Next nie jest potrzebny), Vite 8.3.4 i `@tailwindcss/vite` 4.3.3 (te same wersje co w repo).
- Dodatki: `@storybook/addon-docs` (MDX, autodocs; `remark-gfm` dla tabel), `@storybook/addon-a11y` (`a11y: { test: 'error' }`), `@storybook/addon-vitest` + `@vitest/browser-playwright` + Vitest 5.0.5 (stories jako testy, play functions z `storybook/test`). Testy interakcji są wbudowane w Storybook 10 — bez osobnego dodatku.
- Motyw: własny przełącznik w pasku narzędzi (global `theme`), dekorator ustawia klasę `dark` / `data-theme` na `document.documentElement` (zasada 9). Testy w obu motywach: zmienna środowiskowa `STORYBOOK_THEME` czytana w `preview`, skrypt uruchamia Vitest dwa razy.
- Symulowanie API (propozycja): **bez MSW**. Komponenty `@kompas/ui` nie wołają API (reguły modułów: UI nie zna kontraktów); wzorzec formularza dostaje funkcję `onSubmit` zwracającą Promise, a stories podstawiają odpowiedzi: sukces, oczekiwanie, błąd pola, błąd serwera, brak sieci. Mniej zależności i to samo pokrycie stanów.
- Fonty z pakietu (`@fontsource*`, bez CDN) — konkretna rodzina po Q3.
- Branding Storybooka: `manager.ts` z motywem „Kompas” (bez logo Storybooka), wyłączone `onboarding`/checklista, powiadomienia o nowej wersji i telemetria (`core.disableWhatsNewNotifications`, `disableTelemetry`, `checklist: false` / brak addon-onboarding). Pochodzenie bazy (shadcn/Base UI) w notatce technicznej „Jak zmieniać system”.
- Skrypty w `packages/ui/package.json`: `storybook` (dev, port 6006), `build-storybook`, `test:stories` (Vitest, projekt storybook), `test:stories:themes` (jasny + ciemny), `check:tokens` (skrypt Node: hex/rgb/hsl/oklch poza plikiem tokenów, klasy palety Tailwinda, wartości arbitralne `[...]`; kod wyjścia ≠ 0). Alias w głównym `package.json`: `storybook`, `build-storybook`. Wpisy w `knip.json`, `tsconfig` (include `.storybook`), ewentualnie `turbo.json`.
- Nowe zależności (tylko `devDependencies` `@kompas/ui`, z wyjątkiem fontów): storybook, @storybook/react-vite, @storybook/addon-docs, @storybook/addon-a11y, @storybook/addon-vitest, vitest, @vitest/browser-playwright, playwright, vite, @tailwindcss/vite, react-dom, remark-gfm; fonty (`dependencies`). Nic więcej bez zgody.

### Komponenty bazowe (Primitives) — z ekranów Now (E1–E3)

| Komponent | Stan | Ekrany, które go potrzebują |
|---|---|---|
| Button (akcja główna, drugorzędna, cicha, destrukcyjna; ikona) | jest | wszystkie; „Zarezerwuj sesję próbną” P3, „Dołącz” U4/M2 |
| Link / akcja tekstowa | nowy | P4 „Nie pamiętasz hasła?”, P1 „Zostań mentorem”, S2 głębokie linki |
| Input | jest | P4, S3, M1, P1 |
| Textarea (z licznikiem znaków) | nowy | M1 opis 300–2000, M2 powód „inne” 10–300, A1 komentarz |
| Select | nowy | U1 strefa czasowa, P2 sortowanie, M3 wyprzedzenie i bufor, S3 strefa |
| Combobox (pole z wyszukiwaniem) | nowy | P1 autocomplete tematów, M1 tagi, P2 filtr tematu |
| Checkbox | jest | P4 zgody, P2 „tylko zweryfikowani”, A1 checklista |
| RadioGroup | nowy | P4 „uczyć się / mentorować”, M2 powód odrzucenia, A1 decyzja |
| Switch | nowy | M3 wstrzymanie przyjmowania, S3 preferencje powiadomień |
| ToggleGroup (przełącznik segmentowy) | nowy | U1 długość 30/60 min, U4 widok |
| Slider (zakres) | nowy | P2 cena 0–1000 zł |
| Label + Field (etykieta, podpowiedź, błąd, wymagane/opcjonalne) | jest (do rozszerzenia) | wszystkie formularze |
| Card / Panel | jest | P3 sekcje, M2 sekcje, S3 |
| Separator | jest | listy, P4 |
| Badge (znacznik statusu) | nowy | U4/U5 status sesji, M1/A1 status wniosku, P3 „Nowy mentor” |
| Avatar | nowy | P2/P3 mentor, M2 uczeń w prośbie, nagłówek |
| Alert / Banner | jest | M3 „Uczniowie nie mogą cię zarezerwować”, U5 zasada 12 h, S3 |
| Dialog | nowy | A1 decyzja, M3 wyjątek |
| AlertDialog (potwierdzenie) | nowy | U5 anulowanie < 12 h, S3 usunięcie konta, E2-S8 usuń z ulubionych |
| Sheet (panel boczny / dolny) | nowy | P2 filtry na mobile, U5 przełożenie |
| Menu | nowy | nagłówek: menu awatara (Konto, Zmień rolę, Wyloguj), akcje wiersza A1 |
| Popover | nowy | U1 wybór tygodnia, P2 filtr pory dnia (desktop) |
| Tooltip | nowy | przyciski z samą ikoną (M3, U1 nawigacja tygodnia) |
| Tabs | nowy | U4 Nadchodzące/Minione, P4 Logowanie/Rejestracja |
| Table | nowy | A1 kolejka, (M5 później) |
| Skeleton | nowy | stan L każdego ekranu |
| Spinner (wskaźnik ładowania) | nowy | P4 przycisk wysyłania, M1 zapis kroku |
| EmptyState | nowy | stan E każdego ekranu |
| ErrorState (z „Ponów”) | nowy | stan Er każdego ekranu |
| Toast | nowy | U1 409 „Ten termin został właśnie zajęty”, U5 po akcji, M3 „Zapisano” |

Razem 30 (8 istniejących, 22 nowe). Toast z Base UI (bez `sonner`).

### Komponenty produktu (Product) — według epików

| Epik | Komponent | Ekran |
|---|---|---|
| wspólne | AppHeader, BottomNav (5 pozycji wg roli), PageHeader | wszystkie (KONCEPCJA §3.2, P8) |
| wspólne | DateTime / Money (format w strefie i walucie użytkownika, cyfry tabelaryczne) | U1, U4, U5, M2, P2 (reguła 10 briefu, R01.3) |
| E1 Tożsamość | PasswordField (pokaż/ukryj, miernik siły), RoleChoice, SocialSignInButtons | P4 |
| E1 | ConsentField, DataRequestRow | P4, S3 |
| E2 Katalog i onboarding | MentorCard (wiersz listy), MentorCardMini | P2, P1, E2-S8 |
| E2 | FilterPanel, ActiveFilters, ResultCount | P2 |
| E2 | TopicSearch, CategoryList | P1 |
| E2 | ProfileHero, StatsRow, SkillTags, StickyBookingBar | P3 |
| E2 | OnboardingStepper, PhotoUpload, VideoLinkField, RateField (+ podgląd zarobku — zależy od Q-B4), ProfileStatus | M1 |
| E2 | ApplicationQueue (wiersz kolejki z wiekiem i SLA), VerificationChecklist, DecisionForm | A1 |
| E2 | FavoriteToggle | P2, P3, E2-S8 |
| E3 Dostępność i rezerwacje | WeekPicker, SlotGrid, DurationToggle, TimezoneSelect, HoldCountdown, MentorSummaryBar | U1, U5 (przełożenie) |
| E3 | NextSessionCard, SessionListItem, BookingStatusBadge | U4, M2 |
| E3 | PolicyNotice (reguła 12 h pełnym tekstem, A04), CancelDialog, RescheduleSheet | U5 |
| E3 | AvailabilityWeek (edytor szablonu), ExceptionForm, CalendarSettingsForm | M3, M1 krok 5 |
| E3 | TrialRequestCard (akceptuj / odrzuć z powodem, SLA 24 h), TodayAgenda | M2 |
| E3 | NotificationItem | S2 |

Razem ok. 45. Każdy ze stanami danych: ładowanie, pusto, błąd, częściowe dane, dużo danych, długie teksty.

### Wzorce (Patterns)

| Wzorzec | Gdzie w produkcie |
|---|---|
| Formularz (walidacja on blur + submit, fokus na pierwszy błąd, blokada podwójnego wysłania, odpowiedzi API) | P4, S3, M1 |
| Lista z filtrami (licznik, aktywne filtry, „brak wyników dla filtrów” vs „jeszcze nic tu nie ma”) | P2, U4, A1 |
| Widok szczegółów (najważniejsze + akcja bez przewijania, „nie istnieje albo brak dostępu”) | P3, U5, A1 |
| Potwierdzenie usunięcia | S3 usunięcie konta, M3 wyjątek, E2-S8 |
| Kreator wielokrokowy z zapisem szkicu | M1 (E2-S2, E2-S3) |
| Wybór terminu z blokadą (hold, 409, wygaśnięcie) | U1 (E3-S4) |
| Zmiana z regułą 12 h (przełożenie / anulowanie, zablokowane po starcie) | U5 (E3-S6) |
| Decyzja z powodem (akceptuj / poproś o zmiany / odrzuć) | A1 (E2-S4), M2 (E3-S7) |

### Ekrany jako stories na pełny ekran (z mapą stanów)

- E1: P4 Logowanie i rejestracja, S3 Konto.
- E2: P1 Strona główna, P2 Wyszukiwarka, P3 Profil mentora, M1 Onboarding (krok 1–6), A1 Weryfikacja.
- E3: U1 Wybór terminu, U4 Moje sesje, U5 Szczegóły sesji, M2 Panel mentora, M3 Kalendarz, S2 Powiadomienia.
- **Zostawiony na test agentem (etap 5):** E2-S8 „Ulubieni mentorzy” — bez story, opis w tym pliku w etapie 5.
- Later (L1–L3: U2, U3, U6–U9, S1, M4, M5, A2) — tylko na stronie „Czego brakuje”.

### Drzewo menu Storybooka

```
System projektowy
  Zacznij tutaj · Komponenty · Jak wybrać · Użycie i dostępność · Treść
  Czego unikać · Czego brakuje · Jak zmieniać system
  Epik E1 Tożsamość · Epik E2 Katalog i onboarding · Epik E3 Dostępność i rezerwacje
Podstawy
  Kolor · Typografia · Odstępy i układ · Kształt i głębia · Ruch · Ikony · Motywy
Komponenty bazowe
  Akcje (Button, Link, ToggleGroup) · Formularze (Field, Input, Textarea, Select, Combobox,
  Checkbox, RadioGroup, Switch, Slider) · Treść (Card, Separator, Badge, Avatar, Table, Tabs)
  · Nakładki (Dialog, AlertDialog, Sheet, Menu, Popover, Tooltip) · Komunikaty (Alert, Toast,
  Skeleton, Spinner, EmptyState, ErrorState)
Produkt
  Wspólne · E1 Tożsamość · E2 Katalog i onboarding · E3 Dostępność i rezerwacje
  (w każdym epiku podgrupa „Ekrany”)
Wzorce
  Formularz · Lista z filtrami · Widok szczegółów · Potwierdzenie usunięcia
  · Kreator ze szkicem · Wybór terminu z blokadą · Zmiana z regułą 12 h · Decyzja z powodem
```

Szacunek: ok. 30 stron przewodnika i podstaw + 75 stron komponentów; ok. 220 stories bazowych (30 × ~7), ok. 250 produktu (45 × ~6), ok. 50 wzorców, ok. 60 ekranów — **razem ok. 580 stories**, w tym ok. 120 z play function.

### Istniejący design system — propozycje zmian (do decyzji, nic nie zmieniono)

| # | Co | Propozycja | Uzasadnienie |
|---|---|---|---|
| Z0 | Nazwy eksportów i propsów (`Button`, `Field*`, `Card*`…) | **zostaw** | używa ich `apps/web` (13 importów); `BACKWARD_COMPATIBILITY.md` |
| Z0 | shadcn `base-nova`, Base UI, `cn()`, lucide | **zostaw** | decyzja spec stacku §2.1 |
| Z1 | `globals.css` — jedna warstwa nazw shadcn | **zmień**: trzy warstwy (surowe → znaczeniowe → komponentów), nazwy shadcn zostają jako aliasy na tokeny znaczeniowe | zasada 3 warstw z promptu; aplikacja działa bez zmian |
| Z2 | Akcja główna = ciemna zieleń `#13463d`, bursztyn `--signal` tylko do wyróżnień | **do decyzji (Q2)** | K4/R06.2: jeden nasycony **ciepły** akcent dla akcji głównej i stanów; zieleń nie jest ciepła |
| Z3 | Szeryf we wszystkich h1–h3 (`@layer base`) | **zmień**: szeryf tylko w dużych nagłówkach P1 i P3 (klasa/rola typograficzna), reszta bezszeryfowa | K6 |
| Z4 | Fonty systemowe (`system-ui`, `ui-monospace`, Iowan/Palatino) | **zmień**: jedna rodzina z wersją mono dołączona do projektu | Luki/K6, zasada „fonty bez CDN”; Q3 |
| Z5 | Kontrast: obramowanie pola `--input` na karcie 1,35 : 1 (jasny) i 1,55 : 1 (ciemny); `--warning` na `--warning-soft` 4,46 : 1; biały na `--signal` 2,98 : 1 | **zmień**: ciemniejsza ramka pól (≥ 3 : 1), ciemniejszy `--warning`; `--signal` nie jako tło z białym tekstem | WCAG 1.4.11 i 1.4.3 |
| Z6 | Button `xs` (24 px), `sm` (28 px), `icon-xs/sm/lg` (24–36 px) | **do decyzji w etapie 2**: usuń albo zostaw tylko dla tabel admina | K1: cele dotyku ≥ 44 px |
| Z7 | Promienie: `--radius` 10 px, karta `rounded-xl` (14 px), mockup 14 px | **zmień w etapie 1/2**: mniejsze promienie wg tokenów | A01 („duże zaokrąglenia na każdym elemencie”); wartość do tokenów |
| Z8 | `Alert` zawsze `role="alert"` | **zmień**: `role="alert"` tylko dla błędów pojawiających się dynamicznie, baner statyczny bez roli live / `role="status"` | WAI-ARIA (alert przerywa czytnik) |
| Z9 | Klasy przezroczystości (`ring-foreground/10`, `bg-muted/50`, `ring-ring/50`) i `color-mix(...)` w `button.tsx` | **zmień**: tokeny stanów (hover, focus) zamiast mieszania w komponentach | zasada 3 (każda wartość z tokenu) |
| — | Usunąć | **nic** | — |

## Otwarte pytania (do właściciela)

- Zatwierdzenie tabeli tokenów (etap 1, krok 2) — przedstawiona w rozmowie 2026-11-11; propozycje oznaczone „P-T…”.
- Z6 (rozmiary przycisków < 44 px) i Z8 (`role` w `Alert`) — decyzja przy etapie 2.

## Zatwierdzone decyzje

- 2026-11-11 Q1 — tabelę tokenów proponuje agent (wg `od-decyzji-do-tokenow-devmentor.txt`), właściciel zatwierdza przed zapisem.
- 2026-11-11 Q2 — **ciepły akcent zamiast zieleni** dla akcji głównej i stanów; zieleń najwyżej jako kolor sukcesu.
- 2026-11-11 Q3 — krój **IBM Plex**: Sans (tekst, dane), Mono (kod), Serif (duże nagłówki P1 i P3).
- 2026-11-11 Q4 — Storybook w MVP: wpis w spec stacku + [ADR-0006](../../docs/decisions/0006-design-system-storybook.md); dokumentacja i menu po polsku.
- 2026-11-11 Q5 — zakres **Now (E1–E3)**, testy w **obu motywach**; Later na stronie „Czego brakuje”.
- Specyfikacja: `.ai/specs/2026-11-11-design-system-storybook.md` (in-progress).

## Następny krok

Po zatwierdzeniu tabeli tokenów: zapis do `lekcja-06/tokeny.md`, potem etap 1 — instalacja Storybooka i dodatków, `src/styles/tokens.css` (3 warstwy, oba motywy, aliasy shadcn), fonty IBM Plex z `@fontsource`, przełącznik motywu, strony Podstaw, `check:tokens`, testy stories w obu motywach.
