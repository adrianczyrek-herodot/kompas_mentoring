# Tokeny: Kompas

- **Data:** 2026-11-11, zatwierdził Adrian Czyrek.
- **Źródło decyzji:** `lekcja-06/referencje.md`.
- **Istniejące tokeny:** `packages/ui/src/styles/globals.css` (shadcn/ui + Tailwind CSS 4, jasny i ciemny motyw). Plik `packages/ui/src/tokens.css` nie istnieje. `kompas-mentoring/mockupy/styles.css` to starsza kopia palety mockupu i nie jest źródłem tokenów.
- **Nazwy:** istniejące nazwy shadcn (`background`, `primary`, `muted-foreground`, `border`…) opisują przeznaczenie, więc są warstwą znaczeniową. Pod nimi dochodzi warstwa surowa. Shadcnowe `accent` to tło najechania, a nie akcent marki. Akcentem marki jest `primary`.
- **Rozstrzygnięcia w tym kroku:**
  - akcja główna w rdzy (W1, zgodnie z K4), zieleń znika z interfejsu;
  - ciemny motyw ocieplony;
  - kroje systemowe, jak dziś;
  - przyjęte wartości: tekst 16 px / 1,5, tekst gęsty 14 px / 1,4, sekcje 32 px, ruch 150 ms;
  - cień nakładek odrzucony, więc to luka.
- **Kontrast:** liczony wzorem WCAG 2.x dla obu motywów. Tekst ≥ 4,5 : 1, elementy interfejsu ≥ 3 : 1.

Nic w tym pliku nie jest jeszcze wdrożone w `globals.css`.

| token | warstwa | wartość | pochodzenie | gdzie używać | gdzie nie używać |
|---|---|---|---|---|---|
| `--paper` | surowa | `#f6f3ec` (istnieje) | — | tylko w pliku tokenów | w komponentach |
| `--paper-raised` | surowa | `#ffffff` (istnieje) | — | tylko w pliku tokenów | w komponentach |
| `--paper-sunken` | surowa | `#efeae0` (istnieje) | — | tylko w pliku tokenów | w komponentach |
| `--ink` | surowa | `#17201e` (istnieje) | — | tylko w pliku tokenów | w komponentach |
| `--stone-600` | surowa | `#5c554b` (nowa, zastępuje chłodne `#4a5552`) | — | tylko w pliku tokenów | w komponentach |
| `--stone-500` | surowa | `#8a8174` (nowa) | — | tylko w pliku tokenów | w komponentach |
| `--stone-200` | surowa | `#e3ddd1` (istnieje) | — | tylko w pliku tokenów | w komponentach |
| `--rust-700` | surowa | `#a34a12` (nowa) | — | tylko w pliku tokenów | w komponentach |
| `--rust-800` | surowa | `#873c0d` (nowa) | — | tylko w pliku tokenów | w komponentach |
| `--amber-600` | surowa | `#c0601a` (nowa, zastępuje `#e07b2f`) | — | tylko w pliku tokenów | w komponentach |
| `--amber-100` | surowa | `#fbeadb` (istnieje) | — | tylko w pliku tokenów | w komponentach |
| `--red-700`, `--red-100` | surowa | `#b4352a`, `#fbe5e2` (istnieją) | — | tylko w pliku tokenów | w komponentach |
| `--green-600`, `--green-100` | surowa | `#2f7a4a`, `#e2f2e7` (istnieją) | — | tylko w pliku tokenów | w komponentach |
| `--yellow-800`, `--yellow-100` | surowa | `#8a5a00` (nowa, było `#9a6400`), `#fdf1d6` (istnieje) | — | tylko w pliku tokenów | w komponentach |
| `--night` | surowa (ciemny) | `#171411` (nowa, było `#0e1615`) | — | tylko w pliku tokenów | w komponentach |
| `--night-raised` | surowa (ciemny) | `#211d19` (nowa, było `#152120`) | — | tylko w pliku tokenów | w komponentach |
| `--night-line` | surowa (ciemny) | `#3a332c` (nowa, było `#2a3532`) | — | tylko w pliku tokenów | w komponentach |
| `--night-stone-400` | surowa (ciemny) | `#7a7062` (nowa, było `#34413e`) | — | tylko w pliku tokenów | w komponentach |
| `--night-text` | surowa (ciemny) | `#efe9e1` (nowa, było `#e7efec`) | — | tylko w pliku tokenów | w komponentach |
| `--night-muted` | surowa (ciemny) | `#b5ab9d` (nowa, było `#a9b6b2`) | — | tylko w pliku tokenów | w komponentach |
| `--amber-300`, `--amber-400` | surowa (ciemny) | `#f0a060` (istnieje), `#e48a45` (nowa) | — | tylko w pliku tokenów | w komponentach |
| ciemne tła stanów | surowa (ciemny) | `#3a2a1c`, `#1b3324`, `#3a2f16` (istnieją) | — | tylko w pliku tokenów | w komponentach |
| `--font-sans` | surowa | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (istnieje) | — | tylko w pliku tokenów | w komponentach |
| `--font-mono` | surowa | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` (istnieje) | — | tylko w pliku tokenów | w komponentach |
| `--font-serif` | surowa | `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif` (istnieje) | — | tylko w pliku tokenów | w komponentach |
| skala odstępów | surowa | 4, 8, 12, 16, 24, 32, 48 px | prompt tokenów §4 | tylko w pliku tokenów | wartości spoza skali w komponentach |
| `--radius-sm` … `--radius-xl` | surowa | 6, 8, 10, 14 px (istnieją) | — | tylko w pliku tokenów | w komponentach |
| `--background` | znaczeniowa | jasny `--paper`, ciemny `--night` | R03.1, R04.1 | tło strony | tło pól formularza |
| `--foreground` | znaczeniowa | jasny `--ink`, ciemny `--night-text` | R03.1 („atrament”) | tekst główny | — |
| `--card` | znaczeniowa | jasny `--paper-raised`, ciemny `--night-raised` | R01.4 | panele, listy, dialogi | tło całej strony |
| `--muted` | znaczeniowa | jasny `--paper-sunken`, ciemny `--night-raised` | R04.1 | tło drugorzędnych obszarów, kod w tekście | akcje |
| `--muted-foreground` | znaczeniowa | jasny `--stone-600`, ciemny `--night-muted` | R01.5 → P1, R04.1 | metadane w wierszach, podpisy, godziny wiadomości (R02.3) | treść główna, ceny, zasady anulowania (A04) |
| `--border` | znaczeniowa | jasny `--stone-200`, ciemny `--night-line` | R01.4 | cienkie linie między wierszami, podział sekcji | jedyny obrys pola formularza (za słaby kontrast) |
| `--input` | znaczeniowa | jasny `--stone-500`, ciemny `--night-stone-400` | WCAG 1.4.11, brief C6 | obramowanie pól, pól wyboru, przełączników | linie dekoracyjne |
| `--primary` | znaczeniowa | jasny `--rust-700`, ciemny `--amber-300` | R06.2, K4, P2, R05.3 | jedna akcja główna na ekranie | linki w tekście, ikony, nagłówki, tła sekcji (R04.2) |
| `--primary-foreground` | znaczeniowa | jasny `#ffffff`, ciemny `--night` | — | tekst na akcji głównej | — |
| `--primary-hover` | znaczeniowa (nowa) | jasny `--rust-800`, ciemny `--amber-400` | P2 | najechanie i naciśnięcie akcji głównej | — |
| `--ring` | znaczeniowa | `var(--primary)` (było zielone `#1d5f53`) | WCAG 2.4.7 | obrys fokusu | dekoracja |
| `--secondary`, `--secondary-foreground` | znaczeniowa | `--paper-sunken` / `--ink`; ciemny `--night-raised` / `--night-text` (było zielone) | R04.2 (akcent rzadko), K4 | akcje drugorzędne | akcja główna |
| `--accent`, `--accent-foreground` (shadcn) | znaczeniowa | `--paper-sunken` / `--ink`; ciemny `--night-raised` / `--night-text` | — | tło najechania w menu i listach | jako akcent marki |
| `--signal`, `--signal-soft` | znaczeniowa | jasny `--amber-600` / `--amber-100`, ciemny `--amber-300` / `#3a2a1c` | K4 („i stany”) | oceny, wyróżnienie „Nowy mentor”, odliczanie blokady terminu | przyciski, sztuczna presja (A02) |
| `--destructive` | znaczeniowa | jasny `--red-700`, ciemny `#f07b6f` (istnieje) | WCAG 1.4.1, K4 | obrys, ikona i tekst akcji niszczącej, komunikaty błędów | wypełnienie przycisku (nie do odróżnienia od `--primary`) |
| `--success`, `--success-soft` | znaczeniowa | jasny `--green-600` / `--green-100`, ciemny `#6fcf8f` / `#1b3324` | stany | komunikaty powodzenia | dekoracja, akcje |
| `--warning`, `--warning-soft` | znaczeniowa | jasny `--yellow-800` / `--yellow-100`, ciemny `#e8b85a` / `#3a2f16` | stany | ostrzeżenia, np. zbliżający się limit 12 h | dekoracja, akcje |
| `--font-body` | znaczeniowa (nowa) | `var(--font-sans)` | K6, R05.1 | cały tekst i dane | — |
| `--font-code` | znaczeniowa (nowa) | `var(--font-mono)` | R01.2 → P4 | kod w czacie (S1, U6) i w notatkach po sesji (M4, U9) | nazwy, liczby, etykiety |
| `--font-display` | znaczeniowa (nowa) | `var(--font-serif)` | R03.2, K6 | duże nagłówki strony startowej i profilu mentora | nagłówki w aplikacji (dziś szeryf dostają wszystkie h1–h3, do zmiany) |
| `--text-body` | znaczeniowa (nowa) | 16 px, interlinia 1,5 | R05.1 | tekst główny, formularze, rezerwacja, zasady, błędy | metadane w gęstych listach |
| `--text-dense` | znaczeniowa (nowa) | 14 px, interlinia 1,4 | R01.1, K1 | metadane w listach i tabelach | tekst w rezerwacji, zasady anulowania, komunikaty błędów |
| `--space-group` | znaczeniowa (nowa) | 8 px | prompt tokenów §4 | w grupie: etykieta i pole, ikona i tekst, autor i godzina | między grupami |
| `--space-groups` | znaczeniowa (nowa) | 16 px | prompt tokenów §4 | między grupami w panelu | wewnątrz grupy |
| `--space-panel` | znaczeniowa (nowa) | 16 px | K1 (gęsto) | wnętrze paneli i list | rezerwacja, pokój sesji |
| `--space-panel-roomy` | znaczeniowa (nowa) | 24 px | K1 (przestronnie) | rezerwacja U1–U4, pokój U6 | listy, tabele |
| `--space-section` | znaczeniowa (nowa) | 32 px | prompt tokenów §4 | między sekcjami strony | wewnątrz panelu |
| `--size-target-min` | znaczeniowa (nowa) | 44 px | K1 | minimalna wysokość i szerokość celu dotyku | — |
| `--radius-control` | znaczeniowa (nowa) | `var(--radius-md)`, 8 px | A01 (bez dużych zaokrągleń) | przyciski, pola | panele |
| `--radius-panel` | znaczeniowa (nowa) | `var(--radius-lg)`, 10 px | A01 | panele, dialogi | `--radius-xl` na zwykłych elementach |
| `--duration-feedback` | znaczeniowa (nowa) | 150 ms | R02.2 | najechanie, naciśnięcie, pojawienie się stanu | dodanie wysłanej wiadomości (pojawia się od razu, bez animacji) |
| `--list-row-padding-y` | komponentu (nowa) | 12 px (ze skali) | R01.1, K1 | wiersz listy i tabeli | przyciski |
| `--list-row-divider` | komponentu (nowa) | `1px solid var(--border)` | R01.4 | podział wierszy | ramka wokół karty |
| `--button-min-height` | komponentu (nowa) | `var(--size-target-min)` | K1 | wszystkie przyciski | — |

## Pary kolorów i kontrast

Wartości po zatwierdzeniu. Żadna z zatwierdzonych wartości nie zmieniła się względem propozycji, więc ponowne liczenie nie było potrzebne.

**Jasny motyw**

| Para | Kontrast | Wynik |
|---|---|---|
| `--foreground` na `--background` | 15,02 | OK |
| `--foreground` na `--card` | 16,64 | OK |
| `--foreground` na `--muted` | 13,88 | OK |
| `--muted-foreground` na `--background` | 6,64 | OK |
| `--muted-foreground` na `--card` | 7,35 | OK |
| `--muted-foreground` na `--muted` | 6,13 | OK |
| `--muted-foreground` na `--signal-soft` | 6,27 | OK |
| `--primary-foreground` na `--primary` | 5,92 | OK |
| `--primary-foreground` na `--primary-hover` | 7,83 | OK |
| `--primary` (tekst, obrys) na `--background` | 5,34 | OK |
| `--primary` na `--card` | 5,92 | OK |
| `--primary` na `--muted` | 4,94 | OK |
| `--input` na `--card` | 3,84 | OK |
| `--input` na `--background` | 3,46 | OK |
| `--ring` na `--background` | 5,34 | OK |
| `--signal` (element) na `--background` | 3,84 | OK |
| `--signal` na `--card` | 4,26 | OK jako element. Jako tekst nie przechodzi (4,26), więc `--signal` nie służy do tekstu. |
| `--foreground` na `--signal-soft` | 14,18 | OK |
| `--destructive` na `--background` | 5,44 | OK |
| `--destructive` na `--card` | 6,03 | OK |
| biały na `--destructive` | 6,03 | OK |
| `--success` na `--success-soft` | 4,52 | OK, na granicy |
| `--warning` na `--warning-soft` | 5,29 | OK |
| `--warning` na `--card` | 5,93 | OK |
| `--border` na `--card` | 1,35 | Linia dekoracyjna, nie podlega 1.4.11. Nie może być jedynym obrysem pola. |
| `--border` na `--background` | 1,22 | Jak wyżej. |
| `--primary` przy `--destructive` | 1,02 | Kolorem nie do odróżnienia, zob. zasada akcji niszczącej. |

**Ciemny motyw (ocieplony)**

| Para | Kontrast | Wynik |
|---|---|---|
| `--foreground` na `--background` | 15,21 | OK |
| `--foreground` na `--card` | 13,88 | OK |
| `--muted-foreground` na `--background` | 8,10 | OK |
| `--muted-foreground` na `--card` | 7,40 | OK |
| `--primary-foreground` na `--primary` | 8,65 | OK |
| `--primary-foreground` na `--primary-hover` | 7,01 | OK |
| `--primary` na `--background` | 8,65 | OK |
| `--primary` na `--card` | 7,89 | OK |
| `--signal` na `--signal-soft` | 6,48 | OK |
| `--foreground` na `--signal-soft` | 11,40 | OK |
| `--input` na `--card` | 3,44 | OK |
| `--destructive` na `--card` | 6,19 | OK |
| `--success` na `--card` | 8,77 | OK |
| `--success` na `--success-soft` | 7,12 | OK |
| `--warning` na `--card` | 9,12 | OK |
| `--warning` na `--warning-soft` | 7,16 | OK |
| `--border` na `--card` | 1,35 | Linia dekoracyjna, jak w jasnym. |

**Poprawione względem obecnego `globals.css`**

| Para | Było | Jest |
|---|---|---|
| `--input` jasny na `--card` | `#e3ddd1`, 1,35 | `--stone-500`, 3,84 |
| `--input` ciemny na `--card` | `#34413e`, 1,55 | `--night-stone-400`, 3,44 |
| `--signal` na `--background` | `#e07b2f`, 2,69 | `--amber-600`, 3,84 |
| biały na bursztynie `#e07b2f` | 2,98 | bursztyn nie jest tłem przycisku |
| `--warning` na `--warning-soft` | `#9a6400`, 4,46 | `--yellow-800`, 5,29 |

`--ink-3` `#7b8582` z mockupu na paper ma 3,43, poniżej progu. Został tylko w mockupie i nie przechodzi do `packages/ui`.

## Decyzje, które nie są tokenami

### Zasady

- **Jedna akcja główna na ekran.** W `--primary`, reszta jako akcje drugorzędne (P2, R05.3, R01.6).
- **Akcent tylko z przeznaczeniem.** Akcent nie służy do dekoracji, nagłówków ani tła sekcji (P3, R04.2, K4).
- **Gęstość zależy od miejsca.** Gęsto w listach i tabelach: lista mentorów, Moje sesje, panel M2, zarobki M5. Przestronnie w rezerwacji i pokoju sesji (K1).
- **Krój o stałej szerokości tylko dla kodu** (P4).
- **Szeryf tylko w dużych nagłówkach** strony startowej i profilu mentora. Trzeba zmienić regułę `h1, h2, h3 { font-serif }` w `globals.css` (K6).
- **Powiadomienia oszczędnie.** Tylko o tym, co wymaga działania albo zmienia termin. Bez liczników przy każdym elemencie (P6).
- **Bez emoji.** Bez reakcji emoji i emoji w interfejsie, ikony tylko funkcyjne (P7).
- **Ton.** Bezpośredni i ludzki. Humor tylko w pustych stanach i powitaniach, nigdy przy pieniądzach, terminach i sporach (K5, R06.1).
- **Prosty język.** Komunikat błędu mówi, co poprawić (R05.2).
- **Bez drobnego druku.** Zasady anulowania i cena pełnym tekstem w `--text-body` przy akcji, nie w `--muted-foreground` i nie w przypisach (A04).
- **Bez sztucznej presji.** Bez „zostały 2 miejsca”, przekreślonych cen i wyskakujących promocji. Odliczanie blokady terminu zostaje (A02).
- **Bez gamifikacji.** Bez punktów, serii, odznak i konfetti. Postęp jako cel i kamienie milowe (A03).
- **Zakazane w kodzie (A01):** `linear-gradient` z fioletem, `background-clip: text`, `backdrop-filter`, półprzezroczyste białe tła kart, ikona `Sparkles` lub ✨, `--radius-xl` na zwykłych elementach.
- **Bez cieni na kartach i wierszach list.** Podział robią linie (R01.4).
- **Ruch.** Szanujemy `prefers-reduced-motion`.

### Cechy komponentów

- **Liczby:** godziny i kwoty w siatce slotów U1, w zarobkach M5 i w cenach z `font-variant-numeric: tabular-nums` (R01.3, P5).
- **Wiersz listy:** `--list-row-padding-y`, linia `--list-row-divider`, bez cienia, metadane w `--text-dense` i `--muted-foreground` (R01.1, R01.4).
- **Akcja niszcząca:** obrys, ikona i słowo w `--destructive`, bez wypełnienia, bo kolorem nie odróżnia się od `--primary` (W1, K4).
- **Nawigacja:** dolna, stała, 5 pozycji, bez list kanałów (P8).
- **Układ „rozmowa w centrum”** tylko w S1 Wiadomości i w czacie U6 (P9, R02.1).
- **Wiadomość:** autor i godzina w strefie użytkownika (R02.3). Wysłana pojawia się od razu, a gdy się nie wyśle, ma „Ponów” (R02.2).
- **Przycisk:** wysokość co najmniej `--button-min-height` (K1).

## Luki

- **Cień nakładek** (menu, dialogi, wysuwane panele) jest bez wartości, bo propozycja `--shadow-overlay` została odrzucona. Na razie nakładki odcinają się samym obrysem `--border` i tłem `--card`.
- **Skala nagłówków:** jest tylko `--text-body` i `--text-dense`. Rozmiarów h1–h3 i `--font-display` nie ustalono.
- **Ruch:** jest tylko `--duration-feedback`. Brak krzywej przyspieszenia i czasu dla dłuższych przejść.
- **Pokój sesji U6:** brak referencji, więc tokeny wideo (tło sceny, pasek sterowania) nie powstały.
