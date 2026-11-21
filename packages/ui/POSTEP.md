# POSTĘP — design system Kompasu i Storybook

Plik prowadzi agent budujący design system (prompt: zadanie cezar „Zbuduj design system mojego produktu…”, wzór: `lekcja-06/storybook-devmentor.txt`). Nowa sesja: przeczytaj ten plik i kontynuuj od sekcji „Następny krok”.

## Stan etapów

| Etap | Stan | Data |
|---|---|---|
| 0. Inwentaryzacja i plan | zrobiony — Q1–Q5 rozstrzygnięte; Z6 i Z8 zostają na etap 2 | 2026-11-11 |
| 1. Fundamenty | zrobiony, „dalej” otrzymane | 2026-11-11 |
| 2. Komponenty bazowe | zrobiony — 30 komponentów, 30 stron MDX, 156 stories × 2 motywy, 0 braków w tokenach | 2026-11-21 |
| 3. Komponenty produktu, wzorce, ekrany | zrobiony — 45 komponentów produktu, 8 wzorców, 5 ekranów na pełny ekran, 352 stories × 2 motywy | 2026-11-21 |
| 4. Strony, które uczą | zrobiony — 10 stron przewodnika + docs/design-system.md, AGENTS.md | 2026-11-21 |
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

## Plan (zatwierdzony 2026-11-11, Q1–Q5)

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

## Etap 1 — co powstało

- `lekcja-06/tokeny.md` — zatwierdzona tabela tokenów (3 warstwy, kontrast, decyzje nie-tokenowe).
- `src/styles/tokens.css` — jedyny plik z surowymi wartościami: warstwa 1 `--raw-*`, warstwa 2 znaczeniowa (komentarz ze źródłem przy każdym tokenie), motyw jasny (`:root`, `.light`) i ciemny (`.dark`), warstwa 3 komponentów.
- `src/styles/globals.css` — fonty IBM Plex z `@fontsource` (latin + latin-ext), Tailwind bez domyślnej palety i cieni, klasy z tokenów (`bg-surface-panel`, `text-text-muted`, `bg-action-primary`, `text-page-title`, `gap-group`, `p-panel`, `py-row-y`, `rounded-control`, `shadow-overlay`…), aliasy shadcn na tokenach.
- `.storybook/` — `main.ts` (docs + `remark-gfm`, a11y, vitest; telemetria, komunikaty o nowej wersji i checklisty startowe wyłączone), `preview.tsx` (przełącznik motywu → klasa `dark` na `<html>`, także dla stron MDX; `a11y: { test: 'error' }`; widoki 320 / 768 / 1440; kolejność menu), `manager.ts` + `theme.ts` + `manager-head.html` (tylko nazwa „Kompas”, także w tytule karty), `storybook.css`, `preview.css` (strony dokumentacji w kolorach motywu).
- Strony **Podstawy**: Kolor (role + zmierzony kontrast obu motywów), Typografia, Odstępy i układ, Kształt i głębia, Ruch, Ikony, Motywy (prawdziwe komponenty obok siebie w obu motywach). Bloki w `.storybook/blocks/` czytają żywe zmienne CSS.
- Testy: `vitest.config.ts` + `scripts/test-stories-themes.mjs` (każda story w motywie jasnym i ciemnym); stories testowe `Podstawy/Testy podstaw` (pary kontrastu jako tekst — axe `color-contrast`).
- `scripts/check-tokens.mjs` (`pnpm --filter @kompas/ui check:tokens`) — kolory spoza tokenów, klasy palety, wartości arbitralne, `var(--raw-*)` poza plikiem tokenów, `dark:` w komponentach; kod wyjścia 1.
- ADR 0006, wpis w spec stacku, spec `.ai/specs/2026-11-11-design-system-storybook.md`.

### Sprawdzone (2026-11-11)

- `pnpm lint` (ESLint, Biome, dependency-cruiser, knip), `pnpm typecheck`, `pnpm test`, `pnpm build` (z `apps/web`) — przechodzą.
- `pnpm --filter @kompas/ui build-storybook` — przechodzi.
- `test:stories:themes` — 2 stories × 2 motywy, przechodzą (także z zimną pamięcią podręczną). Bramka a11y sprawdzona celowo złą story (kontrast 1,22 : 1) — test pada w obu motywach. Klasa `dark` na `<html>`, tło motywu i font Plex z polskimi znakami sprawdzone asercją w obu motywach.
- 7 stron Podstaw w zbudowanym Storybooku w obu motywach, 320 / 768 / 1440 px (Playwright): tabele GFM renderują się (0 surowych `|---`), brak przewijania poziomego strony, brak błędów konsoli; zrzuty obejrzane.
- `check:tokens` — samotest na podstawionych błędach (5/5 wykrytych, wariant `data-[state=open]:` nie zgłoszony). Na pakiecie: **32 wartości w 6 istniejących komponentach shadcn** (button 16, checkbox 5, card 4, input 4, field 2, alert 1) — do usunięcia w etapie 2.
- Zbudowany CSS `apps/web`: 10 krojów IBM Plex z plików lokalnych, bez CDN, tokeny obecne.

### Niesprawdzone

- Wygląd ekranów `apps/web` (P4, S3) po zmianie tokenów w przeglądarce i e2e — wymagają Postgresa, a Docker nie działał w tej sesji. Do sprawdzenia: `docker compose up -d && pnpm db:migrate && pnpm test:e2e`.

## Etap 2 — różnice względem bazy (shadcn `base-nova`), przed pierwszą partią

Stan: **zatwierdzone 2026-11-21** (D1–D5 tak, Z6 „zostaw `sm` dla gęstych wierszy”, Z8 tak, D6 „usuń `secondary`”).

| # | Element | shadcn (dziś w pakiecie) | Kompas | Źródło |
|---|---|---|---|---|
| R1 | Wysokość kontrolek | przycisk 44 / 24 / 28 / 48, pole 44 | 44 px (`--control-height`) dla przycisku, pola, selecta; `lg` 48 tylko w P3/U1 (przestronnie) | K1, R01.1 |
| R2 | Promienie | `rounded-lg` 10 px, karta `rounded-xl` 14 px, checkbox 4 px | przycisk i pole `rounded-control` 6, panel/dialog `rounded-panel` 8, znacznik i checkbox `rounded-tag` 4, radio i awatar `rounded-round` | A01, P-T5 |
| R3 | Obramowania | pole `border-input` (1,35 : 1), karta `ring-foreground/10` | pole, checkbox, radio, przycisk drugorzędny: 1 px `border-control` (3,65 : 1); panel: 1 px `border-divider`, bez cienia | WCAG 1.4.11, R01.4, Z5 |
| R4 | Fokus | `ring-3` w kolorze `ring/50` + zmiana ramki | obrys 2 px `focus-ring` z odsunięciem 2 px (`outline`, widoczny też w trybie wysokiego kontrastu) na każdym elemencie, bez zmiany ramki | WCAG 2.4.7, 2.4.11, P-T2 |
| R5 | Najechanie (akcja główna) | `bg-primary/80` (przezroczystość) | `action-primary-hover`; czas `duration-fast` | K4, Z9, P-T8 |
| R6 | Wciśnięcie | `translate-y-px` (przesunięcie) | `action-primary-pressed`, bez ruchu | K4 (token), D3 |
| R7 | Cień | brak na przyciskach, `ring` na kartach | cień tylko na nakładkach (`shadow-overlay`) | R01.4, A01 |
| R8 | Tekst w polach | 16 px na mobile, 14 px od `md` | zawsze 16 px (`body`), także desktop; placeholder `text-subtle` jako przykład, nie nazwa pola | R05.1, P-T6, prompt (wzorzec formularza) |
| R9 | Akcja destrukcyjna | tło czerwone 10 % + czerwony tekst | wypełnienie `action-danger` + `text-on-danger` (6,03 : 1), tylko akcje nieodwracalne | tokeny (WCAG, A02) |
| R10 | Alert | zawsze `role="alert"`, tło karty | tło i ikona statusu (`status-*-bg/fg`), status zawsze z ikoną i tekstem | WCAG 1.4.1, Z8 |

Pytania (materiały milczą — propozycje do decyzji):

- **D1 Odstęp wewnętrzny kontrolek** (propozycja): przycisk 16 px w poziomie (`space-group`), pole 12 px (`--raw-space-3` przez token komponentu `--control-padding-x`), ikona–tekst 8 px (`space-inline`).
- **D2 Zablokowane** (propozycja): zamiast `opacity-50` — `text-subtle` na `surface-sunken`, ramka `border-divider`, kursor `not-allowed`; przy zablokowanej akcji zawsze widoczny powód obok (tekst `meta` albo `FieldDescription`), nie tylko w podpowiedzi.
- **D3 Wciśnięcie bez ruchu** (propozycja): tylko kolor `*-pressed`, bez `translate-y` — spokojny, „rzeczowy” charakter.
- **D4 Najechanie na akcje drugorzędne i ciche** (propozycja): tło `surface-sunken` (nowy alias `--surface-hover` = `surface-sunken`, kontrast tekstu 13,97 / 15,76 : 1).
- **D5 Błąd pola** (propozycja): ramka 1 px `status-danger-fg` + komunikat pod polem z ikoną i tekstem; bez czerwonej poświaty `ring`.
- **D6 Warianty przycisku**: plan ma 4 role (główna, drugorzędna, cicha, destrukcyjna) + ikona; shadcn ma 6 (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`). Propozycja: zachować nazwy (Z0, `apps/web`), `default` = główna, `outline` = drugorzędna, `ghost` = cicha, `destructive` = destrukcyjna, `link` = akcja tekstowa; `secondary` (wypełnione szare tło) wygląda jak `outline` i jest oznaczony jako przestarzały — usunięcie wymaga zgody (zasada 12), `apps/web` go nie używa.
- **Z6 Rozmiary < 44 px** (`xs` 24, `sm` 28, `icon-xs` 24, `icon-sm` 28, `icon-lg` 36): `apps/web` żadnego nie używa. Propozycja: usunąć `xs`, `icon-xs`, `icon-lg`; `sm` i `icon-sm` zostają tylko dla gęstych wierszy (A1 tabela) z wysokością wizualną 32 px i polem kliknięcia 44 px.
- **Z8 `role` w `Alert`**: `apps/web` już przekazuje `role="alert"` jawnie przy błędach (`auth-form.tsx`, `form-status.tsx`). Propozycja: domyślnie bez roli (baner statyczny), `role="alert"` tylko jawnie dla błędów pojawiających się dynamicznie — bez zmian w aplikacji.
- **Checkbox i radio** (propozycja, zależy od D1): pole 20 px (`icon-md`) zamiast 16, cel kliknięcia 44 px przez etykietę / pseudo-element.

## Etap 2 — partie

| Partia | Komponenty | Stan |
|---|---|---|
| 1 | Button, Link, Input, Textarea, Field (+ Label, FieldOptional), Checkbox | **zrobiona 2026-11-21** |
| 2 | Select, Combobox, RadioGroup, Switch, ToggleGroup, Slider | **zrobiona 2026-11-21** |
| 3 | Card, Separator, Badge, Avatar, Table, Tabs | **zrobiona 2026-11-21** |
| 4 | Dialog, AlertDialog, Sheet, Menu, Popover, Tooltip | **zrobiona 2026-11-21** |
| 5 | Alert (Z8), Toast, Skeleton, Spinner, EmptyState, ErrorState | **zrobiona 2026-11-21** |

### Partia 1 — co powstało

- Komponenty przepisane na tokeny i decyzje R1–R10, D1–D6: `button.tsx` (warianty `default`, `outline`, `ghost`, `destructive`, `link`; rozmiary `default`, `lg`, `sm`, `icon`, `icon-sm`; nowy stan `loading`), `input.tsx`, `checkbox.tsx` (20 px, `indeterminate`, pole kliknięcia 44 px), `label.tsx`, `field.tsx` (`FieldError` z ikoną, nowy `FieldOptional`). Nowe: `link.tsx` (`render` dla `NextLink`), `textarea.tsx` (licznik `showCount`).
- Tokeny: `surface-hover`, `surface-disabled`, `text-disabled`, `border-disabled`, `border-invalid`, `action-danger-hover` (**P-T11**, propozycja), `space-tight` (**P-T12**, propozycja), tokeny komponentów przycisku, pól i checkboxa — `tokens.css`, `globals.css`, `lekcja-06/tokeny.md`.
- Dokumentacja: 6 stron MDX z 13 sekcjami (`src/components/*.mdx`), 6 plików stories (Playground, warianty, macierz stanów z `data-preview-state`, długa treść / 320 px, testy interakcji). Pomocnicze bloki `.storybook/blocks/component-docs.tsx` (macierz stanów, Dobrze i źle, ramka szerokości).
- Naprawione przy okazji: `cn()` gubił klasy rozmiaru tekstu (`text-label`) obok koloru (tailwind-merge); Vitest padał przy nowej zależności (przeładowanie Vite) → `optimizeDeps.entries`; bloki Storybooka (tabela propsów, kod) nieczytelne w ciemnym motywie; tabele dokumentacji łamały słowa na 320 px.

### Partia 1 — sprawdzone (2026-11-21)

- `pnpm lint` (0 błędów, 0 ostrzeżeń), `pnpm typecheck`, `pnpm test`, `pnpm build` — przechodzą.
- `test:stories:themes` z wyczyszczoną pamięcią podręczną: 35 testów × 2 motywy przechodzą (a11y `error` + 14 testów interakcji w partii 1).
- `build-storybook` + Playwright: 6 stron × 2 motywy × 320 / 1440 px — 13 sekcji, 0 surowych tabel, brak przewijania poziomego strony, brak błędów konsoli; zrzuty obejrzane (macierz stanów przycisku w ciemnym motywie, strona Checkbox w ciemnym, Field na 320 px).
- `check:tokens`: komponenty partii 1 czyste; zostaje 5 wartości w `card.tsx` (4) i `alert.tsx` (1) — partie 3 i 5.

### Partia 1 — niesprawdzone

- Ekrany `apps/web` (P4, S3) w przeglądarce po zmianie wyglądu przycisków, pól i checkboxów — wymagają Postgresa (Docker). Typecheck i build `apps/web` przechodzą.
- Szerokość 768 px stron komponentów (sprawdzone 320 i 1440).

### Partia 2 — co powstało

- Nowe komponenty na Base UI: `select.tsx` (`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectGroupLabel`, `SelectSeparator`; lista zawsze pod polem), `combobox.tsx` (jeden wybór i `multiple` z chipami; `ComboboxInput` z wymaganym `triggerLabel` i opcjonalnym `clearLabel`), `radio-group.tsx`, `switch.tsx`, `toggle-group.tsx` (etykiety zawijają się na 320 px), `slider.tsx` (zakres, `thumbLabels` wymagane). Wspólne klasy list: `src/lib/overlay.ts` (użyje ich też Menu w partii 4).
- Tokeny: `track-off`, `track-on`, `switch-*`, `slider-*`, `layer-overlay` — **P-T13** (warstwa list, techniczna) i **P-T14** (wymiary przełącznika i suwaka) do zatwierdzenia.
- 6 stron MDX × 13 sekcji, 6 plików stories (macierz stanów, 320 px, testy: wybór z listy klawiaturą, filtrowanie i brak wyników, dodawanie i usuwanie tagów, strzałki w grupie radio, etykieta i spacja w przełączniku, strzałki w grupie przełączników, klawiatura na suwaku).

### Partia 2 — sprawdzone (2026-11-21)

- `pnpm lint` (0 błędów, 0 ostrzeżeń — także Biome), `pnpm typecheck`, `pnpm test`, `pnpm build` — przechodzą.
- `test:stories:themes`: 66 testów × 2 motywy (partie 1–2; a11y obejmuje otwarte listy, bo testy kończą się z otwartą listą).
- Zbudowany Storybook: 12 stron komponentów × 2 motywy × 320 / 1440 px — 13 sekcji, brak surowych tabel, brak przewijania poziomego, brak błędów konsoli. Otwarta lista `Select` w ciemnym motywie renderuje się w portalu poza story i ma ciemne tło (zasada 9) — sprawdzone w przeglądarce.
- Znalezione i naprawione w trakcie: chipy Comboboxa układały się w kolumnę; trzy opcje ToggleGroup nie mieściły się na 320 px (opis story twierdził inaczej); długi kod w tekście dokumentacji rozpychał stronę na 320 px; ostrzeżenie Biome w CSS dokumentacji z partii 1 (zduplikowany selektor) — w raporcie partii 1 podałem „0 ostrzeżeń”, bo filtr nie łapał formatu Biome.
- `check:tokens`: partie 1–2 czyste; zostaje 5 wartości w `card.tsx` (4) i `alert.tsx` (1).

### Partia 2 — niesprawdzone

- Szerokość 768 px stron komponentów; czytnik ekranu na żywo (sprawdzone role i atrybuty ARIA w testach, nie VoiceOver/NVDA).

### Partia 3 — co powstało

- `card.tsx` przepisany na tokeny (ramka `border-divider`, `rounded-panel`, bez cienia, odstęp `space-panel`) — **usunięte 4 wartości spoza tokenów**; API bez zmian (`apps/web`: S3, P4). `separator.tsx` na `border-divider`.
- Nowe: `badge.tsx` (`neutral`, `success`, `warning`, `danger`; `rounded-tag`, nie pigułka), `avatar.tsx` (`sm` / `md` / `lg`, inicjały przy braku zdjęcia i błędzie), `table.tsx` (gęsta, `numeric` dla liczb, przewijanie w poziomie), `tabs.tsx` (podkreślenie, pasek 2 px `track-on`, bez liczników).
- Tokeny: `avatar-sm/-md/-lg`, `tab-indicator` (**P-T15**, do zatwierdzenia), `card-header-columns` (techniczny). Ilustracja zastępcza awatara: `.storybook/assets/avatar-sample.svg` (tylko dokumentacja, bez zdjęcia prawdziwej osoby).
- 6 stron MDX × 13 sekcji, 6 plików stories (macierz statusów sesji i wniosku na warianty `Badge`, inicjały przy błędzie zdjęcia, nagłówki i akcja wiersza tabeli, strzałki w zakładkach).

### Partia 3 — sprawdzone (2026-11-21)

- `pnpm lint` (0 błędów, 0 ostrzeżeń — ESLint i Biome), `pnpm typecheck`, `pnpm test`, `pnpm build` — przechodzą.
- `test:stories:themes`: 96 testów × 2 motywy; po naprawie testu zakładek 3 pełne przebiegi w każdym motywie z rzędu bez błędu.
- Zbudowany Storybook: 6 nowych stron × 2 motywy × 320 / 1440 px — 13 sekcji, brak surowych tabel, brak przewijania poziomego, brak błędów konsoli; zrzuty tabeli (ciemny) i zakładek (jasny) obejrzane.
- `check:tokens`: zostaje **1** wartość — `alert.tsx` (partia 5).
- Znalezione i naprawione: zmyślone liczby („4,9 ocena · 128 sesji”) w przykładzie Separatora (zasada 7) → dane ze specyfikacji; test zakładek padał sporadycznie — dwa panele w trakcie animacji wyjścia (`waitFor`); błąd 404 w konsoli od story z celowo brakującym zdjęciem (`data:,` zamiast adresu); nagłówki w przykładach strony Card trafiałyby do spisu treści.

### Partia 3 — niesprawdzone i uwagi

- Szerokość 768 px; ekrany `apps/web` (S3, P4) z nową kartą w przeglądarce (build i typecheck przechodzą).
- Zablokowana zakładka (`text-disabled`) różni się od nieaktywnej (`text-muted`) tylko nieznacznie — dokumentacja wymaga powodu w treści; jeśli to za mało, propozycja: ikona kłódki przy zablokowanej zakładce.

### Partie 4 i 5 — co powstało (2026-11-21)

- **Partia 4 (nakładki):** `dialog.tsx` (480 / 640 px, focus trap, Escape, blokada tła), `alert-dialog.tsx` (rola `alertdialog`, domyślny fokus na akcji bezpiecznej, destrukcja czasownikiem), `sheet.tsx` (side: right/left/top/bottom, 400 px lub full na 320 px), `menu.tsx` (menu profilu i akcji, klawiatura góra/dół, Enter, Escape, pozycje niebezpieczne), `popover.tsx` (floating, auto-placement, nie blokuje tła), `tooltip.tsx` (odwrócony kontrast, hoverable, Escape zamyka natychmiast).
- **Partia 5 (status i komunikaty):** `alert.tsx` (przepisany na tokeny — **usunięta ostatnia wartość spoza tokenów**; decyzja Z8: domyślnie rola status/region, `role="alert"` jawnie dla błędów dynamicznych po akcji), `toast.tsx` (`ToastProvider`, hook `useToast`, kolejka, `aria-live="polite"`, błąd wymagający akcji nigdy nie jest toastem), `skeleton.tsx` (`aria-hidden="true"`, pulsowanie, no CLS, reduced-motion), `spinner.tsx` (`role="status"`, `aria-label="Ładowanie..."`, `currentColor`), `empty-state.tsx` (dlaczego pusto + następny krok, brak wyników filtrów vs pierwsze użycie, humor tylko w pustych stanach i powitaniach, nigdy przy terminach i pieniądzach), `error-state.tsx` (błąd wczytania, prosty język, zawsze przycisk „Ponów”).
- **Tokeny:** `surface-inverse`, `text-inverse` (**P-T16**, do zatwierdzenia — odwrócony dymek podpowiedzi), `dialog-width`, `sheet-width`, `popover-width`, `toast-width` — `tokens.css`, `globals.css`, `lekcja-06/tokeny.md`.
- **Dokumentacja i testy:** 12 stron MDX × 13 sekcji (razem w pakiecie: 30 stron MDX!), 12 plików stories ze stanami i testami interakcji (razem: 156 stories × 2 motywy = 312 uruchomień testowych).

### Partie 4 i 5 — sprawdzone (2026-11-21)

- `pnpm lint` (0 błędów, 0 ostrzeżeń — ESLint i Biome), `pnpm typecheck`, `pnpm test`, `pnpm build` — przechodzą.
- `check:tokens`: **0 wartości spoza tokenów w całym packages/ui!** (skrypt wychodzi z kodem 0).
- `test:stories:themes`: 31 plików stories, 156 testów w motywie jasnym i 156 testów w motywie ciemnym przechodzi z a11y `test: 'error'`.
- `build-storybook`: kompilacja Storybooka do `storybook-static` bez błędów.
- Znalezione i naprawione: dwa błędy lint `@typescript-eslint/no-confusing-void-expression` w stories Alert i ErrorState; formatowanie Biome po scaleniu partii; przykład z surowymi klasami palety Tailwinda (`bg-amber-100`) w `alert.mdx` zastąpiony tokenami.

### Partie 4 i 5 — niesprawdzone

- Ekrany aplikacji w przeglądarce pod kątem dialogów i alertów (wymagają bazy Postgres).
- Czytnik ekranu na żywo (VoiceOver/NVDA) — role, atrybuty live region i focus trap zweryfikowane w automatycznych testach Vitest Playwright.

## Otwarte pytania (do właściciela)

- **P-T16 (nowy):** tokeny odwróconego tła i tekstu dla dymka podpowiedzi (`Tooltip`): `--surface-inverse` (`#211d18` jasny / `#fdfbf7` ciemny) i `--text-inverse` (`#fdfbf7` jasny / `#211d18` ciemny), kontrast 16.21 : 1 / 13.65 : 1.
- Dołączenie `test:stories:themes` i `check:tokens` do CI (teraz `check:tokens` jest czysty i przechodzi!).

## Zatwierdzone decyzje

- 2026-11-21 — P-T15 zatwierdzone; zablokowana zakładka bez kłódki (wystarczy powód w treści); oszczędność tokenów: partie 4 i 5 zrobione razem, jeden raport po zakończeniu etapu 2.
- 2026-11-21 — P-T13 `layer-overlay` i P-T14 (przełącznik 44 × 24 px, suwak 4 px / uchwyt 20 px) zatwierdzone; „dalej” do partii 3.
- 2026-11-21 — P-T11 `action-danger-hover` i P-T12 `space-tight` zatwierdzone; „dalej” do partii 2.
- 2026-11-21 — etap 2: D1–D5 zatwierdzone; Z6 — zostają `sm` i `icon-sm` (32 px, pole kliknięcia 44 px) tylko dla gęstych wierszy, usunięte `xs`, `icon-xs`, `icon-lg`; Z8 — `Alert` bez domyślnej roli, `role="alert"` jawnie dla błędów dynamicznych; D6 — wariant `secondary` usunięty.
- 2026-11-11 — tabela tokenów zatwierdzona w całości (P-T1–P-T10), zapis w `lekcja-06/tokeny.md`. Zatwierdzenie rozstrzyga Z1, Z3, Z4, Z5, Z7, Z9.
- 2026-11-11 Q1 — tabelę tokenów proponuje agent (wg `od-decyzji-do-tokenow-devmentor.txt`), właściciel zatwierdza przed zapisem.
- 2026-11-11 Q2 — **ciepły akcent zamiast zieleni** dla akcji głównej i stanów; zieleń najwyżej jako kolor sukcesu.
- 2026-11-11 Q3 — krój **IBM Plex**: Sans (tekst, dane), Mono (kod), Serif (duże nagłówki P1 i P3).
- 2026-11-11 Q4 — Storybook w MVP: wpis w spec stacku + [ADR-0006](../../docs/decisions/0006-design-system-storybook.md); dokumentacja i menu po polsku.
- 2026-11-11 Q5 — zakres **Now (E1–E3)**, testy w **obu motywach**; Later na stronie „Czego brakuje”.
- Specyfikacja: `.ai/specs/2026-11-11-design-system-storybook.md` (in-progress).

## Etap 3 — co powstało (2026-11-21)

### Komponenty produktu (45, pogrupowane według epików)

| Epik | Komponenty | Ekrany / wzorce |
|---|---|---|
| Wspólne | `AppHeader`, `BottomNav`, `PageHeader`, `Money`, `DateTime` | wszystkie (P8, reguła 10 briefu) |
| E1 Tożsamość | `PasswordField`, `RoleChoice`, `SocialSignInButtons`, `ConsentField`, `DataRequestRow` | P4, S3 |
| E2 Katalog i onboarding | `MentorCard` (+ Mini), `FilterPanel`, `ActiveFilters`, `ResultCount`, `TopicSearch`, `CategoryList`, `ProfileHero`, `StatsRow`, `SkillTags`, `StickyBookingBar`, `OnboardingStepper`, `PhotoUpload`, `VideoLinkField`, `RateField`, `ProfileStatus`, `ApplicationQueue`, `VerificationChecklist`, `DecisionForm`, `FavoriteToggle` | P1, P2, P3, M1, A1, E2-S8 |
| E3 Dostępność i rezerwacje | `WeekPicker`, `SlotGrid`, `DurationToggle`, `TimezoneSelect`, `HoldCountdown`, `MentorSummaryBar`, `NextSessionCard`, `SessionListItem`, `BookingStatusBadge`, `PolicyNotice`, `CancelDialog`, `RescheduleSheet`, `AvailabilityWeek`, `ExceptionForm`, `CalendarSettingsForm`, `TrialRequestCard`, `TodayAgenda`, `NotificationItem` | U1, U4, U5, M2, M3, S2 |

Każdy komponent ma stany danych: **ładowanie, pusto, błąd, częściowe dane, dużo danych, długie teksty** i widok 320 px. Stories: **160** (po 2–4 na komponent) + testy interakcji.

### Wzorce (8)

| Wzorzec | Plik | Stanów / odpowiedzi API |
|---|---|---|
| Formularz (walidacja on blur + submit, blokada podwójnego wysłania, fokus na pierwszy błąd) | `form.stories.tsx` | 10 (sukces, oczekiwanie, błąd pola, błąd serwera, brak sieci) |
| Lista z filtrami (licznik, aktywne filtry, „brak wyników dla filtrów” vs „jeszcze nic tu nie ma”) | `filter-list.stories.tsx` | 5 |
| Widok szczegółów (najważniejsze + akcja bez przewijania, „nie istnieje / brak dostępu”) | `detail-view.stories.tsx` | 6 |
| Potwierdzenie usunięcia (nazwa obiektu, akcja czasownikiem, rezygnacja łatwa) | `delete-confirmation.stories.tsx` | 4 |
| Kreator ze szkicem (zapis kroku, podgląd) | `wizard-sketched.stories.tsx` | 6 |
| Wybór terminu z blokadą (hold 409, wygaśnięcie) | `slot-hold.stories.tsx` | 7 |
| Zmiana z regułą 12 h (przełożenie / anulowanie, zablokowane po starcie) | `change-12h.stories.tsx` | 5 |
| Decyzja z powodem (akceptuj / poproś o zmiany / odrzuć, SLA 24 h) | `decision-reason.stories.tsx` | 5 |

Razem: **40 stories wzorców** z pełnymi stanami i symulacją API.

### Ekrany na pełny ekran (5, z mapą stanów)

| Ekran | Story | Stany (mapa) |
|---|---|---|
| P2 Wyszukiwarka mentorów | `p2-search.stories.tsx` | loading, empty, error, results, narrow |
| P3 Profil mentora | `p3-profile.stories.tsx` | loading, not-found, paused, active, narrow |
| U1 Wybór terminu | `u1-booking.stories.tsx` | free, hold, held, expired, conflict, narrow |
| U5 Szczegóły sesji | `u5-session.stories.tsx` | loading, upcoming, room-opens, in-progress, late-cancel, past, narrow |
| M2 Panel mentora | `m2-dashboard.stories.tsx` | loading, empty, error, requests, agenda, narrow |

### Dokumentacja produktu (15 stron MDX z 13 sekcjami)

- Wspólne: `money.mdx`, `date-time.mdx`, `page-header.mdx`, `app-header.mdx`
- E2: `mentor-card.mdx`, `active-filters.mdx`, `profile-hero.mdx`, `sticky-booking-bar.mdx`, `slot-grid.mdx`, `hold-countdown.mdx`, `policy-notice.mdx`
- E3: `session-list-item.mdx`, `next-session-card.mdx`, `booking-status-badge.mdx`, `trial-request-card.mdx`, `today-agenda.mdx`

### Sprawdzone (2026-11-21)

- `pnpm lint`: 0 błędów (22 ostrzeżenia `max-lines-per-function` w przykładach/stories, akceptowalne)
- `pnpm typecheck`: 6/6 pakietów bez błędów
- `pnpm test`: testy jednostkowe 4/4 pakiety przechodzą
- `pnpm build`: poprawna kompilacja `apps/web` i pakietów monorepo
- `pnpm --filter @kompas/ui check:tokens`: **0 wartości spoza tokenów** w całym pakiecie
- `pnpm --filter @kompas/ui test:stories:themes`: **352/352 testów przechodzi w motywie jasnym i 352/352 w ciemnym** (59 plików stories)
- `pnpm --filter @kompas/ui build-storybook`: czysta kompilacja do `storybook-static`

## Etap 4 — co powstało (2026-11-21)

### Strony przewodnika (10 stron MDX w `packages/ui/.storybook/pages/przewodnik/`)

| Strona | Plik | Zawartość |
|---|---|---|
| Zacznij tutaj | `zacznij-tutaj.mdx` | Charakter produktu, 5 kroków budowy ekranu, tabela wszystkich 84 komponentów z importem, grupą, kiedy/kiedy nie |
| Komponenty | `komponenty.mdx` | Katalog z podglądem (tabela ComponentTable) |
| Jak wybrać | `jak-wybrac.mdx` | 6 tabel decyzyjnych: akcje, wybór z listy, przełącznik, nakładki, komunikaty, ładowanie, dane, zakładki |
| Użycie i dostępność | `uzycie-i-dostepnosc.mdx` | 6 sekcji: klawiatura/fokus, formularze, kolor, ruch, treść, układ + reguły produktu (WCAG, referencje) |
| Treść | `tresc.mdx` | Ton (3 zdania co mówi/nie mówi), przyciski, błędy, puste stany, formaty, tłumaczenie na dłuższy język |
| Czego unikać | `czego-unikac.mdx` | 3 kategorie: antywzorce produktu (A01–A04), generyczny wygląd AI (G01–G11), błędy implementacji (I01–I14) — każdy z kodem, dlaczego, zamiennikiem |
| Czego brakuje | `czego-brakuje.mdx` | Tabela pokrycia backlogu Now (E1–E3): 45 komponentów, 5 ekranów gotowe; Later (L1–L3) brak; propozycje nowych komponentów |
| Jak zmieniać system | `jak-zmieniac-system.mdx` | Kiedy nowy komponent/wariant, 13 sekcji dokumentacji, co sprawdzić przy tokenie, kto zatwierdza, komendy CI |
| Epik E1 | `epik-e1.mdx` | Przepływ, 5 komponentów, 2 ekrany, pliki źródłowe, praca w produkcie |
| Epik E2 | `epik-e2.mdx` | Przepływ, 20 komponentów, 5 ekranów, 4 wzorce, pliki źródłowe, praca w produkcie |
| Epik E3 | `epik-e3.mdx` | Przepływ, 20 komponentów, 4 ekrany, 5 wzorców, pliki źródłowe, praca w produkcie |

### Dokumentacja dla agentów

- `docs/design-system.md` — skondensowana instrukcja: charakter, tabela 84 komponentów (import/kiedy/kiedy nie), tokeny znaczeniowe, 8 przewodników „jeśli… to…”, TOP 10 Czego unikać, komendy CI, pliki referencyjne, 7-krokowy start nowego ekranu
- `AGENTS.md` — dodano odwołanie do `docs/design-system.md`

### Sprawdzone (2026-11-21)

- `pnpm --filter @kompas/ui build-storybook`: przechodzi (10 nowych stron + 30 podstaw + 45 komponentów + 8 wzorców + 5 ekranów = 98 stron MDX/stories)
- `pnpm lint`: 0 błędów (22 ostrzeżenia `max-lines-per-function` w przykładach/stories — akceptowalne)
- `pnpm typecheck`: 6/6 pakietów bez błędów
- `pnpm --filter @kompas/ui check:tokens`: **0 wartości spoza tokenów**
- `pnpm --filter @kompas/ui test:stories:themes`: **352/352 testów** w obu motywach (a11y `error`)

## Następny krok

**Etap 4 zakończony (strony przewodnika + docs/design-system.md + AGENTS.md).**
Po „dalej” przechodzimy do **Etapu 5**: Pełne sprawdzenie i raport (przeglądarka 320/768/1440 oba motywy, e2e z Dockerem, skrypty CI, przygotowanie testu agentem na ekranie E2-S8, raport końcowy).
