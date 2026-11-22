# Prototyp F1: Tożsamość (Logowanie, Rejestracja, Role, Weryfikacja, Konto)

**Rewizja:** 001  
**Data:** 2026-11-22  
**Slug:** konta-i-role  
**Poprzednia rewizja:** brak (pierwsza wersja)  
**Brief:** `.ai/specs/product-brief.md`  
**Mapa ekranów:** `prototypes/konta-i-role/mapa-ekranow.md` (status: approved)  
**Panel syntetyczny:** nie używano  

---

## 1. Przepływ i granice symulacji

**Aktor:** Gość → Zalogowany użytkownik (student / mentor / admin)  
**Punkt startowy:** Ekran P4 — Logowanie (s01)  
**Cel sukcesu:** Zalogowany użytkownik widzi ekran S3 — Konto i ustawienia (s06) z poprawną rolą i danymi  

### Ekrany uwzględnione (11)

| ID | Ekran | Opis |
|---|---|---|
| s01 | P4 — Logowanie | Formularz e-mail/hasło, przyciski Google/LinkedIn, link do resetu, `returnTo` banner |
| s02 | P4 — Rejestracja | Imię, e-mail, hasło z miernikiem, wybór roli (student/mentor), zgody (regulamin wymagany, marketing opcjonalny) |
| s03 | P4 — Logowanie/Rejestracja z `returnTo` | Wariant s01/s02 z banerem „Twój termin jest zachowany” (osobna sekcja `#s03` nie istnieje — patrz usterka 1) |
| s04 | Reset hasła — żądanie linku | Pole e-mail, wysyłka linku (fake) |
| s05 | Reset hasła — nowe hasło | Dwa pola hasła z miernikiem, token z maila (valid/expired) |
| s06 | S3 — Konto i ustawienia | Profil, metody płatności, powiadomienia, prywatność (eksport/usunięcie), sekcja admina |
| s07 | Konfiguracja 2FA (TOTP) | Kod QR (symulowany), pole 6-cyfrowego kodu, weryfikacja |
| s08 | 403 — Brak uprawnień | Komunikat z linkiem do strony startowej roli |
| s09 | 404 — Nie znaleziono / Cudzy zasób | Komunikat nieujawniający istnienie |
| s10 | Weryfikacja e-maila | Loading → Success (zweryfikowany) / Error (link wygasł) + „Wyślij nowy” |
| s11 | Ponowna akceptacja regulaminu | Treść zmian v2.1, checkbox wymagany, zapis wersji |

### Stany na ekranie (47 łącznie)

Każdy ekran ma stany: **domyślny**, **ładowanie**, **sukces**, **błąd**, **pusty** (gdzie dotyczy), **konflikt** (email zajęty), **usługa niedostępna** (Google/LinkedIn/HIBP), **brak dostępu** (403/404).

### Wykluczone cele (poza prototypem)

- Pełny onboarding mentora (M1, 6 kroków) — F2
- Wyszukiwarka mentorów (P2), profil mentora (P3) — F2
- Rezerwacja sesji (U1–U3) — F3
- Panel mentora (M2–M5) — F2/F3
- Wiadomości (S1), Powiadomienia (S2) — F3/F6
- Prawdziwe API, baza danych, wysyłka e-maili, Stripe, LiveKit

---

## 2. Zasady biznesowe, nieroalscope, decyzje

| ID | Reguła / Decyzja | Źródło | Status | Ścieżka zmiany |
|---|---|---|---|---|
| R1 | Rejestracja e-mailem: imię, e-mail, hasło ≥10, nie z HIBP, regulamin wymagany, marketing opcjonalny | Spec F1, Wymagania 1 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R2 | Logowanie: komunikat „Nieprawidłowy e-mail lub hasło” bez wskazania pola; limit prób | Spec F1, Wymagania 2 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R3 | Sesje w bazie, cookie HttpOnly/Secure/SameSite=Lax; CSRF przez Better Auth | Spec F1, Wymagania 3 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R4 | `returnTo`: tylko ścieżki wewnętrzne, polityka `returnTo.policy.ts` | Spec F1, Wymagania 4 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R5 | Role: `student`, `mentor`, `admin_trust`, `admin_finance`; uprawnienia w stylu `booking.cancel.own` | Spec F1, Wymagania 5 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R6 | Zgody wersjonowane, zmiana wersji regulaminu wymusza ponowną akceptację (Q6) | Spec F1, Wymagania 6 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R7 | Admin wymaga 2FA przed dostępem do tras admina; sesja admina 12h bezwzględnie | Spec F1, Wymagania 7, Q5 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R8 | Weryfikacja e-maila wymagana przed pierwszą rezerwacją (Q2) | Spec F1, Q2 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R9 | Rejestracja „mentorować” → rola `mentor` + profil `draft` w `catalog` (Q3) | Spec F1, Q3 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R10 | Admini tylko z seeda/CLI, role `admin_trust`/`admin_finance`, 2FA przy pierwszym logowaniu (Q4) | Spec F1, Q4 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R11 | Sesje: użytkownicy 30 dni (odnawiane), admini 12 h (Q5) | Spec F1, Q5 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R12 | HIBP fail-closed, wyłączone w testach (Q8) | Spec F1, Q8 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |
| R13 | S3 w F1: profil, zmiana hasła, zgoda marketingowa, wyloguj wszędzie, eksport/usunięcie jako żądania (Q7) | Spec F1, Q7 | **Potwierdzone** | Spec F1 → Decyzje i zmiany |

### Niegoals (poza zakresem F1)

- Onboarding mentora (M1), weryfikacja mentorów (A1) — F2
- Płatności, ledger, plany, BLIK cykliczny — F4
- Pokój wideo (LiveKit), obecność, no-show — F5
- Wiadomości, spory, moderacja — F6
- Wypłaty, KSeF, DAC7 — F7
- Passkeys — v1.1

---

## 3. Dane demo (fikcyjne)

| Konto | Rola | E-mail | Hasło | Uwagi |
|---|---|---|---|---|
| Demo Student | `student` | `student@demo.kompas.pl` | `DemoPass123` | Saldo u Kasi: 3 sesje, plan aktywny 1×60 min |
| Demo Mentor | `mentor` (approved) | `mentor@demo.kompas.pl` | `DemoPass123` | Stawka 180 zł/h, 87 opinii, ocena 4.9 |
| Demo Mentor Draft | `mentor` (draft) | `mentor-draft@demo.kompas.pl` | `DemoPass123` | Profil w szkicu (krok 3) |
| Demo Admin Trust | `admin_trust` | `admin-trust@demo.kompas.pl` | `AdminPass123!` | 2FA skonfigurowane |
| Demo Admin Finance | `admin_finance` | `admin-finance@demo.kompas.pl` | `AdminPass123!` | 2FA skonfigurowane |
| Demo Guest | — | — | — | Niezalogowany |

**Stały „teraz”:** 2026-10-20T12:00:00+02:00 (Europe/Warsaw, letni czas)  
**Kody rabatowe:** `KOMPAS10` (−10% na sesję próbną)

---

## 4. Założenia symulacji [ASSUMPTION]

| ID | Założenie | Dlaczego potrzebne | Jak zweryfikować |
|---|---|---|---|
| A-01 | Google/LinkedIn działają z kluczami dev; bez kluczy przyciski ukryte | Q1 Spec F1 | Ustawienie zmiennych środowiskowych w preview |
| A-02 | HIBP fail-closed blokuje rejestrację/zmianę hasła przy niedostępnym API | Q8 Spec F1 | Test z wyłączonym HIBP / timeout API |
| A-03 | Weryfikacja e-maila blokuje U1/U2 do potwierdzenia | Q2 Spec F1, GAP-03 mapy | Próba wejścia na U1 z nieweryfikowanym kontem |
| A-04 | Zmiana e-maila w S3 trafia do F8 (nie F1) | Q7 Spec F1, GAP-04 mapy | Decyzja właściciela produktu |
| A-05 | Użytkownik może mieć rolę student I mentor — przełącznik w nagłówku | GAP-06 mapy | **Odrzucone 2026-11-22** — konto ma jedną rolę w MVP; drugą rolę zakłada się osobnym kontem (spec F1, „Decyzje i zmiany”) |
| A-06 | Admin bez 2FA widzi ekran s07 (konfiguracja) z komunikatem, nie jest wylogowywany | GAP-07 mapy | Decyzja właściciela produktu |
| A-07 | Sesja admina 12h → toast „Sesja administratora wygasła” po wygaśnięciu | GAP-08 mapy | Decyzja UX |
| A-08 | Profil mentora `suspended` → uczeń widzi 404 + podobni mentorzy; sesja anulowana? | GAP-09 mapy | Decyzja F3 |
| A-09 | Anulowanie sesji próbnej <12h: przepada sesja I pieniądze (prowizja platformy 100%) | GAP-15 mapy, Spec stacku | Decyzja F3 / model finansowy |
| A-10 | Odznaczenie zgody marketingowej = nowa decyzja `granted: false` (append-only) | Spec F1, GAP-12 mapy | Test w S3 |

---

## 5. Luki w specyfikacji (z mapy ekranów)

| ID | Luka | Pytanie do właściciela |
|---|---|---|
| GAP-01 | Brak ekranu ponownej akceptacji regulaminu w F1 (s11) | Czy trafi do E1-S2 czy późniejszej fazy? |
| GAP-02 | Brak stanu „wersja regulaminu zmieniona” na logowaniu | Czy modal/strona akceptacji przed wejściem do aplikacji? |
| GAP-03 | Brak ekranu komunikatu weryfikacji e-maila w U1/U2 | Co widzi uczeń z nieweryfikowanym e-mailem? Blokada z linkiem „Wyślij ponownie”? |
| GAP-04 | Brak ekranu „Zmiana e-maila” w S3 | Czy F1 (E1-S2) czy F8? |
| GAP-05 | Brak stanu „oczekiwanie na weryfikację e-maila” po rejestracji | Toast/baner? Blokada U1/U2? |
| GAP-06 | Konflikt ról: student + mentor | Przełącznik w nagłówku: dropdown / modal / ekran? Co w S3? |
| GAP-07 | Stan „admin bez 2FA — dostęp tylko do konfiguracji 2FA” | Czy s07 z komunikatem czy wylogowanie? |
| GAP-08 | Sesja admina 12h — brak UI wygaśnięcia | Toast specyficzny czy ten sam co dla użytkowników? |
| GAP-09 | Profil niedostępny (mentor suspended) dla ucznia | Co w U4/U5? Anulowanie sesji? |
| GAP-10 | HIBP niedostępne — fail-closed vs fail-open | Blokada z logiem czy ostrzeżenie? |
| GAP-11 | Wylogowanie kończy sesję w bazie — brak ekranu potwierdzenia | Przekierowanie do P1 z toastem czy strona potwierdzenia? |
| GAP-12 | Stan „zgoda marketingowa wycofana” w UI | Odznaczenie = natychmiastowa server action czy przycisk Zapisz? |
| GAP-13 | Brak ekranu statusu eksportu/usunięcia konta | Status w S3? E-mail z linkiem do pobrania? |
| GAP-14 | BLIK cykliczny nieobsługiwany — stan w checkoutcie | Czy w F1 (płatność jednorazowa) BLIK zawsze działa? |
| GAP-15 | Co widzi mentee po anulowaniu próbnej <12h | Przepada sesja i pieniądze? Zwrot? |

---

## 6. Luki w Design Systemie (z mapy ekranów)

| ID | Komponent | Status |
|---|---|---|
| DS-01 | `AuthTabs` (zakładki Logowanie/Rejestracja) | Do zrobienia |
| DS-02 | `SocialButton` (Google/LinkedIn, variant social) | Do zrobienia |
| DS-03 | `PasswordField` z miernikiem siły | Do zrobienia |
| DS-04 | `Segmented` (wybór 30/60 min, rola) | Do zrobienia |
| DS-05 | `AvailabilityEditor` (siatka tydzień×godziny) | F2/F3 |
| DS-06 | `Stepper` (pasek postępu 6 kroków) | F2 |
| DS-07 | `PhotoUploader` z kadrowaniem | F2 |
| DS-08 | `VideoUploader` / `VideoLinkField` | F2 |
| DS-09 | `KycEmbed` (iframe operatora KYC) | F2 |
| DS-10 | `ProfilePreview` (modal z MentorCard) | Demo w Storybook |
| DS-11 | `EarningsPreview` (podgląd zarobku po prowizji) | F2 |
| DS-12 | `HoldCountdown` | ✅ Zaimplementowane (`packages/ui/src/product/hold-countdown.tsx`) |
| DS-13 | `PolicyNotice` | ✅ Zaimplementowane (`packages/ui/src/product/policy-notice.tsx`) |
| DS-14 | `EmptyState` z akcją „Wyczyść filtr X” | Rozszerzenie |
| DS-15 | `Notice` / `Alert` variant `notice` (nieblokujący baner) | **Nie robimy** (2026-11-22) — banery robimy `Alert` z wariantami info/warn/error |
| DS-16 | `Badge` variant `accent` | Do zrobienia |
| DS-17 | `Table` z kolumną akcji | Rozszerzenie |
| DS-18 | `DialogForm` pattern | Do zrobienia |
| DS-19 | `Toast` z akcją „Ponów” | Rozszerzenie |
| DS-20 | `Combobox` dla stref czasowych (>20 opcji) | Demo w Storybook |

---

## 7. Scenariusze testowe (24) — Panel testowy

Panel testowy (F1) pozwala przełączać między scenariuszami. Każdy scenariusz ustawia stan prototypu i nawiguje do odpowiednich ekranów.

| ID | Nazwa | Ekrany | Kluczowa weryfikacja |
|---|---|---|---|
| SC-01 | Logowanie poprawne (student) | s01 → s06 | Toast „Zalogowano”, rola student, dane profilu |
| SC-02 | Rejestracja z rolą mentor | s02 → s06 | Rola mentor, profil draft, sekcja admina ukryta |
| SC-03 | Logowanie admin + 2FA | s01 → s07 | Przekierowanie do s07, kod QR widoczny |
| SC-04 | Błędne hasło | s01 (error) | Alert „Nieprawidłowy e-mail lub hasło” |
| SC-05 | Limit prób (429) | s01 (error) | Alert „Za dużo nieudanych prób…” |
| SC-06 | Email zajęty przy rejestracji | s02 (conflict) | Alert „To konto już istnieje” + link logowania |
| SC-07 | HIBP: hasło na liście wycieków | s02/s06 (error) | Błąd „To hasło występuje w bazach wycieków” |
| SC-08 | Google/LinkedIn niedostępne | s01/s02 (unavailable) | Przyciski ukryte, alert info |
| SC-09 | returnTo z U1 | s03 → s01/s02 | Banner „Twój termin jest zachowany” |
| SC-10 | returnTo z S3 | s03 → s01/s02 | Banner, po sukcesie → s06 |
| SC-11 | Reset hasła — link wygasły | s05 (error) | Alert „Link wygasł” + „Wyślij nowy” |
| SC-12 | Reset hasła — sukces | s05 → s01 | Toast, przekierowanie do logowania |
| SC-13 | Admin bez 2FA loguje się | s01 → s07 | Jak SC-03 |
| SC-14 | 2FA kod nieprawidłowy | s07 (error) | Alert „Nieprawidłowy kod” |
| SC-15 | 2FA kod poprawny | s07 (success) | Toast, sekcja admina w s06 |
| SC-16 | Student → trasa mentora (403) | s08 | Komunikat 403, link do U4 |
| SC-17 | Mentor → trasa admina (403) | s08 | Komunikat 403, link do M2 |
| SC-18 | Cudze konto (404) | s09 | Komunikat 404, nie ujawnia istnienia |
| SC-19 | Weryfikacja email — sukces | s10 (success) | Toast, przekierowanie do panelu |
| SC-20 | Weryfikacja email — wygasły | s10 (error) | Alert + „Wyślij nowy link” |
| SC-21 | Zmiana wersji regulaminu | s11 | Checkbox wymagany, zapis wersji |
| SC-22 | Eksport/usunięcie konta | s06 | Toasty „Przygotujemy eksport…”, „Usunięcie wymaga potwierdzenia” |
| SC-23 | Wyloguj ze wszystkich urządzeń | s06 | Toast „Wylogowano ze wszystkich urządzeń” |
| SC-24 | Wycofanie zgody marketingowej | s06 | Nowa decyzja `granted: false` (symulacja toast) |

---

## 8. Instrukcja uruchomienia

1. Otwórz plik `index.html` w przeglądarce (kliknij dwukrotnie lub `open index.html` / `xdg-open index.html`).
2. Prototyp startuje na ekranie **s01 (Logowanie)**.
3. Naciśnij **F1** lub kliknij „Panel testowy” — otwiera listę 24 scenariuszy.
4. Kliknij scenariusz — prototyp ustawi stan i przejdzie do odpowiednich ekranów.
5. Możesz też nawigować ręcznie: wypełniaj formularze, klikaj przyciski, testuj błędy.
6. **Reset:** Odśwież stronę (F5) — wraca do s01, czyści stan.

### Skróty klawiszowe
- `F1` — otwórz/zamknij panel testowy
- `Escape` — zamknij modal
- `Tab` / `Shift+Tab` — nawigacja klawiaturowa (wspierana w pełni)

---

## 9. Weryfikacja (Quality Gate)

### Static review ✅
- [x] Wszystkie 11 ekranów ma cele i stany zgodne z mapą
- [x] Żadna reguła/decyzja nie została zmieniona bez ścieżki zmiany
- [x] Kontekst identyfikuje źródła, założenia [ASSUMPTION], luki GAP/DS
- [x] HTML/CSS/JS lokalne, brak zewnętrznych zależności, formularze nie wysyłają danych
- [x] Semantyczne nagłówki, labeli, przyciski, widoczny focus, kontrast, responsywność
- [x] Ścieżka outputu: `prototypes/discovery/konta-i-role/revision-001/` — bezpieczna, poza `.git/`, `.ai/skills/`, kodem aplikacji

### Browser walk (Playwright) — wykonany 2026-11-22, po naprawach

Chromium (Playwright) na `index.html`, 1440×900 i 320×900, świeża karta na każdy krok
(skrypt poza repozytorium: `/tmp/f1check/check5.cjs`). Wynik ostatniego przebiegu:

| Sprawdzenie | Wynik |
|---|---|
| Błędy JS i konsoli na starcie | **0** (`pageerror`, `console.error`) |
| Macierz stanów: 11 ekranów × dostępne warianty (44 sprawdzenia) | **44/44 OK** — widoczny jest właściwy blok stanu, treść niepusta, brak nakładania się bloków |
| 24 scenariusze z panelu (F1) | **24/24 OK** — właściwy ekran, brak błędów JS |
| s03 (wariant `returnTo`) | ekran logiczny s03 → sekcja s01 + klasa `state-return-to` + baner; deep link `#s03` działa |
| Zakładki Logowanie ⇄ Rejestracja | prowadzą do s01 / s02, `aria-selected` i `tabindex` zgodne z aktywną |
| „Nie pamiętasz hasła?” → s04, wysyłka resetu → stan sukcesu | OK |
| Logowanie formularzem: student / admin z 2FA / złe hasło | s06 „Rola: Uczeń” / s06 „Rola: Admin Trust” + sekcja admina / s01 `state-error` |
| Wpisane wartości przy przejściu w błąd | zachowane (E-mail i hasło przenoszone po `name`) |
| SC-13 → s07, kod „123456” → stan sukcesu | OK, toast „2FA skonfigurowane” |
| Poziome przewijanie: 11 ekranów × 320 i 1440 px | **0/22 przekroczeń** (tabela powiadomień przewija się we własnym kontenerze) |
| Chrome prototypu na 320 px | badge „Discovery Prototype” ukryty, nie zasłania nagłówka; toast nad przyciskiem panelu |
| Klawiatura | pierwszy Tab wchodzi w przycisk, F1 otwiera i zamyka panel |

#### Naprawione usterki (2026-11-22)

1. **Martwe stany ekranów** (przyczyna źródłowa): bloki wariantów miały klasę `hidden` (`display:none !important`), a reguły CSS ukrywały nawet właściwy blok — żaden wariant stanu nie był osiągalny. Widocznością steruje teraz `setScreenState` → `applyState` (jedno źródło prawdy), a bloki stanów nie mają już klasy `hidden` w treści.
2. **s03 bez sekcji** → `SCREEN_ALIASES = { s03: 's01' }`: s03 to ekran logiczny (wariant s01 z banerem), widoczny chip „Wariant s03 — wejście z returnTo”, działający deep link `#s03`.
3. **SC-03/SC-13 nie testowały admina** → konta wyszukiwane po polu `role` (`accountByRole`), bez cichego podstawiania studenta; obiekty kont kopiowane (koniec mutowania `DEMO_ACCOUNTS`).
4. **`pageerror` w SC-15** → `case 'totp'` tworzy sesję admina przed ustawieniem `totp`, kod poprawny daje stan sukcesu i toast.
5. **Martwa zakładka „Rejestracja”** → zakładki nawigują do s01/s02 i ustawiają `aria-selected`/`tabindex`.
6. **Martwy link resetu hasła** → akcja `forgotPassword` prowadzi do s04.
7. **Overflow s06 na 320 px** → `min-width: 0` w polach, jednokolumnowy `.field-row` poniżej 480 px, tabela w `.table-wrap` z własnym przewijaniem.
8. **Błędna ścieżka SVG** (zduplikowany fragment `d` w ikonie LinkedIn) — poprawiona.
9. **Gubione wartości formularza** przy przejściu w stan błędu — pamięć `typedByScreen` + przenoszenie po `name`.
10. **Komunikaty stanów pod formularzem** — bloki bez formularza (`data-state-mode="add"`, np. „To konto już istnieje”) są przenoszone nad treść i doklejają się do stanu domyślnego.
11. **Kontrolka segmentowa** („Chcę: się uczyć / mentorować”) — wypełniona jest cała etykieta aktywnej opcji (`:has` + klasa `is-checked`), nie sam napis.
12. **Chrome prototypu** na wąskim ekranie: badge ukryty poniżej 560 px, toast nad przyciskiem panelu testowego.

**Status weryfikacji:** `browser-walk-2026-11-22-fixed` — statyczny przegląd i przejście przeglądarki wykonane po naprawach: 44/44 sprawdzenia stanów, 24/24 scenariusze, 0 błędów JS, 0 przekroczeń szerokości. Prototyp pokazuje wszystkie stany z mapy; nadal **nie jest** dowodem zapotrzebowania ani gotowym produktem (dane i integracje są symulowane).

---

## 10. Jak otworzyć i zresetować

- **Otwórz:** `prototypes/discovery/konta-i-role/revision-001/index.html` (dwuklik albo `open`/`xdg-open` na tym pliku w swoim checkoucie)
- **Reset:** Odśwież stronę (F5 / Ctrl+R) — czysci `sessionStorage`, `localStorage`, stan w pamięci, wraca do s01.

> **Uwaga:** Ten prototyp zawiera wyłącznie fikcyjne dane symulacyjne. Nie stanowi dowodu zapotrzebowania użytkowników, nie spełnia Definition of Ready i nie może służyć jako podstawa do wdrożenia produkcyjnego. Wszystkie decyzje biznesowe wymagają potwierdzenia właściciela produktu przez proces SDLC.