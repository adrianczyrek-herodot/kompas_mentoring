---
title: Uwagi z mapy ekranów F1 do specyfikacji (propozycja zmian, bez edycji)
date: 2026-11-22
agent: pi (cezar, quick-task, gałąź cez/5041d937)
status: partial
spec: .ai/specs/2026-11-10-f1-tozsamosc.md
branch: cez/5041d937
---

# Uwagi z mapy ekranów F1 do specyfikacji

## Zadanie

Zadanie zlecone w szablonie z nieuzupełnionymi materiałami (placeholdery `{{…}}`).
Cel: dla każdej decyzji z mapy ekranów i każdej uwagi z prototypu zaproponować
w specyfikacji kryterium akceptacji (sprawdzalne) albo zapisaną decyzję „tego nie
robimy i dlaczego”; uwagi z innych przepływów przypisać do właściwych specyfikacji;
wyniki person wpisać tylko jako pytania do sprawdzenia; przy kryteriach dopisać
identyfikator ekranu (s01…); na górze specyfikacji podać ścieżkę do folderu prototypu.
Bez zgody właściciela nie zmieniać plików.

## Wejścia — co udało się ustalić

| Wejście | Ścieżka | Stan |
|---|---|---|
| Mapa ekranów | `prototypes/konta-i-role/mapa-ekranow.md` — była tylko na gałęzi `cez/8a65024e`; scalona do `cez/5041d937` | odczytana (11 ekranów s01–s11, 24 scenariusze, 15 GAP, 20 luk DS) |
| Prototyp | `prototypes/discovery/konta-i-role/revision-001/` (`index.html`, `README.md`, `prototype.json`) — scalony razem z mapą; README podaje założenia A-01–A-10 i 24 scenariusze | odczytany; **folder prototypu poprawiony w specyfikacji** (wcześniej wpisany `prototypes/konta-i-role/`, gdzie leży tylko mapa) |
| Uwagi z prototypu (`prototype-feedback.md`) | brak w repo — plik produkuje dopiero eksport z silnika przeglądu („Export for repository”, `public/review/comments.js` ma `operations: []` we wszystkich gałęziach) | **brak** |
| Raport person (`report.md`) | brak (brak `personas.md` z lekcji 4, brak raportu `om-synthetic-users`) | **brak** |
| Specyfikacja docelowa | `.ai/specs/2026-11-10-f1-tozsamosc.md` (mapa dotyczy przepływu F1) | przeczytana, 95 linii |
| Specyfikacje pokrewne | `2026-11-11-design-system-storybook.md`, `backlog.md`, `2026-10-21-tech-stack-i-standardy-inzynieryjne.md` | przeczytane we fragmentach |

Brak specyfikacji F3/F4/F5 (istnieją tylko jako epiki E3 i pozycje Later L1/L2
w `backlog.md`) — dlatego uwagi o innych przepływach nie mają dokąd trafić poza
`backlog.md` i specyfikację stacku.

## Przebieg

- 12:12 — start; odczyt handoffu, `.ai/lessons.md`, `AGENTS.md` (zasady .ai/).
- 12:15 — szukanie materiałów: brak `mapa-ekranow.md`, `prototype-feedback.md`,
  `report.md` na gałęzi zadania; mapa znaleziona w worktree `8a65024e`.
- 12:20 — odczyt mapy, specyfikacji F1, DS, backlogu (E1–E4, Later), specyfikacji stacku.
- 12:22 — propozycja zmian (poniżej), bez edycji plików — czekam na zgodę.
- 12:40 — zgoda właściciela („wprowadź wszystkie”); uwagi z prototypu zapowiedziane
  w czacie. Wprowadzone zmiany w trzech specyfikacjach + ten log, commit `8693985`.
- 12:55 — dalsza praca: scalona gałąź `cez/8a65024e` (mapa + prototyp rewizji 001),
  `prototype:` poprawiony na `prototypes/discovery/konta-i-role/revision-001/`,
  rozbieżności prototypu (A-05, DS-15, link 403 → U4/M2) zapisane w „Decyzjach
  i zmianach”, dodane 4 pytania do sprawdzenia, poprawiony tag [s05] w kryterium
  stanu ładowania.

## Propozycja zmian

### 1. Nagłówek specyfikacji F1 (meta)

- **M1.** Frontmatter: `prototype: prototypes/konta-i-role/` (folder prototypu F1)
  oraz `related:` += `prototypes/konta-i-role/mapa-ekranow.md`,
  `prototypes/kompas-flow/` (szary prototyp P1–P3/U1–U5, źródło danych demo).
- **M2.** Nowa sekcja `## Mapa ekranów (s01–s11)` po „Kontekst i cel”: tabela
  ID | ekran | rola | kryterium (numer) + zdanie „identyfikatory s01… są stałe,
  komentarze w prototypie przypinają się do nich”.
- **M3.** Sekcja `## Pytania do sprawdzenia (hipotezy)` — pusta z adnotacją
  „brak raportu person; wpiszemy hipotezy po jego dostarczeniu” (wyniki person
  nie mogą wejść jako wymagania).
- **M4.** Uwaga o zależności: mapa leży na niezescalonej gałęzi `cez/8a65024e`;
  odnośnik w specyfikacji zacznie działać po jej scaleniu.

### 2. Kryteria akceptacji w F1 (per ekran)

- **C1 [s01]** Po przekroczeniu limitu prób logowania formularz pokazuje
  „Za dużo prób. Spróbuj ponownie za N min” (N z okna limitu) i nie wysyła żądań
  do końca okna; E2E: kolejne błędne próby → 429 → komunikat.
- **C2 [s01, s02, s05]** Przycisk wysyłki ma stan ładowania i blokuje podwójne
  wysłanie; E2E: dwa kliknięcia = jedno żądanie.
- **C3 [s01, s03]** Wylogowanie przekierowuje na P1 z toastem; „Wyloguj wszędzie”
  kończy wszystkie sesje łącznie z bieżącą (GAP-11).
- **C4 [s02]** Schematy zod w `packages/contracts` odrzucają: imię < 2 lub > 50
  znaków, e-mail niezgodny z RFC, hasło < 10, brak zgody na regulamin/politykę;
  zgoda marketingowa opcjonalna — testy jednostkowe + E2E s02.
- **C5 [s02]** Rejestracja istniejącym e-mailem → komunikat + link „Zaloguj się”
  (stan konflikt; SC-06).
- **C6 [s02, s06]** HIBP niedostępne (timeout/5xx) → fail-closed: rejestracja i
  zmiana hasła kończą się komunikatem „Nie możemy teraz sprawdzić hasła…”
  i wpisem w logu (GAP-10, Q8).
- **C7 [s03]** Baner „Twój wybrany termin jest zachowany — po zalogowaniu wrócisz
  do płatności” tylko wtedy, gdy `returnTo` wskazuje trasę rezerwacji; E2E: U1 →
  logowanie → powrót bez utraty wybranego slotu.
- **C8 [s06]** S3 w zakresie Q7: imię, zmiana hasła (HIBP + unieważnienie innych
  sesji), zgoda marketingowa, „Wyloguj wszędzie”, eksport i usunięcie jako
  zapisane żądanie — testy integracyjne + E2E s06.
- **C9 [s06]** Odznaczenie zgody marketingowej zapisuje od razu nową decyzję
  `granted: false` z wersją dokumentu (bez przycisku „Zapisz”); test: dwie
  decyzje, najnowsza `granted: false` (GAP-12).
- **C10 [s06]** Drugie oczekujące żądanie tego samego rodzaju (eksport/usunięcie)
  jest odrzucane komunikatem „Masz już oczekujące żądanie” (GAP-13, indeks
  unikalny już jest w decyzji z 2026-11-10).
- **C11 [s07]** Admin z ważną sesją, ale bez 2FA, wchodzi na `/admin/*` →
  przekierowanie na s07 z komunikatem „Skonfiguruj 2FA, aby kontynuować”
  (nie wylogowanie); po konfiguracji TOTP — wejście; E2E (GAP-07, SC-13).
- **C12 [s01, s07]** Po 12 h od zalogowania sesja admina daje `null`, a następne
  żądanie przekierowuje na s01 z komunikatem „Sesja administratora wygasła
  (12 h) — zaloguj się ponownie”, odróżnialnym od sesji użytkownika (GAP-08).
- **C13 [s08, s09]** s08 (403) i s09 (404) istnieją jako trasy z layoutem
  produktu; s08 linkuje do strony startowej roli (w F1: student i mentor →
  `/konto`, admin → `/admin`), s09 nie ujawnia istnienia zasobu; E2E: student →
  `/mentor`, mentor → `/admin/*`, cudze konto (SC-16–SC-18).
- **C14 [s10]** Rejestracja wysyła link weryfikacyjny (adapter logujący, poza
  produkcją w logu), a s10 obsługuje token: sukces → `returnTo`/strona startowa,
  token wygasły → „Link wygasł lub jest nieprawidłowy” + „Wyślij nowy link”;
  E2E oba warianty (SC-19, SC-20). **Zmiana zakresu** — patrz pytanie P2.
- **C15** Przypisanie identyfikatorów do istniejących kryteriów: logowanie → s01,
  rejestracja/wylogowanie → s02/s06, Google/LinkedIn → s01/s02, `returnTo` → s03,
  403/404 → s08/s09, 2FA → s07, E2E 360/1280 + axe → s01/s02/s06. Kryterium
  „`pnpm lint…`” i przegląd człowieka bez ID (infrastruktura/proces).

### 3. Zapisane decyzje „tego nie robimy w F1” (z powodem)

- **D1 [s04, s05]** Reset hasła („Nie pamiętasz hasła?”) i ustawienie nowego
  hasła poza F1 — wymagają wysyłki e-maili (decyzja z 2026-11-10, krok 5;
  `EmailSender` z SES powstaje w E3-S8). Kryteria → `backlog.md`, E3-S9 T2.
  **Uwaga: mapa twierdzi „F1 Q7: reset hasła w F1” — sprzeczność, pytanie P1.**
- **D2 [s11]** Ponowna akceptacja regulaminu poza F1 — Q6: w F1 tylko zapis
  wersji; ekran powstaje przy pierwszej realnej zmianie dokumentu (GAP-01).
- **D3 [s01, s11]** Stan „wersja regulaminu zmieniona” na logowaniu nie jest
  obsługiwany w F1 — brak zmiany dokumentu w MVP; po pierwszej zmianie wchodzi
  s11, nie osobny modal (GAP-02).
- **D4 [s03]** Zewnętrzny `returnTo` ignorowany — już w wymaganiu 4; decyzja
  potwierdza brak strony pośredniej/ostrzeżenia.
- **D5 [s06]** Sekcje „Metody płatności”, „Powiadomienia”, „Prywatność” oraz
  „Dodaj kartę” nie wchodzą do F1 — metody płatności to F4 (L1), powiadomienia
  w aplikacji E3-S8, push L9. W prototypie mogą istnieć jako atrapa z dopiskiem.
  (Mapa pokazuje je w s06 — do poprawy w mapie.)
- **D6 [s06]** Status żądania eksportu/usunięcia (oczekujące/gotowe/wygasłe) poza
  F1 — realizacja w F8 (L5); w F1 tylko zapis żądania + toast (GAP-13).
- **D7** Konta demo i scenariusze SC-01…SC-24 są artefaktem prototypu, nie
  wymaganiem produktu — nie przenosimy ich do specyfikacji (zapisana decyzja).
- **D8** Role: konto ma jedną rolę w MVP (`student` | `mentor` | `admin_*`);
  przełączanie ról w nagłówku i konto z dwiema rolami poza MVP (GAP-06) —
  **wymaga Twojej zgody**, bo KONCEPCJA opisuje przełączanie ról. Jeśli się
  zgadzasz, do „Decyzji i zmian” wchodzi też zdanie, że użytkownik, który chce
  się uczyć i mentorować, zakłada drugie konto.

### 4. Uwagi o innych przepływach (przypisanie)

- **X1 [s10 → F3] Blokada „nieweryfikowany e-mail” w U1/U2** (GAP-03, GAP-05) —
  brak specyfikacji F3; docelowo `.ai/specs/YYYY-MM-DD-f3-dostepnosc-rezerwacje.md`
  (E3-S1), teraz wpis w `backlog.md`: E3-S4 T2 + E3-S9 T1 (baner w U1/U2
  z „Wyślij link ponownie”).
- **X2 [s06 → E3-S9] Zmiana e-maila z weryfikacją** (GAP-04) — już zapisane
  w `backlog.md` E3-S9 T3; w F1 tylko potwierdzenie decyzji (bez zmian).
- **X3 [U4/U5 → E3-S5] Mentor `suspended`, uczeń z zaplanowaną sesją** (GAP-09) —
  `backlog.md` E3-S5 T2 (stan w U4/U5 + co z sesją) i E3-S6 (anulowanie).
- **X4 [U5 → E3-S6] Anulowanie sesji próbnej < 12 h: przepada czy zwrot?**
  (GAP-15) — `backlog.md` E3-S6 T1 jako pytanie do właściciela.
- **X5 [U2 → F4/L1] BLIK cykliczny `recurring_not_supported_by_bank`** (GAP-14) —
  brak specyfikacji F4; `backlog.md` L1 (checkout: obsługa błędu banku).
- **X6 [U6 → F5/L2] „Dołączanie mentora” / pokój sesji** (uwaga z szarego
  prototypu wskazana w zadaniu; treści uwag brak) — należy do F5: `backlog.md` L2
  i specyfikacja stacku §flows (`2026-10-21-…`, wiersz F5: pokój LiveKit,
  obecność, no-show, rozliczenie). Do zapisania jako pytania: co widzi uczeń,
  gdy mentor nie dołączy w 10 min (KONCEPCJA: powrót sesji do salda).

### 5. Design system (`2026-11-11-design-system-storybook.md`)

- **S1 [s01–s03]** `Tabs variant="auth"` (DS-01) — partia 4 etapu 2, story + test
  w obu motywach.
- **S2 [s01, s02]** `Button variant="social"` + ikony dostawców (DS-02) — partia 4.
- **S3 [s02, s05, s06]** `PasswordField` z miernikiem (DS-03) — partia 4.
- **S4 [s01, s03]** `Notice` (DS-15) — decyzja: nie dodajemy nowego komponentu,
  banery robimy istniejącym `Alert` (warianty info/warn/error już są); wpis
  w „Czego brakuje”, żeby nikt nie tworzył drugiego banera.
- **S5** Katalog DS-04…DS-11, DS-14, DS-16…DS-20 dotyczy F2/F3 (Segmented,
  AvailabilityEditor, Stepper, PhotoUploader, VideoUploader, KycEmbed,
  EarningsPreview, EmptyState z akcją, Badge accent, Table z akcjami, DialogForm,
  Toast z akcją) — nie zmieniamy F1; przenosimy do `packages/ui/POSTEP.md`
  „Czego brakuje” i do zadań E2-S2/E2-S5/E3-S2/M5.
- **S6** Błąd w mapie: DS-12 (`HoldCountdown`) i DS-13 (`PolicyNotice`) są wpisane
  jako „Brak”, choć istnieją w `packages/ui/src/product/` — poprawka w mapie.

### 6. Ekrany bez kryterium

- **s04, s05** (reset hasła / nowe hasło) — poza F1 (D1); kryteria dopiero
  w specyfikacji F3 (dziś tylko `backlog.md` E3-S9 T2).
- **s11** (ponowna akceptacja regulaminu) — poza F1 (D2), bez kryterium.
- **s10** będzie mieć kryterium tylko po Twojej zgodzie na C14; w przeciwnym razie
  przechodzi do E3-S9 i też zostaje bez kryterium w F1.

## Wynik

Zmiany wprowadzone po zgodzie właściciela (commit `8693985`, następnie commit
z poprawką ścieżki prototypu i rozbieżności):

- `.ai/specs/2026-11-10-f1-tozsamosc.md` — `prototype: prototypes/discovery/konta-i-role/revision-001/`,
  sekcja „Mapa ekranów (s01–s11)”, 9 istniejących kryteriów z tagami ekranów,
  15 nowych kryteriów z ID, sekcja „Pytania do sprawdzenia (hipotezy)” z 4 pytaniami,
  krok 8 planu (s10 + s08/s09), 9 wpisów w „Decyzjach i zmianach”.
- `.ai/specs/2026-11-11-design-system-storybook.md` — 3 kryteria (Tabs auth,
  Button social, PasswordField), decyzja o partii 4 i braku komponentu `Notice`.
- `.ai/specs/backlog.md` — E3-S4 T2, E3-S5 T2, E3-S6 T1, E3-S9 T1/T2, L1, L2 + wpis
  w Decyzjach.
- `.ai/lessons.md` — dwie lekcje (placeholdery `{{…}}`; mapa vs folder prototypu).
- Scalenie `cez/8a65024e` (4 pliki: mapa + prototyp rewizji 001).

Ekrany bez kryterium: **s04, s05** (poza F1 → `backlog.md` E3-S9 T2) i **s11**
(poza F1 — decyzja Q6). Pozostałe osiem ma kryteria w specyfikacji F1.

## Weryfikacja

Brak zmian w kodzie i specyfikacjach — nie ma czego uruchamiać. Sprawdzone
odczytem: `.ai/specs/2026-11-10-f1-tozsamosc.md` (kryteria 1–9), `backlog.md`
(E1-S1/S2, E3-S4/S5/S6/S9, L1, L2), `2026-11-11-design-system-storybook.md`
(kryteria DS), `2026-10-21-tech-stack-i-standardy-inzynieryjne.md` (§flows, F5).

## Problemy i otwarte kwestie

- Brak `prototype-feedback.md` — właściciel zapowiedział wklejenie uwag w czacie;
  po ich otrzymaniu dopisujemy kryteria (z ID ekranu) albo pytania do sprawdzenia.
- Brak raportu person; prototyp rewizji 001 powstał bez panelu syntetycznego, więc
  hipotezy w specyfikacji są wyprowadzone z mapy, nie z badań — oznaczone jako pytania.
- Rozbieżności do poprawy **w prototypie, nie w specyfikacji**: A-05 (dwie role vs
  decyzja o jednej roli na konto), `Notice`/DS-15 (decyzja: `Alert`), link 403 →
  U4/M2 (w F1 `/konto` i `/admin`). README prototypu i mapa nadal mówią inaczej.
- Weryfikacja prototypu w przeglądarce nie została wykonana (`verification: not-run`).
- Sprzeczność mapa ↔ specyfikacja: reset hasła i weryfikacja e-maila (mapa: F1;
  specyfikacja: F3/E3-S9, decyzja z 2026-11-10 krok 5).
- Sprzeczność mapa ↔ specyfikacja: S3 z sekcjami płatności i powiadomień
  (Q7 ogranicza S3 do profilu, hasła, zgód, wylogowania, żądań).

## Wnioski

Do `.ai/lessons.md`: szablony zadań przekazywane z nieuzupełnionymi `{{…}}`
(nie pierwszy raz — patrz `runs/2026-11-21-przeglad-prototypu-kompas-flow.md`)
wymagają najpierw ustalenia materiałów po nazwach plików w repo, a brakujących
nie wolno zastępować domysłem.
## Uzupełnienie: uwagi z prototypu (PR #60)

Właściciel wskazał, że uwagi z prototypu są w najnowszym PR (#60, `feat(prototype): kompas-flow etap 3`). Weryfikacja: PR nie ma komentarzy ani recenzji na GitHubie, a `public/review/comments.js` na `main` ma `operations: []` — więc feedback to **notatki „Czego nie rozstrzyga” przy 23 ekranach** (`ScreenDef.notes`), README prototypu i pytania w jego specyfikacji. Przetworzone:

- 2 notatki dotyczą F1 (P4 polityka haseł/zgody → kryterium [s02]; S3 eksport/retencja → [s06] + F8), zapisane w „Decyzjach i zmianach” F1;
- 22 notatki przypisane do zadań w `backlog.md` → nowa sekcja „Pytania z notatek prototypu `kompas-flow` (PR #60)”;
- notatka o dołączaniu mentora (U6) i SLA odpowiedzi (M2) dopisane do L2 i E3-S7.
