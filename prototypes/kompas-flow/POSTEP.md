# POSTĘP — prototyp kompas-flow

Specyfikacja: [`.ai/specs/2026-11-21-prototyp-kompas-flow.md`](../../.ai/specs/2026-11-21-prototyp-kompas-flow.md). Pierwsza wersja (bez design systemu, 156 błędów TS) — przegląd w [`.ai/runs/2026-11-21-przeglad-prototypu-kompas-flow.md`](../../.ai/runs/2026-11-21-przeglad-prototypu-kompas-flow.md); jej kod i stary plan są w historii gita (commit `ea4e3f4`).

| Etap | Stan |
|---|---|
| 0 — plan (wersja 2, na `@kompas/ui`) | czeka na „dalej” i ścieżkę silnika przeglądu |
| 1 — szkielet i ścieżka F1 | — |
| 2 — stany, role, scenariusze | — |
| 3 — uczciwość i sprawdzenie | — |

## Etap 0 — plan

### Materiały

| Materiał | Źródło |
|---|---|
| Mapa ekranów | `kompas-mentoring/KONCEPCJA.md` §3.1 (trasy), §2.2 (przepływy F1–F6 i ścieżki błędów), §4 (specyfikacja ekranów, stany L/E/Er/S) |
| Szary prototyp | `kompas-mentoring/mockupy/` (dane w `src/mocks.ts`, `NOW = 2026-10-20 14:00 +02:00`) — brak `revision-NNN/` ze skilla om-mockup-prototype |
| Design system | `packages/ui` (`@kompas/ui`), skrót `docs/design-system.md`, Storybook |
| Brief i backlog | `.ai/specs/product-brief.md`, `.ai/specs/backlog.md` |
| Silnik przeglądu | **ścieżka do podania przez użytkownika** |

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
