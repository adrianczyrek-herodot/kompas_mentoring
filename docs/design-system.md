# Design System Kompasu — skrót dla agentów AI

Ten plik to skondensowana instrukcja obsługi design systemu. Agent budujący nowy ekran czyta **ten plik jako pierwszy**.

> Pełna dokumentacja: Storybook (`pnpm --filter @kompas/ui storybook`) → zakładka **Przewodnik**.

---

## Charakter produktu (3 zdania)

1. **Czytelny, gęsty, ciepły, uporządkowany, rzeczowy** — jedna główna akcja na ekranie, gęste tabele, ciepłe tło, jeden akcent, szeryf tylko w nagłówkach P1/P3.
2. **Antycharakter:** generyczny, efekciarski, hałaśliwy, bezbarwny, natarczywy — brak gradientów, szkła, iskierek, gamifikacji, fałszywej pilności.
3. **Ton:** bezpośredni, ludzki, prosty; błąd mówi co się stało i co poprawić; humor tylko w pustych stanach i powitaniach.

---

## Tabela komponentów (import, kiedy, kiedy nie)

| Komponent | Import | Kiedy używać | Kiedy NIE używać |
|---|---|---|---|
| Button | `Button` | Główna/drugorzędna/cicha/destrukcyjna akcja na stronie | Nawigacja (Link), przełącznik (Switch/ToggleGroup) |
| Link | `Link` | Nawigacja do innego URL/ekranu, akcja tekstowa w treści | Wywoływanie akcji (Button) |
| ToggleGroup | `ToggleGroup` | Wybór 1/kilku widocznych opcji (2–4) obok siebie | Wiele opcji ukrytych (Select), binarny (Switch), wyłącznie (RadioGroup) |
| Field | `Field` | Etykieta + pole + podpowiedź + błąd + opcjonalne/wymagane | Samodzielne pola bez etykiety |
| Input | `Input` | Krótki tekst, e-mail, hasło, URL, liczba | Wielowierszowy (Textarea), wybór z listy (Select/Combobox) |
| Textarea | `Textarea` | Długi tekst z licznikiem (profil 300–2000, powód 10–300) | Krótki tekst (Input) |
| Select | `Select` | Wybór z 7–20 opcji, lista zawsze pod polem | Wyszukiwanie (Combobox), 2–6 opcji (RadioGroup/ToggleGroup) |
| Combobox | `Combobox` | Pole z wyszukiwaniem, wiele tagów (tematy, tagi mentora) | Stała lista (Select), wyłącznie (RadioGroup) |
| Checkbox | `Checkbox` | Binarne tak/nie, zgody, filtry wielokrotnego wyboru | Wyłącznie jeden (RadioGroup), przełącznik on/off (Switch) |
| RadioGroup | `RadioGroup` | Wyłącznie jeden z 2–6 opcji z opisami (rola, powód odrzucenia) | Wiele opcji (Select/Combobox), binarny (Checkbox/Switch) |
| Switch | `Switch` | Przełącznik on/off z natychmiastowym efektem | Wyłącznie z opcji (RadioGroup), zatwierdzenie formularza (Checkbox) |
| Slider | `Slider` | Zakres liczbowy z podglądem (cena 0–1000 zł) | Dokładna liczba (Input), dyskretne opcje (ToggleGroup) |
| Card | `Card` | Panel z ramką i paddingiem (sekcje P3, M2, S3) | Linia między wierszami (Separator), lista bez ramki |
| Badge | `Badge` | Status zawsze z ikoną i tekstem (sesja, wniosek, prośba) | Tylko kolor bez tekstu (WCAG 1.4.1), licznik |
| Avatar | `Avatar` | Zdjęcie lub inicjały (mentor, uczeń, nagłówek) | Ikona statusu (Badge), dekoracja |
| Table | `Table` | Gęsta tabela liczb z wyrównaniem do prawej (kolejka A1) | Prosta lista (SessionListItem), karty (MentorCard) |
| Tabs | `Tabs` | Zakładki z podkreśleniem (Nadchodzące/Minione, Logowanie/Rejestracja) | Osobne strony, panel boczny (Sheet) |
| Dialog | `Dialog` | Zadanie wymagające skupienia, formularz, potwierdzenie | Proste potwierdzenie (AlertDialog), panel boczny (Sheet) |
| AlertDialog | `AlertDialog` | Nieodwracalna akcja z czasownikiem (Usuń konto, Anuluj < 12 h) | Zwykłe zadanie (Dialog), panel boczny (Sheet) |
| Sheet | `Sheet` | Panel boczny/dolny (filtry mobile, przełożenie U5) | Dialog środkowy, podpowiedź (Popover/Tooltip) |
| Menu | `Menu` | Menu profilu, akcje wiersza (nawigacja strzałkami) | Podpowiedź (Tooltip), formularz (Dialog) |
| Popover | `Popover` | Pływające okienko pomocnicze (wybór tygodnia, filtr pory dnia) | Blokujące tło (Dialog/Sheet), podpowiedź (Tooltip) |
| Tooltip | `Tooltip` | Krótki tekst przy ikonie/przycisku (Escape zamyka) | Interaktywna treść (Popover), błąd pola (FieldError) |
| Alert | `Alert` | Baner statusu w treści (wstrzymanie M3, reguła 12 h U5) | Dynamiczny błąd po akcji (role="alert" jawnie), toast |
| Toast | `useToast` | Potwierdzenie akcji, 409 konflikt, zapisano (aria-live polite) | Błąd wymagający działania (Alert w treści), status w treści (Alert) |
| Skeleton | `Skeleton` | Stan ładowania struktury (karta, wiersz, tabela) | Pusty stan (EmptyState), błąd (ErrorState) |
| Spinner | `Spinner` | Wskaźnik w przycisku (loading), sekcja (role="status") | Szkielet całej struktury (Skeleton) |
| EmptyState | `EmptyState` | Dlaczego pusto + następny krok (brak wyników filtrów vs pierwsze użycie) | Ładowanie (Skeleton), błąd (ErrorState) |
| ErrorState | `ErrorState` | Błąd wczytania widoku + przycisk „Ponów” | Pusty stan (EmptyState), ładowanie (Skeleton) |

**Onboarding mentora (F2, M1):** `Stepper` (postęp 6 kroków; `aria-current="step"`), `TagInput` (wolne tagi z chipami), `PhotoUploader` (wybór pliku, podgląd, stan uploadu), `VideoLinkField` (link YouTube/Vimeo) + `VideoFacade` (odtwarzacz ładuje się dopiero po kliknięciu), `RateInput` + `EarningsPreview` (stawka 60/30 min, bez kwoty po prowizji — Q9) — patrz Storybook → **Produkt/E2 Katalog i onboarding**.

**Produkt (E1–E3):** `AppHeader`, `PageHeader`, `Money`, `DateTime`, `MentorCard`, `FilterPanel`, `ActiveFilters`, `ProfileHero`, `StickyBookingBar`, `SlotGrid`, `HoldCountdown`, `SessionListItem`, `NextSessionCard`, `BookingStatusBadge`, `PolicyNotice`, `TrialRequestCard`, `TodayAgenda` — patrz Storybook → **Produkt**.

---

## Tokeny znaczeniowe (główne)

| Token | Przeznaczenie | Nigdy nie używać |
|---|---|---|
| `surface-page` | Tło strony | panel |
| `surface-panel` | Panels, overlays, pola formularza | tło strony |
| `surface-sunken` | Nagłówek tabeli, kod, szkielet | akcja główna |
| `text-default` | Wszystki tekst właściwy | — |
| `text-muted` | Metadane, opisy | cena, reguła 12 h (A04) |
| `text-subtle` | Placeholder, znaczniki czasu | nic, co trzeba by działało |
| `text-link` | Linki, akcje tekstowe | wypełnienie przycisku |
| `action-primary` (+`-hover`, `-pressed`) | **Jeden** przycisk główny na ekran | drugorzędne, dekoracja, tła |
| `text-on-action` | Tekst na `action-primary` | — |
| `action-danger` / `text-on-danger` | Nieodwracalne akcje | ostrzeżenia |
| `selected-bg` / `selected-border` | Wybrany slot, zakładka, opcja | hover |
| `focus-ring` | Każdy element focusowalny (2 px + 2 px gap) | — |
| `border-divider` | Linie między wierszami (dekoracyjne) | granice pól |
| `border-control` | Input, checkbox, radio, przycisk drugorzędny | linie między wierszami |
| `status-{success,warning,danger}-fg/-bg` | Badge, Alert (zawsze z ikoną/tekstem) | jako jedyny sygnał |
| `shadow-overlay` | Menu, Popover, Dialog, Toast | karty, panele |
| `radius-tag` / `radius-control` / `radius-panel` / `radius-round` | 4 / 6 / 8 px / full | pill wszędzie |
| `font-sans` / `font-mono` / `font-serif` | Tekst i dane / kod / P1 i P3 nagłówki | mono dla nazw plików, serif poza P1/P3 |
| `numeric` | `tabular-nums` dla godzin, kwot, tabel | — |
| `measure-text` | 65 ch (szerokość tekstu ciągłego) | tabele |
| `space-inline` / `space-group` / `space-panel` / `space-section` | 8 / 16 / 16→24 / 32→48 | — |
| `space-row-y` | 12 (wiersze, tabele) | booking, room |
| `control-height` / `target-min` | 44 px (przyciski, pola, cele dotyku) | — |
| `content-max` / `form-max` | 1160 / 640 px (szerokość treści / formularze) | — |
| `duration-fast` / `-base` / `-overlay` | 100 / 160 / 200 ms, easing standard | — |

**W CSS:** `bg-surface-panel`, `text-text-default`, `gap-group`, `rounded-control`, `p-panel`, `py-row-y`…
**W Tailwind:** domyślna paleta wyłączona — `bg-zinc-900` nie zadziała.

---

## Przewodniki „Jeśli… to użyj…” (kluczowe)

| Dylemat | Rozwiązanie |
|---|---|
| Button vs Link vs ToggleGroup vs Menu | Akcja na stronie → Button; nawigacja → Link; 2–4 widoczne opcje → ToggleGroup; menu profilu/akcji wiersza → Menu |
| RadioGroup vs Select vs Combobox | 2–6 opcji z opisami → RadioGroup; 7–20 prostych → Select; >15 lub wyszukiwanie → Combobox |
| Switch vs Checkbox | Natychmiastowy efekt (bez submit) → Switch; w formularzu/zgoda → Checkbox |
| Dialog vs AlertDialog vs Sheet vs Popover vs Tooltip | Zadanie/focus trap → Dialog; nieodwracalna akcja → AlertDialog; panel boczny → Sheet; pływające okienko → Popover; tylko tekst → Tooltip |
| FieldError vs Alert vs Toast | Błąd przy polu → FieldError; status w treści → Alert; potwierdzenie po akcji → Toast; **błąd wymagający działania → Alert z `role="alert"` (nigdy Toast)** |
| Skeleton vs Spinner | Struktura ładuje się → Skeleton; w przycisku/sekcji → Spinner |
| Table vs Lista vs Karty | Gęsta tabela liczb → Table; wiersze ze statusem/akcją → SessionListItem; karty z awatarem/CTA → MentorCard |
| Tabs vs Osobne strony | 2–4 widoki tej samej encji → Tabs; zupełnie różne konteksty → osobne strony |

---

## Czego unikać (TOP 10)

| Kod | Problem | Zastąpić |
|---|---|---|
| `bg-gradient-to`, `backdrop-blur`, `shadow-[0_0_20px]` | Generyczny wygląd AI (A01) | Tokeny: `bg-surface-panel`, `bg-action-primary`, `shadow-overlay` |
| `animate-pulse` na przyciskach, liczniki poza `HoldCountdown` | Sztuczna pilność (A02) | Tylko `HoldCountdown` |
| `points`, `badges`, `confetti`, emoji `🎉` | Gamifikacja (A03) | Puste stany z humorem (K5), `Toast` |
| `text-text-muted` / `text-text-subtle` przy regule 12 h | Drobny druk (A04) | Pełny tekst w `PolicyNotice` / `AlertDialogDescription` |
| `div onClick` zamiast `Button` | Brak klawiatury/ARIA/fokusu (I05) | `Button` / `Link` |
| `placeholder` bez `FieldLabel` | Czytnik nie ogłasza nazwy pola (I06) | `Field` z `FieldLabel` |
| `text-green-600` bez ikony | Status tylko kolorem (I07) | `Badge variant="success"` |
| `<Button disabled>` bez `aria-describedby` | Użytkownik nie wie dlaczego (I08) | `Button disabled aria-describedby={id}` + tekst obok |
| `toast.add({ variant: 'danger' })` dla błędu wymagającego działania | Toast znika, kontekst ginie (I09) | `Alert variant="danger" role="alert"` w treści |
| `Tooltip` z informacją niezbędną do działania | Tooltip znika na mobile/Escape (I10) | `FieldDescription` / `Alert` w treści |

---

## Komendy (weryfikacja przed commitem)

```bash
pnpm lint && pnpm typecheck && pnpm --filter @kompas/ui check:tokens && pnpm --filter @kompas/ui test:stories:themes
```

- `check:tokens` — kod ≠ 0 = wartości spoza tokenów / klasy palety / wartości arbitralne / `dark:` w komponentach
- `test:stories:themes` — 352 testy × 2 motywy, a11y `error`

---

## Pliki referencyjne

| Plik | Co zawiera |
|---|---|
| `packages/ui/POSTEP.md` | Historia decyzji, otwarte pytania, stan etapów |
| `lekcja-06/tokeny.md` | Zatwierdzona tabela tokenów z kontrastem |
| `lekcja-06/referencje.md` | R01–R06, A01–A04, K1–K6 |
| `kompas-mentoring/KONCEPCJA.md` | Ekrany, przepływy, reguły domenowe |
| `.ai/specs/backlog.md` | Epiki, historie, zadania |
| `.ai/specs/product-brief.md` | Produkt, użytkownicy, zakres Now/Later |

---

## Na start nowego ekranu

1. Otwórz Storybook → **Przewodnik/Zacznij tutaj** → 5 kroków
2. Znajdź wzorzec (Formularz / Lista / Szczegóły / Potwierdzenie / Kreator / Wybór terminu / Zmiana 12h / Decyzja)
3. Użyj tabeli „Jeśli… to użyj…” → wybierz komponenty
4. Złóż z tokenów znaczeniowych (tabela wyżej)
5. Zaprojektuj stany danych (loading, empty, error, partial, many, long, 320px)
6. Sprawdź **Czego unikać** (tabela wyżej)
7. Uruchom `pnpm --filter @kompas/ui check:tokens` na swoim kodzie