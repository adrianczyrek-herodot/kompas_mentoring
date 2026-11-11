# Tokeny: Kompas

- **Data:** 2026-11-11
- **Źródło decyzji:** `lekcja-06/referencje.md` (R01–R06, A01–A04, K1–K6), `.ai/specs/product-brief.md`, `kompas-mentoring/KONCEPCJA.md`.
- **Istniejące tokeny:** `packages/ui/src/styles/globals.css` (paleta z mockupu, PR #7). Nazwy shadcn (`--primary`, `--muted`, `--signal`…) zostają jako aliasy na tokeny znaczeniowe.
- **Zatwierdził:** Adrian Czyrek, 2026-11-11 (tabela w całości, z propozycjami P-T1–P-T10).
- **W kodzie:** `packages/ui/src/styles/tokens.css` (jedyny plik z surowymi wartościami).

Nazwy w kodzie: promienie i cień mają w `tokens.css` zmienne `--shape-tag`, `--shape-control`, `--shape-panel`, `--shape-round` i `--depth-overlay` (nazwy `--radius-*` / `--shadow-*` należą do przestrzeni nazw Tailwinda); klasy pozostają `rounded-tag`, `rounded-control`, `rounded-panel`, `rounded-round`, `shadow-overlay`. Role tekstu: zmienne `--type-*`, klasy `text-display`, `text-page-title`, `text-section-title`, `text-body`, `text-body-dense`, `text-label`, `text-meta`, `text-code`. Odstępy: zmienne `--space-*`, klasy `gap-inline`, `gap-group`, `p-panel`, `gap-section`, `py-row-y`.

Oznaczenia: **P-T…** — wartość zaproponowana przez agenta (materiały jej nie podają), przyjęta przez właściciela. Wartości: jasny / ciemny.

## Warstwa 1 — surowe wartości (tylko w pliku tokenów)

| Grupa | Jasny | Ciemny |
|---|---|---|
| Ciepłe neutralne | `paper-50 #fdfbf7`, `paper-100 #f6f3ec`, `paper-200 #efeae0`, `paper-300 #e3ddd1`, `stone-500 #8c8275`, `stone-600 #6b6358`, `stone-700 #5a5249`, `ink-900 #211d18` | `night-950 #141210`, `night-900 #1a1714`, `night-800 #24201b`, `night-700 #38322b`, `night-500 #857a6c`, `sand-300 #a89d8e`, `sand-200 #c4b9aa`, `sand-50 #f1ebe1` |
| Akcent (bursztyn) | `amber-100 #fbeadb`, `amber-450 #de8240`, `amber-500 #d4702a`, `amber-550 #cc6c28`, `amber-800 #a4480f` | `amber-dark-200 #f4b47e`, `amber-dark-300 #f3ac70`, `amber-dark-400 #f0a060`, `amber-dark-500 #e8904c`, `amber-dark-900 #3d2c1d` |
| Czerwień | `red-100 #fbe5e2`, `red-700 #b4352a`, `white #ffffff` | `red-dark-400 #f07b6f`, `red-dark-900 #3d211d` |
| Zieleń (tylko sukces) | `green-100 #e2f2e7`, `green-700 #2f7a4a` | `green-dark-400 #6fcf8f`, `green-dark-900 #1b3324` |
| Żółć | `yellow-100 #fdf1d6`, `yellow-800 #8a5a00` | `yellow-dark-400 #e8b85a`, `yellow-dark-900 #3a2f16` |
| Skala odstępów | 0, 4, 8, 12, 16, 24, 32, 48, 64 px | — |
| Promienie | 4, 6, 8 px, pełny | — |
| Rozmiary tekstu | 13, 14, 16, 18, 22, 24, 28, 36 px | — |
| Czasy | 100, 160, 200 ms | — |

## Warstwa 2 — tokeny znaczeniowe

| Token | Warstwa | Wartość (jasny / ciemny) | Pochodzenie | Gdzie używać | Gdzie nie używać |
|---|---|---|---|---|---|
| `surface-page` | znaczeniowa | `#f6f3ec` / `#1a1714` | R03.1 | tło strony | panele |
| `surface-panel` | znaczeniowa | `#fdfbf7` / `#24201b` | R03.1, R04.1 (nie czysta biel) | panele, nakładki, pola formularza | tło strony |
| `surface-sunken` | znaczeniowa | `#efeae0` / `#141210` | R04.1 | nagłówek tabeli, kod, szkielet ładowania | akcja główna |
| `text-default` | znaczeniowa | `#211d18` / `#f1ebe1` | R03.1 (atrament) | cały tekst główny | — |
| `text-muted` | znaczeniowa | `#5a5249` / `#c4b9aa` | R04.1 | metadane, opisy | zasada 12 h, ceny (A04) |
| `text-subtle` | znaczeniowa | `#6b6358` / `#a89d8e` | P-T1 | placeholder, znaczniki czasu | informacje potrzebne do działania |
| `text-link` | znaczeniowa | `#a4480f` / `#f3ac70` | R04.2 | linki, akcje tekstowe | wypełnienia przycisków |
| `action-primary` | znaczeniowa | `#d4702a` / `#f0a060` | K4, R06.2, R01.6, P2 | **jedna** akcja główna na ekranie | akcje drugorzędne, dekoracja, tła |
| `action-primary-hover` | znaczeniowa | `#de8240` / `#f4b47e` | K4 | najechanie na akcję główną | — |
| `action-primary-pressed` | znaczeniowa | `#cc6c28` / `#e8904c` | K4 | wciśnięcie akcji głównej | — |
| `text-on-action` | znaczeniowa | `#211d18` / `#1a1714` | K4 + WCAG 1.4.3 | tekst na `action-primary` | — |
| `action-danger` | znaczeniowa | `#b4352a` / `#f07b6f` | WCAG, A02 | akcje nieodwracalne | ostrzeżenia |
| `text-on-danger` | znaczeniowa | `#ffffff` / `#1a1714` | WCAG 1.4.3 | tekst na `action-danger` | — |
| `selected-bg` | znaczeniowa | `#fbeadb` / `#3d2c1d` | R04.2, K4 | zaznaczony slot, zakładka, opcja | najechanie |
| `selected-border` | znaczeniowa | `#a4480f` / `#f3ac70` | R04.2, K4 | obramowanie zaznaczenia | — |
| `focus-ring` | znaczeniowa | `#a4480f` / `#f3ac70`, 2 px + odsunięcie 2 px | WCAG 2.4.7, 2.4.11; grubość P-T2 | każdy element z fokusem | — |
| `border-divider` | znaczeniowa | `#e3ddd1` / `#38322b` | R01.4 | linie między wierszami, separatory (dekoracyjne) | granice pól |
| `border-control` | znaczeniowa | `#8c8275` / `#857a6c` | WCAG 1.4.11 (Z5) | ramka input, checkbox, radio, przycisk drugorzędny | linie wierszy |
| `status-success-fg` / `-bg` | znaczeniowa | `#2f7a4a` na `#e2f2e7` / `#6fcf8f` na `#1b3324` | brief (statusy U4/U5), K4 | znaczniki i komunikaty sukcesu, zawsze z ikoną lub tekstem | jedyny nośnik znaczenia |
| `status-warning-fg` / `-bg` | znaczeniowa | `#8a5a00` na `#fdf1d6` / `#e8b85a` na `#3a2f16` | brief, Z5 | ostrzeżenia (np. < 12 h) | — |
| `status-danger-fg` / `-bg` | znaczeniowa | `#b4352a` na `#fbe5e2` / `#f07b6f` na `#3d211d` | brief | błędy | — |
| `status-neutral-fg` / `-bg` | znaczeniowa | `text-muted` na `surface-sunken` | P-T3 (bez niebieskiego „info”, jeden akcent — K4) | statusy informacyjne | — |
| `shadow-overlay` | znaczeniowa | `0 4px 16px` atrament 12 % / czerń 50 %; panele bez cienia | R01.4, A01; wartość P-T4 | menu, popover, dialog, toast | karty, panele |
| `radius-tag` / `radius-control` / `radius-panel` / `radius-round` | znaczeniowa | 4 / 6 / 8 px / pełny | A01 (bez dużych zaokrągleń), Z7; wartości P-T5 | znacznik, checkbox / przycisk, pole / panel, dialog / awatar, radio | „wszystko w pigułkach” |
| `font-sans` / `font-mono` / `font-serif` | znaczeniowa | IBM Plex Sans / Mono / Serif | K6, R01.2, Q3 | tekst i dane / tylko kod / tylko nagłówki P1 i P3 | mono dla nazw plików (P4) |
| `numeric` | znaczeniowa | `tabular-nums` | R01.3 | godziny, kwoty, tabele | — |
| Role tekstu | znaczeniowa | display 36 serif (28 mobile), page-title 24/32, section-title 18/26, body 16/24, body-dense 14/20, label 14/20 medium, meta 13/18, code 14/20 mono | body 16: R05.1; gęsty: K1; rozmiary P-T6 | wg roli | zasada 12 h i ceny nigdy w `meta` (A04) |
| `measure-text` | znaczeniowa | 65 ch | R05.1 | tekst ciągły | tabele |
| `space-inline` / `space-group` / `space-panel` / `space-section` | znaczeniowa | 8 / 16 / 16→24 (≥ 768 px) / 32→48 | relacje z promptu; wartości P-T7 | w grupie / między grupami / wewnątrz panelu / między sekcjami | — |
| `space-row-y` | znaczeniowa | 12 | R01.1, K1 | wiersze list, tabele | rezerwacja, pokój |
| `control-height` / `target-min` | znaczeniowa | 44 px | K1 | przyciski, pola, cele dotyku | — |
| `content-max` / `form-max` | znaczeniowa | 1160 / 640 px | mockup (`.main`, `.narrow`) | szerokość strony / formularze | — |
| `duration-fast` / `-base` / `-overlay`, `easing-standard` | znaczeniowa | 100 / 160 / 200 ms, `cubic-bezier(.2,0,0,1)` | P-T8 (brak referencji ruchu — Luki) | najechanie / zmiana stanu / nakładki | — |
| Ruch ograniczony | znaczeniowa | ruch → 0 ms, przenikanie ≤ 100 ms | WCAG 2.3.3 | `prefers-reduced-motion: reduce` | — |
| Rozmiary ikon | znaczeniowa | 16 / 20 / 24, lucide | spec stacku; rozmiary P-T9 | — | emoji (R02.5) |

## Warstwa 3 — tokeny komponentów

| Token | Wartość | Pochodzenie |
|---|---|---|
| `button-height` | `control-height` | K1 |
| `input-border` | `border-control` | WCAG 1.4.11 |
| `row-divider` | `border-divider` | R01.4 |
| `slot-selected-bg` / `-border` | `selected-bg` / `selected-border` | R04.2 |
| `dialog-width` | 480 px | P-T10 |

## Kontrast (policzony dla wartości z tabeli)

| Para | Jasny | Ciemny | Próg |
|---|---|---|---|
| `text-default` / `page`, `panel`, `sunken` | 15,12 / 16,21 / 13,97 | 15,05 / 13,65 / 15,76 | 4,5 |
| `text-muted` / `page`, `panel`, `sunken` | 6,92 / 7,42 / 6,40 | 9,24 / 8,38 / 9,67 | 4,5 |
| `text-subtle` / `page`, `panel` | 5,34 / 5,72 | 6,70 / 6,07 | 4,5 |
| `text-on-action` / primary, hover, pressed | 4,91 / 5,88 / 4,58 | 8,42 / 9,92 / 7,25 | 4,5 |
| `text-default` / `selected-bg` | 14,27 | 11,23 | 4,5 |
| `text-link` / `page`, `panel`, `selected-bg` | 5,40 / 5,78 / 5,09 | 9,30 / 8,44 / 6,94 | 4,5 |
| `text-danger` / `panel`, własne tło; `text-on-danger` / `action-danger` | 5,83 / 5,00; 6,03 | 5,99 / 5,42; 6,60 | 4,5 |
| `text-success` / `panel`, własne tło | 5,08 / 4,52 | 8,48 / 7,12 | 4,5 |
| `text-warning` / `panel`, własne tło | 5,73 / 5,29 | 8,81 / 7,16 | 4,5 |
| UI: `border-control` / `panel`, `page` | 3,65 / 3,41 | 3,85 / 4,25 | 3 |
| UI: `focus-ring` / `page`, `panel` | 5,40 / 5,78 | 9,30 / 8,44 | 3 |
| UI: `action-primary` / `page`, `panel` | 3,08 / 3,30 | 8,42 / 7,63 | 3 |
| dekoracja: `border-divider` / `page` | 1,22 | 1,41 | — (linie wierszy nie są granicą kontrolki) |

Najmniejszy zapas: `text-success` na własnym tle (4,52) i `action-primary` względem tła w jasnym motywie (3,08). Przy każdej zmianie tych wartości kontrast liczy się od nowa (strona „Kolor” w Storybooku).

## Decyzje, które nie są tokenami

**Zasady:**

- Jedna akcja główna na ekranie, reszta drugorzędna lub linki (R01.6, R05.3).
- Wiersze dzielone liniami, nie karty z cieniem (R01.4); gęsto w listach i tabelach, przestronnie w rezerwacji i pokoju (K1).
- Mono tylko dla kodu (R01.2); szeryf tylko w dużych nagłówkach P1 i P3 (K6).
- Status zawsze z ikoną lub tekstem, nie samym kolorem (WCAG 1.4.1).
- Zasada 12 h pełnym tekstem przy akcji (A04).
- Bez gradientów, szkła, iskierek (A01); jedyne odliczanie to blokada terminu (A02); bez punktów i odznak (A03).
- Humor tylko w pustych stanach (K5); prosty język, błąd mówi co zrobić (R05.2).
- Czas w strefie użytkownika (reguła 10 briefu); autor i godzina przy wiadomości (R02.3).
- Powiadomienia tylko o tym, co wymaga działania (R02.4); bez emoji, ikony funkcyjne (R02.5).

**Cechy komponentów:**

- Nawigacja z 5 pozycji (R02.6), dolny pasek < 768 px (KONCEPCJA §3.2).
- Lista i tabela mają gęsty wariant (`body-dense`, `space-row-y`).
- Przycisk akcji głównej: bursztyn z tekstem atramentowym; drugorzędny: panel z `border-control`.
- Rozmowa w centrum tylko w S1 i U6 (K2).
