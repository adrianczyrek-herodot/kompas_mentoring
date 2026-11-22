# POSTĘP — prototyp kompas-flow

Specyfikacja: [`.ai/specs/implemented/2026-11-21-prototyp-kompas-flow.md`](../../.ai/specs/implemented/2026-11-21-prototyp-kompas-flow.md). Pierwsza wersja (bez design systemu, 156 błędów TS) — przegląd w [`.ai/runs/2026-11-21-przeglad-prototypu-kompas-flow.md`](../../.ai/runs/2026-11-21-przeglad-prototypu-kompas-flow.md); jej kod i stary plan są w historii gita (commit `ea4e3f4`).

| Etap | Stan |
|---|---|
| 0 — plan (wersja 2, na `@kompas/ui`) | zaakceptowany 2026-11-21 |
| 1 — szkielet i ścieżka F1 | zrobiony 2026-11-21 |
| 2 — stany, role, scenariusze | zrobiony 2026-11-21/22 (przebudowa), wszystkie 23 ekrany, CI zielone |
| 3 — uczciwość i sprawdzenie | zrobiony 2026-11-22 |

## Etap 1 — szkielet i ścieżka F1 (2026-11-21)

### Uruchomienie

```bash
pnpm install
pnpm --filter @kompas/prototype-kompas-flow dev      # http://localhost:5173
pnpm --filter @kompas/prototype-kompas-flow build    # dist/
# podgląd w Storybooku: pnpm --filter @kompas/ui build-storybook, potem
pnpm --filter @kompas/prototype-kompas-flow build:storybook   # → storybook-static/prototypes/kompas-flow/index.html
```

### Co powstało

- Stack jak w DS: React 19.3.1, TS 6, Vite 8, Tailwind 4 przez `@kompas/ui/styles.css`. Bez `@vitejs/plugin-react` (JSX kompiluje oxc w Vite 8; brak Fast Refresh — przy prototypie bez znaczenia).
- Router na hashu (`src/lib/router.ts`) z mapą ekranów (`src/screens/registry.ts`, ID i trasy z KONCEPCJA §3.1 — U3 = `/rezerwacja/:bookingId/potwierdzenie`). Linki `AppHeader` (`href="/sesje"`) przechwytywane i zamieniane na hash.
- Stan demo (`src/state/`): konta, rezerwacje, salda, szkic rezerwacji z blokadą 10 min (odlicza realne sekundy), scenariusze. Zegar stały `2026-10-20 14:00` (`src/lib/clock.ts`), zero `Date.now()`.
- Silnik przeglądu: kopia w `public/review/` z adapterem oznaczonym „kompas-flow adapter” (nawigacja, „Back”, wątki z niezamontowanych ekranów — `src/review/engine-adapter.ts`), `prototypeId` = `kompas-flow`, mostek kolorów na tokeny w `src/styles.css`.
- Pasek przeglądu (`index.html` + `src/review/`): „Prototyp”, wybór ekranu, konto demo, scenariusze (stan danych, wynik płatności, błąd następnego żądania, konflikt 409, wygaśnięcie blokady), motyw; tryby silnika (Clickable / Comment / Presentation / Threads / „← Back”).
- Ekrany F1: P1, P2 (filtry w URL), P3, P4, U1, U2, U3, U4, U5 (anuluj / przełóż / zgłoś problem). Pozostałe 14 ekranów: uczciwa strona „w przygotowaniu (etap 2)”. Bramki: zaloguj się, inna rola, mentor przed weryfikacją, już zalogowany.

### Sprawdzone

- `tsc --noEmit` — 0 błędów; `pnpm lint` (ESLint, dependency-cruiser, knip), `pnpm typecheck` (7/7), `pnpm build` (z prototypem) — kod 0. 22 ostrzeżenia `max-lines-per-function` w prototypie (repo je dopuszcza).
- `packages/ui/scripts/check-tokens.mjs` na `src/` prototypu — 0 wartości spoza tokenów.
- Playwright (Chromium): 32 trasy × 6 kont bez `pageerror`/błędów konsoli; F1 gość → P1 → P2 → P3 → U1 → P4 (rejestracja) → U2 (blokada, walidacja, KOMPAS10, odrzucona płatność z zachowanym celem, sukces) → U3 → U4; Adrian: rezerwacja z salda (3 → 2), anulowanie ≥ 12 h (saldo wraca), przełożenie, blokada przełożenia < 12 h, zgłoszenie problemu (walidacja); silnik: komentarz → localStorage `om-prototype-comments:v2:kompas-flow`, wątek widoczny z innego ekranu, klik przenosi, prezentacja i „Back”.
- 320 px (bez przewijania w poziomie) i ciemny motyw — zrzuty P2, U1, U4.
- axe (WCAG 2.2 AA, serious/critical) w ramce produktu: P1, P2, P3, P4, U1, U3, U4, U5 × jasny/ciemny — 0 naruszeń.

### Niesprawdzone w etapie 1

- U2 w axe (wymaga szkicu rezerwacji), pełna obsługa klawiaturą (sprawdzona tylko kolejność Tab w pasku), Safari/Firefox.
- Komentarze w nakładkach (Dialog, Sheet, Select) — silnik kotwiczy tylko w `.frame`, a nakładki Base UI są w portalu poza nią.

### Luki DS znalezione przy budowie (`// DS-GAP` w kodzie)

GuestHeader/AdminHeader, TopicSearch, CategoryList, FilterPanel (jest tylko jako nieeksportowany przykład Storybooka), FavoriteToggle, VideoPlayer, MentorSummaryBar, DurationToggle, TimezoneSelect, OrderSummary, PaymentMethodSelector, PromoCodeField, GuaranteeNote, CalendarButtons, PrepChecklist, BalancePill, NotesPanel, PasswordField (miernik siły), RoleChoice, ConsentField, SocialSignInButtons. `BottomNav` nie jest luką — jest wbudowany w `AppHeader`.

Usterki DS (poza zakresem, do zgłoszenia): `checkbox.tsx` — brak spacji w `hover:bg-surface-hoveraria-invalid:`, więc nie działa ani hover, ani obramowanie błędu; `AppHeader` ma sztywne `href` bez `render`/`linkRender` (aplikacja z routerem musi przechwytywać kliknięcia).

## Etap 0 — plan

### Materiały

| Materiał | Źródło |
|---|---|
| Mapa ekranów | `kompas-mentoring/KONCEPCJA.md` §3.1 (trasy), §2.2 (przepływy F1–F6 i ścieżki błędów), §4 (specyfikacja ekranów, stany L/E/Er/S) |
| Szary prototyp | `kompas-mentoring/mockupy/` (dane w `src/mocks.ts`, `NOW = 2026-10-20 14:00 +02:00`) — brak `revision-NNN/` ze skilla om-mockup-prototype |
| Design system | `packages/ui` (`@kompas/ui`), skrót `docs/design-system.md`, Storybook |
| Brief i backlog | `.ai/specs/product-brief.md`, `.ai/specs/backlog.md` |
| Silnik przeglądu | `.agents/skills/om-ux-design/references/assets/` w głównym checkoucie (prototype.js, prototype.css, comments.js) — znaleziony na dysku, ścieżki nie podano |

### Technologia i uruchomienie

- React 19.3.1 + TypeScript 6.0.3 + Vite 8.3.4 + `@tailwindcss/vite` 4.3.3 — te same wersje co `packages/ui`, żeby nie było dwóch Reactów ani dwóch Tailwindów.
- `@kompas/ui` przez `workspace:*`; style: `@import "@kompas/ui/styles.css";` + `@source "./"` dla klas prototypu. Ikony: `lucide-react` (jak w DS). Zero własnego CSS poza mostkiem kolorów silnika przeglądu.
- Router na hashu (`#/mentorzy/m1`), stan demo w `useReducer` + kontekst, bez backendu. Zegar demo: stała `DEMO_NOW` przekazywana do formatowania i liczników (`HoldCountdown` dostaje `now` z zegara demo, który można przesuwać kontrolką).
- `pnpm --filter @kompas/prototype-kompas-flow dev` → `http://localhost:5173`.
- Prototyp zostaje w `pnpm-workspace.yaml` (potrzebne do `workspace:*`), więc **musi przechodzić `pnpm lint`, `pnpm typecheck`, `pnpm build` całego repo** — to też pilnuje jakości.
- Podgląd w Storybooku: Storybook nie ma `staticDirs`, a zmiana `packages/ui/.storybook/main.ts` łamie zasadę 8. Propozycja: skrypt prototypu `build:storybook` buduje z `base: './'` i kopiuje wynik do `packages/ui/storybook-static/prototypes/kompas-flow/` (katalog wynikowy, w `.gitignore`), więc po `pnpm build-storybook` prototyp jest pod `/prototypes/kompas-flow/index.html`. Działa dla zbudowanego Storybooka, nie dla `storybook dev`.

### Układ ekranu

```
┌ pasek przeglądu (nie-produkt): PROTOTYP · ekran ▾ · konto demo ▾ · motyw · scenariusze ▾ · komentarze · mapa · prezentacja ┐
│ AppHeader (produkt: logo, nawigacja roli, dzwonek, awatar z menu)                                                          │
│ treść ekranu (content-max 1160 / form-max 640)                                                                             │
│ dolna nawigacja roli < 768 px (DS-GAP: BottomNav)                                                                          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Kolejność budowy

**Etap 1 (sam, bo wszystko jest sprzężone):** szkielet, router z mapy, stan demo, pasek przeglądu, silnik komentarzy, potem ścieżka F1 bez błędów: P1 → P2 → P3 → U1 → (P4, gdy gość) → U2 → U3 → U4 → U5.

**Etap 2 (równolegle, po zamrożeniu wspólnych plików `router`, `demo-state`, `mocks`, `review-bar`):** 3 zadania z rozłącznymi plikami ekranów:
- A: uczeń — U6, U7, U8, U9, S1, S2, S3 + stany błędów F1–F3 w ekranach etapu 1;
- B: mentor — M1 (6 kroków), M2, M3, M4, M5 + przekierowanie niezatwierdzonego mentora do M1;
- C: admin — A1, A2 + przepływ sporu F6 (zgłoszenie z U5 → kolejka A2).
Wspólne pliki zmieniam tylko ja, przy scalaniu.

**Etap 3:** notatki przy ekranach, README, testy Playwright, przejście w przeglądarce, raport.

### Kontrolki scenariuszy (pasek przeglądu)

| Kontrolka | Wartości | Gdzie działa |
|---|---|---|
| Ekran | 23 ekrany z mapy (+ krok M1) | wszędzie |
| Konto demo | gość + konta z tabeli niżej | wszędzie; zmiana konta zachowuje trasę i pokazuje bramkę, jeśli rola nie pasuje |
| Motyw | jasny / ciemny (`.dark` na `<html>`) | wszędzie |
| Stan danych ekranu | domyślny / ładowanie / pusto / błąd | każdy ekran z listą lub danymi |
| Wynik płatności | sukces / odrzucona (powód od operatora) / 3DS przerwane / webhook opóźniony („Przetwarzamy płatność”) | U2, U8 |
| Konflikt slotu | następna blokada → 409 | U1, przełożenie w U5 |
| Wygaśnięcie blokady | „wygaś teraz” | U2 |
| Błąd następnego żądania | jednorazowy błąd sieci / 500 | każdy formularz i akcja |
| Wygaśnięcie sesji | następna akcja → P4 z `returnTo`, dane formularza zachowane | ekrany po zalogowaniu |
| Zegar demo | stały `20.10.2026 14:00`; presety „T-10 min przed sesją”, „< 12 h przed sesją” | U5, U6 (reguła 12 h, wejście do pokoju) |
| Mentor nie dołączył | tak / nie | U6 (no-show) |
| Odpowiedź mentora na próbną | akceptuje / odrzuca (zwrot 100% + 3 podobnych) | U3, U4 |

Kontrolki są tylko w pasku przeglądu; nawigacja produktu ich nie zawiera.

### Konta demo (dane z `mockupy/src/mocks.ts`)

| Konto | Rola | Stan | Do czego |
|---|---|---|---|
| Gość | — | niezalogowany | P1–P4, bramka „zaloguj się” |
| Adrian C. | uczeń | plan 1×60 min/tydz., saldo 3, sesja dziś 14:05 | U4–U9, reguła 12 h, pokój |
| Julia M. | uczeń | plan 2×60 min/tydz., saldo 5 | wiele sesji, „dużo danych” |
| Paweł R. | uczeń | próbny, saldo 0 | F1 od zera, pierwsza rezerwacja próbna |
| Kasia Nowicka | mentor | profil zatwierdzony | M2–M5 |
| Adam Górski | mentor | wniosek w weryfikacji | przekierowanie do M1 ze statusem |
| Zespół zaufania | admin | — | A1, A2 |

### Komponenty `@kompas/ui` na ekran

Stan DS w kodzie (sprawdzony 2026-11-21): **31 komponentów bazowych + 16 produktowych** eksportowanych z `src/index.ts`. `packages/ui/POSTEP.md` wymienia 45 komponentów produktu — 29 z nich nie istnieje w kodzie (np. `BottomNav`, `FilterPanel`, `WeekPicker`, `PasswordField`, `OnboardingStepper`); `FilterPanel` jest tylko w `.storybook/examples` (nieeksportowany). To osobna rozbieżność do zgłoszenia.

| Ekran | Z DS | DS-GAP (budowane z bazowych + tokenów) |
|---|---|---|
| P1 | AppHeader, PageHeader, Input, Button, Link, MentorCard, Card | TopicSearch, CategoryList |
| P2 | MentorCard, ActiveFilters, Checkbox, Slider, Select, Combobox, Sheet (filtry mobile), Skeleton, EmptyState, ErrorState | FilterPanel, ResultCount, FavoriteToggle |
| P3 | ProfileHero, StickyBookingBar, SlotGrid, Money, Card, Badge, Avatar, Tabs | StatsRow, SkillTags, VideoPlaceholder (symulacja) |
| P4 | Tabs, Field, Input, Checkbox, RadioGroup, Button, Alert | PasswordField, SocialSignInButtons (symulacja), ConsentField, RoleChoice |
| U1 | SlotGrid, HoldCountdown, ToggleGroup, Select, Alert, Toast | WeekPicker, DurationToggle, TimezoneSelect, MentorSummaryBar |
| U2 | HoldCountdown, Money, Textarea, Field, RadioGroup, Input, Button, Alert, Card | OrderSummary, PaymentMethodSelector (symulacja), PromoCodeField, GuaranteeNote |
| U3 | Card, DateTime, Money, Button, Link, BookingStatusBadge | AddToCalendar (symulacja) |
| U4 | Tabs, NextSessionCard, SessionListItem, BookingStatusBadge, EmptyState, Skeleton | — |
| U5 | PolicyNotice, BookingStatusBadge, DateTime, AlertDialog, Sheet, SlotGrid, Textarea, RadioGroup | CancelDialog, RescheduleSheet, DisputeForm (kompozycje) |
| U6 | Button, Alert, Badge, Switch, Tooltip | VideoRoom (symulacja), DeviceCheck |
| U7 | RadioGroup, Textarea, Checkbox, Button | StarInput |
| U8 | Card, Money, RadioGroup, Button, Dialog, Table | PlanPicker, TransferBalanceDialog |
| U9 | Card, Checkbox, Badge, Tabs, EmptyState | GoalProgress, ActionItemList |
| S1 | Avatar, Textarea, Button, EmptyState | ThreadList, MessageBubble |
| S2 | Badge, Button, EmptyState, Tabs | NotificationItem |
| S3 | Tabs, Field, Input, Switch, Select, AlertDialog, Table | DataRequestRow |
| M1 | Field, Input, Textarea, Combobox, Select, Checkbox, Button, Alert | OnboardingStepper, PhotoUpload, VideoLinkField, RateField, AvailabilityWeek, KycEmbed (symulacja), ProfileStatus |
| M2 | TodayAgenda, TrialRequestCard, Card, Money, Dialog (odrzucenie z powodem), Alert | — |
| M3 | ToggleGroup, Switch, Field, Dialog, Alert | AvailabilityWeek, ExceptionForm, CalendarSettingsForm |
| M4 | Table, Avatar, Badge, Sheet, Textarea, Checkbox | StudentDetail, SessionNoteForm |
| M5 | Table, Money, Card, Button (`disabled` + `aria-describedby` poniżej minimum), Alert | EarningsSummary |
| A1 | Table, Badge, RadioGroup, Textarea, Dialog | ApplicationQueue, VerificationChecklist, DecisionForm |
| A2 | Table, Badge, RadioGroup, Textarea, Dialog, Money | DisputeTimeline (SessionEventTimeline) |

Wspólne luki: **BottomNav** (dolna nawigacja < 768 px), **ReviewBar** (pasek przeglądu — z założenia poza produktem).

### Ryzyka i pytania

1. **Ścieżka silnika przeglądu** — potrzebna przed etapem 1 (komentarze, mapa ekranów, prezentacja, „Back”, mostek kolorów).
2. **Podgląd w Storybooku** — proponowane kopiowanie do `storybook-static/prototypes/kompas-flow/` (tylko zbudowany Storybook). Alternatywa wymaga `staticDirs` w `packages/ui/.storybook/main.ts`, czyli zmiany DS.
3. Rozbieżność `packages/ui/POSTEP.md` (45 komponentów produktu) vs kod (16) — do zgłoszenia w backlogu, poza zakresem prototypu.

## Etap 2 — stany, role, scenariusze (2026-11-21/22)

Pierwsza próba (2026-11-21) zbudowała 14 ekranów, ale na klasach, których DS nie ma
(`bg-surface-primary`, `text-text-primary`), z martwymi przyciskami i `number` dla kwot — jej raport
„zrobione” był nieprawdziwy. Kod odrzucono i etap 2 zrobiono od nowa: najpierw warstwa wspólna,
potem trzy równoległe zadania o rozłącznych plikach, na końcu scalenie i poprawki integracyjne.

### Warstwa wspólna (przed zadaniami)

- `src/data/` rozszerzone o dane z `store.ts` / `domain.ts` / `mocks.ts` szarego prototypu: cele,
  plany, płatności, wiadomości, powiadomienia, praca mentora, wnioski mentora, spory.
- `src/state/world.ts` — akcje przechodzą między rolami: spór z U5 trafia do A2; zatwierdzenie
  mentora w A1 otwiera mu panel; zmiana dostępności w M3 zmienia sloty w U1.
- Wspólny `useAction` + `FailureAlert` (błąd żądania, wygasła sesja → ponowne logowanie w oknie,
  wpisane dane zostają na ekranie).
- Nowe kontrolki scenariusza: wygaśnięcie sesji, presety zegara demo, „mentor nie dołącza”,
  odpowiedź mentora na próbną. Dzwonek pokazuje liczbę nieprzeczytanych powiadomień.
- `scripts/check-classes.mjs` — nowy strażnik: każda klasa z JSX musi mieć CSS w `dist`. Skanuje
  całą treść pliku (także `cn(…)` i wartości wieloliniowe), a jako klasy liczy wyłącznie literały,
  nie identyfikatory z warunków. Na kodzie odrzuconej wersji znalazł 48 klas bez CSS.

### Ekrany (3 zadania równoległe, rozłączne pliki)

| Zakres | Ekrany |
|---|---|
| Uczeń | U6 Pokój sesji, U7 Ocena, U8 Plany i saldo, U9 Postępy |
| Wspólne | S1 Wiadomości, S2 Powiadomienia, S3 Konto i ustawienia |
| Mentor | M1 Onboarding (6 kroków), M2 Panel, M3 Kalendarz, M4 Uczniowie, M5 Zarobki |
| Zespół zaufania | A1 Weryfikacja mentorów, A2 Spory i zwroty |

Po scaleniu poprawek integracyjnych: ponowiona wysyłka wiadomości trafia do odbiorcy; saldo wolno
przenieść tylko do mentora po odbytej próbnej; sloty (P3/U1/U5) respektują ustawienia M3
(minimalne wyprzedzenie, bufor, dni wolne).

### Sprawdzone

- `tsc --noEmit` — 0 błędów; `pnpm lint` — 0 błędów (knip, dependency-cruiser), tylko ostrzeżenia
  `max-lines-per-function`; `pnpm build` — 2/2.
- CI PR #57: `build`, `lint`, `typecheck`, `unit`, `integration`, `Storybook`, `e2e smoke` — zielone.
- Playwright (Chromium, 1280 px): 7 kont × 23 trasy × 2 motywy = 322 przejścia bez `pageerror`
  i bez błędów konsoli.
- `check-classes` — 0 klas bez CSS (najpierw potwierdzone, że wykrywa naruszenia na pliku testowym).
- `check-tokens` (DS) — 0 wartości spoza tokenów.
- Pasek przeglądu zawija kontrolki przy 320 px: brak poziomego przewijania strony, brak uciętych
  kontrolek (1440 px też bez przepełnienia).
- axe (WCAG 2.2 AA): 9 ekranów ścieżki F1 × jasny/ciemny — 0 poważnych naruszeń.

### Niesprawdzone w etapie 2

- Pełny przegląd axe dla 14 nowych ekranów i U2.
- Safari i Firefox.
- Przepływ „poproś o zmiany” w M1 z realnym A1 — w zadaniu mentora sprawdzony na podmienionych
  danych; do potwierdzenia end-to-end.

### Pytania do specyfikacji (etap 2)

1. Czy gość może wybrać termin przed zalogowaniem? (F1 — tak; KONCEPCJA §3.2 mówi, że U* wymaga
   zalogowania) — prototyp idzie za F1.
2. Opłata serwisowa 3 zł i kod `KOMPAS10` pochodzą z szarego prototypu; KONCEPCJA wymienia te
   elementy bez wartości.
3. Czy mentor może edytować wniosek, który czeka już na weryfikację?

## Etap 3 — uczciwość i sprawdzenie (2026-11-22)

### Notatki przy ekranach

Każdy ekran ma pod ramką notatkę (`src/screens/registry.ts` → `notes`, render w
`src/shell/screen-frame.tsx`): numery historii (`refs`), „Symulacja:” i „Czego nie rozstrzyga:”.
Notatka jest częścią `section.screen`, więc wchodzi w przegląd axe i jest widoczna w trybie
komentarzy; w trybie prezentacji silnik ją ukrywa.

### README

`prototypes/kompas-flow/README.md`: uruchomienie, testy, pasek przeglądu, konta demo, scenariusze,
**Ograniczenia symulacji**, mapa ekranów, luki design systemu.

### Testy nawigacji (`e2e/`, Playwright)

- `playwright.config.ts`: `test:e2e`, `webServer` = `vite preview` (port 4173), projekty 320 i 1440 px.
- `navigation.spec.ts`: render każdego ekranu na każdym z 7 kont; bramki (logowanie z powrotem,
  rola, mentor przed weryfikacją); F1 (gość wybiera termin, loguje się w U2); każda kontrolka
  scenariusza; tryby silnika i „← Back”; klawiatura (pierwszy Tab w pasku, slot Enterem, menu
  scenariuszy Enterem/Escape); brak poziomego przewijania na 23 ekranach × 2 motywy × 2 szerokości.
- `a11y.spec.ts`: axe WCAG 2.2 AA na każdym ekranie × jasny/ciemny (23 × 2), we właściwym koncie;
  `include('section.screen')`.

### Sprawdzone

- `pnpm --filter @kompas/prototype-kompas-flow test:e2e` — 19 passed, 1 skipped (axe uruchamiamy
  raz, na szerokim ekranie; wąski ekran pokrywa test przewijania).
- `pnpm lint` 0 błędów, `pnpm typecheck` 7/7, `pnpm build` 2/2; `check:classes` 0; `check:tokens` 0.

### Niesprawdzone

- Safari i Firefox (tylko Chromium).
- Pełny przegląd każdego pojedynczego przycisku produktu — testy pokrywają każdą kontrolkę
  scenariusza, tryb silnika i kluczowe przepływy, nie każdy przycisk z osobna.
- Na 320 px otwarty panel komentarzy zasłania pasek przeglądu; zamyka się Escape (silnik przeglądu).
