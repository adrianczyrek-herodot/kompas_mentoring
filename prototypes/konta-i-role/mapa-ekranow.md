---
title: Mapa ekranów — F1 Tożsamość (logowanie, rejestracja, role, weryfikacja maila, konto)
status: approved
created: 2026-11-22
approved: 2026-11-22
prototype: prototypes/discovery/konta-i-role/revision-001/
related:
  - .ai/specs/product-brief.md
  - .ai/specs/backlog.md
  - .ai/specs/2026-11-10-f1-tozsamosc.md
  - kompas-mentoring/KONCEPCJA.md
  - docs/design-system.md
  - prototypes/discovery/konta-i-role/revision-001/ — klikalny prototyp tej mapy (rewizja 001)
  - .ai/specs/2026-11-10-f1-tozsamosc.md — specyfikacja, do której trafiły kryteria z tej mapy
  - kompas-mentoring/mockupy/src/screens/public.ts
  - kompas-mentoring/mockupy/src/screens/shared.ts
---

# Mapa ekranów — F1 Tożsamość (konta i role)

Przepływ: **E1 Domknięcie tożsamości (F1)** — logowanie, rejestracja, role, weryfikacja e-maila, strony startowe ról, brak dostępu.
Zakres: ekrany P4 (Logowanie/Rejestracja) i S3 (Konto) oraz стани przekierowania (`returnTo`), strona błędu 403/404, ekran konfiguracji 2FA dla adminów.

---

## 1. Tabela ekranów

| ID | Ekran | Rola (kto widzi) | Stany (domyślny / pusty / ładowanie / błąd / brak dostępu / konflikt / usługa niedostępna) | Historia / Kryterium akceptacji | Komponenty Design Systemu |
|---|---|---|---|---|---|
| **s01** | **P4 — Logowanie** | Gość (niezalogowany) | **Domyslny** — pusty formularz; **Ładowanie** — spinner w przycisku, blokada podwójnego wysłania; **Błąd** — „Nieprawidłowy e-mail lub hasło” (bez wskazania pola), 429 „Za dużo prób, spróbuj za X min”; **Konflikt** — e-mail `zajety@kompas.pl` symuluje konto już istniejące → propozycja logowania; **Usługa niedostępna** — Google/LinkedIn niedostępne → przyciski ukryte (Q1 spec F1) | F1: Rejestracja → zalogowany użytkownik; Logowanie e-mailem: poprawne, błędne hasło, limit prób; `returnTo` powrót po zalogowaniu; E2E 360/1280 px + axe | `AuthTabs`, `SocialButtons` (Button variant="social"), `Field` (Input email, PasswordField z miernikiem siły), `Link` (reset hasła), `InlineError`, `Toast` (sukces/błąd), `Spinner` w przycisku |
| **s02** | **P4 — Rejestracja** | Gość (niezalogowany) | **Domyslny** — formularz z wyborem roli (student/mentor), zgody; **Ładowanie** — spinner w przycisku; **Błąd walidacji** — imię 2–50, e-mail RFC, hasło ≥10, nie z HIBP (Q8), regulamin wymagany, marketing opcjonalny; **Konflikt** — e-mail zajęty → link do logowania; **Usługa niedostępna** — HIBP niedostępne → fail-closed (tylko lista offline), Google/LinkedIn ukryte bez kluczy | F1: Rejestracja z wyborem roli; Q3 — rola `mentor` + profil `draft` w `catalog`; Q2 — weryfikacja e-maila przed pierwszą rezerwacją (port `EmailSender` fake w F1); Q1 — Google/LinkedIn w kodzie, przyciski tylko przy kluczach | `AuthTabs`, `SocialButtons`, `Field` (Input imię, email, password), `RadioGroup` (rola), `Checkbox` (regulamin wymagany, marketing opcjonalny), `PasswordField` z miernikiem, `InlineError`, `Toast`, `Spinner` |
| **s03** | **P4 — Logowanie/Rejestracja z `returnTo`** | Gość (przekierowany z chronionej trasy) | **Domyslny** — baner „Twój wybrany termin jest zachowany — po zalogowaniu wrócisz do płatności”; **Ładowanie/Błąd** — jak s01/s02; **Po sukcesie** — przekierowanie do `returnTo` (tylko ścieżki wewnętrzne, polityka `returnTo.policy.ts`) | F1: Wejście na trasę chronioną → `/logowanie?returnTo=…` → powrót; Zewnętrzny `returnTo` ignorowany; Kryterium: `returnTo` działa dla U1→U2, M1, S3 | `Alert` (info banner z ikoną kalendarza), `AuthTabs`, `SocialButtons`, `Field` |
| **s04** | **Strona resetu hasła** (``Nie pamiętasz hasła?``) | Gość | **Domyslny** — pole e-mail; **Ładowanie** — spinner; **Sukces** — „Wysłaliśmy link do zmiany hasła (jeśli konto istnieje)”; **Błąd** — „Podaj poprawny e-mail” (inline) | F1 Q7: reset hasła w F1 (wymaga wysyłki e-maili — port `EmailSender` fake, SES w F3) | `Field` (Input email), `Button` (primary), `Toast`, `Link` (powrót do logowania) |
| **s05** | **Strona ustawienia nowego hasła** (z linku z maila) | Gość (z tokenem) | **Domyslny** — dwa pola hasła; **Ładowanie** — spinner; **Błąd** — token wygasły/nieprawidłowy → link do ponownego żądania; **Sukces** — toast + przekierowanie do logowania | F1 Q7: zmiana hasła przez link z maila; HIBP przy zmianie hasła (Q8) | `Field` (PasswordField ×2 z miernikiem), `Button`, `Toast`, `InlineError` |
| **s06** | **S3 — Konto i ustawienia** | Uczeń (`student`), Mentor (`mentor`), Admin (`admin_trust`, `admin_finance`) | **Domyslny** — sekcje: Profil, Metody płatności, Powiadomienia, Prywatność; **Ładowanie** — skeletony sekcji; **Pusty** — brak metod płatności → przycisk „Dodaj kartę”; **Błąd** — nie udało się wczytać ustawień; **Brak dostępu** — niezalogowany → P4 z `returnTo=#/konto`; Admin bez 2FA → ekran konfiguracji 2FA (s07) | F1: S3 w zakresie Q7 (profil, zmiana hasła, zgoda marketingowa, wyloguj wszędzie, eksport/usunięcie jako żądania); Role: student/mentor widzą swoje dane; admin widzi link do panelu admina w nagłówku (krok 7) | `PageHeader`, `Card`, `Field` (Input imię, email, Select strefa/valuta), `Button` (primary/ghost/danger-ghost), `Table` (powiadomienia), `Checkbox` (preferencje), `Badge` (status karty), `Toast` (zapisano), `Alert` (potwierdzenie usunięcia), `Spinner` |
| **s07** | **Konfiguracja 2FA (TOTP) — pierwszy logowanie admina** | Admin (`admin_trust`, `admin_finance`) bez 2FA | **Domyslny** — kod QR + pole kodu; **Ładowanie** — weryfikacja kodu; **Błąd** — „Nieprawidłowy kod”; **Sukces** — „2FA skonfigurowane” → przekierowanie do panelu admina; **Brak dostępu** — nie-admin → 403 | F1: Admin wymaga 2FA przed dostępem do tras admina; Krok 7: CLI kont + wymuszone 2FA; Sesja admina 12 h bezwzględnie | `Card`, `Field` (Input kod), `Button` (primary), `Toast`, `Alert` (instrukcja), `Avatar` (initiały), `Spinner` |
| **s08** | **Strona błędu 403 — Brak uprawnień** | Każda rola próbująca wejść na trasę innej roli | **Domyslny** — komunikat „Nie masz uprawnień do tej strony”; **Akcja** — link do strony startowej swojej roli (student → U4, mentor → M2, admin → A1) | F1: Brak roli → 403; Cudzy zasób → 404; Testy `requirePermission` i `getAccountOverview` | `EmptyState` (ikona zamka), `Button` (ghost → strona startowa roli), `PageHeader` |
| **s09** | **Strona błędu 404 — Nie znaleziono / Cudzy zasób** | Każda rola | **Domyslny** — „Ta strona nie istnieje albo nie masz do niej dostępu”; **Akcja** — link do strony startowej roli | F1: Cudzy zasób → 404 (nie ujawnia istnienia) | `EmptyState`, `Button`, `PageHeader` |
| **s10** | **Strona weryfikacji e-maila** (po kliknięciu linku z maila) | Gość (z tokenem) | **Domyslny** — „Weryfikujemy Twój e-mail…”; **Sukces** — „E-mail zweryfikowany” + przekierowanie do `returnTo` lub strony startowej roli; **Błąd** — „Link wygasł lub jest nieprawidłowy” + przycisk „Wyślij nowy link” | F1 Q2: Weryfikacja e-maila wymagana przed pierwszą rezerwacją; Port `EmailVerificationSender` (fake w F1, SES w F3); Link w logu poza produkcją | `Spinner` (ładowanie), `SuccessHeader` (ikoną check), `Button` (primary → wyślij nowy), `Toast` |
| **s11** | **Strona ponownej akceptacji regulaminu** (przy zmianie wersji — Q6) | Zalogowany (student/mentor/admin) | **Domyslny** — treść zmian + checkbox akceptacji; **Błąd** — akceptacja wymagana; **Sukces** — zapis wersji + powrót | F1 Q6: W F1 tylko zapis wersji przy rejestracji; ekran ponownej akceptacji przy pierwszej realnej zmianie dokumentu | `Card`, `Checkbox` (wymagany), `Button`, `Alert` (info), `Link` (do pełnego tekstu) |

---

## 2. Scenariusze do przełączania w prototypie

| ID scenariusza | Co symulujemy | Jak włączyć w prototypie | Ekrany dotknięte |
|---|---|---|---|
| **SC-01** | Logowanie poprawne (student) | Wypełnij formularz, e-mail ≠ `zajety@kompas.pl` | s01 → s06 (rola student) |
| **SC-02** | Logowanie poprawne (mentor) | Rejestracja z rolą „mentorować” | s02 → s06 (rola mentor, profil draft) |
| **SC-03** | Logowanie poprawne (admin) | Konto z seeda `admin@kompas.pl` | s01 → s07 (2FA) → panel admina |
| **SC-04** | Błędne hasło | E-mail poprawny, hasło „zle” | s01 (stan Błąd) |
| **SC-05** | Limit prób logowania (429) | 3× błędne hasło w 10 s | s01 (stan Błąd 429) |
| **SC-06** | E-mail zajęty przy rejestracji | E-mail `zajety@kompas.pl` | s02 (stan Konflikt) |
| **SC-07** | HIBP: hasło na liście wycieków | Hasło „Password123” (symulacja) | s02 / s06 (zmiana hasła) |
| **SC-08** | Google/LinkedIn niedostępne | Usuń klucze ze środowiska (mock: ukryj przyciski) | s01, s02 (stan Usługa niedostępna) |
| **SC-09** | `returnTo` z U1 (wybór terminu) | Wejdź na `#/rezerwacja/m5` bez logowania | s03 (baner terminu) → s01/s02 → U2 |
| **SC-10** | `returnTo` z S3 (konto) | Wejdź na `#/konto` bez logowania | s03 → s01/s02 → s06 |
| **SC-11** | Reset hasła — link wygasły | Symuluj token `expired` w URL | s05 (stan Błąd tokenu) |
| **SC-12** | Reset hasła — sukces | Token poprawny, nowe hasło | s05 (stan Sukces) → s01 |
| **SC-13** | Admin bez 2FA loguje się | Konto admin z seeda, brak 2FA | s01 → s07 |
| **SC-14** | 2FA kod nieprawidłowy | Wpisz „000000” | s07 (stan Błąd) |
| **SC-15** | 2FA kod poprawny | Kod z aplikacji TOTP (mock: „123456”) | s07 (stan Sukces) → panel admina |
| **SC-16** | Student próbuje wejść na trasę mentora | Zalogowany student → `#/mentor` | s08 (403) |
| **SC-17** | Mentor próbuje wejść na trasę admina | Zalogowany mentor → `#/admin/weryfikacja` | s08 (403) |
| **SC-18** | Cudze konto (GET /me/account z innym ID) | Zalogowany student A → próba odczytu konta B | s09 (404) |
| **SC-19** | Weryfikacja e-maila — sukces | Kliknij link z maila (token valid) | s10 (stan Sukces) |
| **SC-20** | Weryfikacja e-maila — link wygasł | Token stary >24 h | s10 (stan Błąd) → przycisk „Wyślij nowy” |
| **SC-21** | Zmiana wersji regulaminu — ponowna akceptacja | Symuluj nową wersję dokumentu | s11 |
| **SC-22** | Eksport danych / usunięcie konta | S3 → przyciski „Pobierz moje dane” / „Usuń konto” | s06 (Toast: „Przygotujemy eksport…”, „Usunięcie wymaga potwierdzenia”) |
| **SC-23** | Wylogowanie ze wszystkich urządzeń | S3 → przycisk „Wyloguj wszędzie” | s06 (Toast: „Wylogowano ze wszystkich urządzeń”) |
| **SC-24** | Zgoda marketingowa — wycofanie | S3 → odznacz checkbox marketingowy | s06 (nowa decyzja z wersją dokumentu, `granted: false`) |

---

## 3. Konta i dane demo

| Konto | Rola | E-mail | Hasło | Dane dodatkowe | Uwagi |
|---|---|---|---|---|---|
| **Demo Student** | `student` | `student@demo.kompas.pl` | `DemoPass123` | Imię: „Adrian”, strefa: `Europe/Warsaw`, waluta: `PLN`, saldo u Kasi: 3 sesje, plan aktywny 1×60 min | Używane w SC-01, SC-09, SC-10, SC-16, SC-18, SC-22, SC-23, SC-24 |
| **Demo Mentor** | `mentor` (profil `approved`) | `mentor@demo.kompas.pl` | `DemoPass123` | Imię: „Kasia”, strefa: `Europe/Warsaw`, stawka 180 zł/h, dostępność wg M3, 87 opinii, ocena 4.9 | Używane w SC-02, SC-17 |
| **Demo Mentor Draft** | `mentor` (profil `draft`) | `mentor-draft@demo.kompas.pl` | `DemoPass123` | Imię: „Nowy Mentor”, profil w szkicu (krok 3 onboardingu) | Test przepływu M1 z F2 |
| **Demo Admin Trust** | `admin_trust` | `admin-trust@demo.kompas.pl` | `AdminPass123!` | 2FA skonfigurowane | Używane w SC-03, SC-13, SC-14, SC-15 |
| **Demo Admin Finance** | `admin_finance` | `admin-finance@demo.kompas.pl` | `AdminPass123!` | 2FA skonfigurowane | Dostęp do A2 (spory) |
| **Demo Guest** | — (niezalogowany) | — | — | — | Wejście na P1, P2, P3, P4 |

**Dane z briefu/KONCEPCJI używane w demo:**
- Nazwy: „Adrian” (uczeń), „Kasia” (mentor)
- Stawka mentora: 180 zł / 60 min → sesja próbna 52 zł (zgodnie z mockupami)
- Plan: 1×60 min / tydzień = 720 zł / 4 tyg.
- Termin demo: **stały „teraz” = 2026-10-20T12:00:00+02:00** (Europe/Warsaw, letni czas) — `FakeClock` w testach, `NOW` w mockupach
- Strefy czasowe demo: `Europe/Warsaw` (domyślna), `Europe/London`, `America/New_York`
- Kody rabatowe: `KOMPAS10` (−10% na sesję próbną)

---

## 4. Luki w specyfikacji

| # | Luka | Opis | Pytanie do właściciela produktu |
|---|---|---|---|
| **GAP-01** | Brak ekranu **ponownej akceptacji regulaminu** w F1 | Spec F1 Q6: „w F1 tylko zapis wersji, ekran ponownej akceptacji przy pierwszej realnej zmianie”. Nie ma kryterium ani ekranu (s11) w backlogu E1-S2. | Czy ekran ponownej akceptacji regulaminu (s11) ma trafić do F1 (E1-S2) czy do późniejszej fazy? Jeśli do F1 — czy dodać do kryteriów E1-S2? |
| **GAP-02** | Brak stanu **„wersja regulaminu zmieniona”** na ekranie logowania | Użytkownik zalogowany dawno — przy logowaniu powinien zobaczyć prośbę o nową akceptację. Spec F1 nie opisuje tego stanu. | Czy przy logowaniu użytkownika ze starej wersji regulaminu pokazujemy modal/stronę akceptacji przed wejściem do aplikacji? |
| **GAP-03** | **Weryfikacja e-maila przed pierwszą rezerwacją** — brak ekranu komunikatu w U1/U2 | Spec F1 Q2: weryfikacja wymagana przed pierwszą rezerwacją. KONCEPCJA U1: niezalogowany → rejestracja → płatność. Nie ma ścieżki: zalogowany, nieweryfikowany e-mail → blokada U1/U2 z komunikatem. | Co widzi uczeń w U1/U2, gdy ma konto ale nieweryfikowany e-mail? Blokada z linkiem „Wyślij link weryfikacyjny ponownie”? |
| **GAP-04** | **Brak ekranu „Zmiana e-maila”** w S3 | Spec F1 Q7: „zmiana e-maila (wymaga weryfikacji z Q2) — w F1 czy później (F8)?”. Rekomendacja: później. Ale KONCEPCJA S3 ma „zmiana e-maila w S3 z weryfikacją”. | Czy zmiana e-maila z weryfikacją trafia do F1 (E1-S2) czy do F8? Jeśli F1 — dodać ekran i stan weryfikacji nowego e-maila. |
| **GAP-05** | **Stan „oczekiwanie na weryfikację e-maila”** po rejestracji | Po rejestracji (s02) użytkownik jest zalogowany (rola nadana), ale e-mail nieweryfikowany. Nie ma ekranu/komunikatu „Sprawdź skrzynkę, weryfikujemy e-mail przed pierwszą rezerwacją”. | Czy po rejestracji pokazujemy toast/baner o konieczności weryfikacji? Czy blokujemy U1/U2 do weryfikacji? |
| **GAP-06** | **Konflikt ról: użytkownik jest studentem I mentorzem** | Spec F1: role `student`, `mentor`, `admin_*`. Nagłówek ma „Zmień rolę — gdy użytkownik jest i uczniem, i mentorem”. Nie ma ekranu przełączania ról ani stanu konta z dwiema rolami. | Jak wygląda przełączanie ról w nagłówku? Czy to oddzielny ekran, modal, czy dropdown? Co widzi użytkownik z dwiema rolami w S3? |
| **GAP-07** | **Stan „admin bez 2FA — dostęp tylko do konfiguracji 2FA”** | Spec F1: admin bez 2FA nie wejdzie na trasę admina. `proxy.ts` sprawdza sesję, ale nie ma opisanego stanu UI dla admina, który ma sesję ale nie ma 2FA i próbuje wejść na `#/admin/weryfikacja`. | Czy admin bez 2FA widzi stronę s07 (konfiguracja 2FA) z komunikatem „Skonfiguruj 2FA, by kontynuować”, czy jest od razu wylogowywany? |
| **GAP-08** | **Sesja admina 12 h — brak UI informującego o wygaśnięciu** | Spec F1: sesje adminów 12 h bezwzględnie. Po 12 h `getCurrentUser` zwraca `null`. Nie ma komunikatu „Sesja wygasła, zaloguj się ponownie” specyficznego dla admina. | Czy po 12 h admina wylogowujemy z toastem „Sesja administratora wygasła (12 h)”? Czy to ten sam komunikat co dla użytkowników (30 dni)? |
| **GAP-09** | **Brak ekranu „Profil niedostępny — mentor zawieszony”** dla ucznia | KONCEPCJA P3: 404 dla profilu niedostępnego + podobni mentorzy. Ale co widzi uczeń, który ma zaplanowaną sesję z mentoriem, którego profil został zawieszony? | Co widzi uczeń w U4/U5, gdy mentor ma status `suspended`? Czy sesja jest anulowana automatycznie? |
| **GAP-10** | **Stan „HIBP niedostępne” — fail-closed vs fail-open** | Spec F1 Q8: HIBP fail-closed, wyłączone w testach. Nie ma opisanego stanu UI gdy API HIBP nie odpowiada (timeout, 5xx). | Czy przy niedostępnym HIBP blokujemy rejestrację/zmianę hasła (fail-closed) czy pozwalamy z ostrzeżeniem (fail-open z logiem)? |
| **GAP-11** | **Brak kryterium: wylogowanie kończy sesję w bazie** | Spec F1 kryterium: „Wylogowanie kończy sesję w bazie”. Nie ma ekranu potwierdzenia wylogowania ani stanu po wylogowaniu (przekierowanie do P1?). | Czy wylogowanie to natychmiastowe przekierowanie do P1 z toastem, czy strona potwierdzenia? Czy „Wyloguj wszędzie” w S3 wylogowuje z bieżącego urządzenia też? |
| **GAP-12** | **Brak opisu stanu „zgoda marketingowa wycofana”** | Spec F1: zgody to decyzje dopisywane (append-only) z polem `granted`. Wycofanie = nowa decyzja `granted: false`. Nie ma UI dla tego stanu w S3 (checkbox odznaczony = nowa decyzja). | Czy odznaczenie checkboxa marketingowego w S3 od razu zapisuje decyzję `granted: false` (server action), czy wymaga przycisku „Zapisz”? |
| **GAP-13** | **Brak ekranu „Konto usunięte / Eksport gotowy”** | Spec F1 Q7: eksport i usunięcie jako zapisane żądania, realizacja w F8. Nie ma ekranu statusu żądania (oczekujące / gotowe / wygasłe). | Czy w S3 pokazujemy status żądań eksportu/usunięcia? Czy użytkownik dostaje e-mail z linkiem do pobrania eksportu? |
| **GAP-14** | **Brak stanu „BLIK cykliczny nieobsługiwany przez bank”** w checkoutcie | Spec stacku W3: BLIK cykliczny max 2000 zł, nie we wszystkich bankach. Checkout musi obsłużyć `recurring_not_supported_by_bank`. To dotyczy F4, ale F1 ma checkout próbnej (jednorazowej). | Czy w F1 (płatność jednorazowa próbna) BLIK zawsze działa, czy też tu może wystąpić błąd banku? |
| **GAP-15** | **Brak opisu: co widzi mentee po anulowaniu sesji próbnej (<12 h)** | KONCEPCJA F3: anulowanie <12 h → sesja przepada. Dla sesji próbnej: zwrot pieniędzy? Spec stacku: sesja próbna w całości prowizja platformy. | Jeśli uczeń anuluje próbną <12 h: przepada sesja I pieniądze? Czy jest zwrot? (Decyzja dotyczy F3, ale wpływa na U5 w F1). |

---

## 5. Luki w design systemie

| # | Luka | Opis | Komponent / token do dodania |
|---|---|---|---|
| **DS-01** | Brak **`AuthTabs`** (zakładki Logowanie/Rejestracja) | Mockupy używają własnej implementacji zakładek w `public.ts`. Design system ma `Tabs` (produkt), ale nie wariant auth (bez ramki, z podkreśleniem aktywnej). | Nowy komponent `AuthTabs` lub wariant `Tabs variant="auth"` w `packages/ui/src/components/tabs.tsx` |
| **DS-02** | Brak **`SocialButtons`** (Google/LinkedIn) | Przyciski z ikoną dostawcy, variant `social` (outline, ikona SVG po lewej). Nie ma w DS. | Nowy komponent `SocialButton` w `packages/ui/src/components/button.tsx` (variant `social`) |
| **DS-03** | Brak **`PasswordField` z miernikiem siły** | Mockupy mają `PasswordField` z wskaźnikiem siły (słabe/średnie/mocne). DS ma `Input type="password"`, ale nie zlicza entropii. | Nowy komponent `PasswordField` w `packages/ui/src/components/password-field.tsx` (z `zxcvbn` lub prostą heurystyką) |
| **DS-04** | Brak **`Segmented`** (wybór 30/60 min, rola student/mentor) | Mockupy używają `fieldset.segmented` z radio. DS ma `RadioGroup`, `ToggleGroup`, ale nie `Segmented` (wizualnie połączone opcje). | Nowy komponent `Segmented` lub wariant `RadioGroup variant="segmented"` |
| **DS-05** | Brak **`AvailabilityEditor`** (siatka dostępności tydzień × godziny) | M1 krok 5 i M3 używają własnej siatki `avail__cell`. DS nie ma komponentu do edycji dostępności cyklicznej. | Nowy komponent `AvailabilityEditor` w `packages/ui/src/product/` (używa `ToggleGroup`/`Checkbox` w siatce) |
| **DS-06** | Brak **`Stepper`** (pasek postępu onboarding 6 kroków) | M1 ma `ol.stepper` z klikalnymi krokami. DS nie ma komponentu kroków. | Nowy komponent `Stepper` w `packages/ui/src/components/stepper.tsx` |
| **DS-07** | Brak **`PhotoUploader`** z kadrowaniem (avatar mentora) | M1 krok 1: upload zdjęcia z podglądem i kadrowaniem. DS ma `Avatar`, ale nie uploader. | Nowy komponent `PhotoUploader` (presigned URL R2, kadrowanie `cropper.js`) |
| **DS-08** | Brak **`VideoUploader` / `VideoLinkField`** (wideo powitalne) | M1 krok 3: upload MP4/MOV lub link YouTube/Vimeo. DS nie ma. | Nowy komponent `VideoUploader` (Bunny Stream) + `VideoLinkField` (walidacja URL) |
| **DS-09** | Brak **`KycEmbed`** (weryfikacja tożsamości operatorem) | M1 krok 6: przycisk otwierający iframe operatora KYC. DS nie ma. | Nowy komponent `KycEmbed` (iframe z `postMessage` dla statusu) |
| **DS-10** | Brak **`ProfilePreview`** (podgląd karty w wynikach wyszukiwania) | M1 krok 3: przycisk „Podgląd profilu” otwiera modal z `MentorCard`. DS ma `MentorCard` (produkt), ale nie modal podglądu. | Użycie `Dialog` z `MentorCard` wewnątrz — brak luky, ale trzeba zademonstrować w Storybook |
| **DS-11** | Brak **`EarningsPreview`** (podgląd zarobku po prowizji) | M1 krok 4: dynamiczny podgląd „Zarobisz za 60 min (prowizja 33%)”. DS ma `Money`, ale nie komponent podglądu z prowizją. | Nowy komponent `EarningsPreview` (przyjmuje stawkę, zwraca kwotę netto per tier) |
| ~~DS-12~~ | **`HoldCountdown`** (licznik 10 min blokady terminu) | **Nie luka** — istnieje w `packages/ui/src/product/hold-countdown.tsx` (poprawka 2026-11-22; wpis wcześniej błędnie zaczynał się od „Brak”) |
| ~~DS-13~~ | **`PolicyNotice`** (baner reguły 12 h) | **Nie luka** — istnieje w `packages/ui/src/product/policy-notice.tsx` (poprawka 2026-11-22) |
| **DS-14** | Brak **`EmptyState` z akcją „Wyczyść filtr X”** | P2: empty state z przyciskiem czyszczącym najbardziej zawężający filtr. DS ma `EmptyState`, ale nie ten wariant. | Rozszerzenie `EmptyState` o `primaryAction` z dynamicznym tekstem |
| ~~DS-15~~ | `Notice` / `Alert` wariant `warn` z ikoną | **Decyzja 2026-11-22: nie tworzymy osobnego komponentu** — banery („termin zachowany”, 429) robimy `Alert` z wariantami info/warn/error; spec design systemu ma wpis w „Czego brakuje”, żeby nie powstał drugi baner | — |
| **DS-16** | Brak **`Badge` wariant `accent`** (dla „Oceń”, „najczęściej wybierany”) | U4: `badge--accent` dla „Oceń”; U8: plan „najczęściej wybierany”. DS ma `Badge` z variantami `success/warning/danger/cancelled/scheduled/requested`, brak `accent`. | Dodanie `variant="accent"` do `Badge` |
| **DS-17** | Brak **`Table` z kolumną akcji (przyciski w wierszu)** | S3: tabela powiadomień z checkboxami; M5: tabela zarobków z przyciskami. DS `Table` ma tylko dane, brak slotu na akcje. | Rozszerzenie `Table` o `renderRowActions` / `actions` column |
| **DS-18** | Brak **`Modal` / `Dialog` z formularzem i walidacją inline** | Wiele modali w mockupach (odrzucenie prośby, anulowanie, przełożenie, zgłoszenie problemu). DS ma `Dialog`, `AlertDialog`, `Form` pattern, ale nie gotowy pattern „Dialog z formularzem + walidacja + toast po sukcesie”. | Dodanie patternu `DialogForm` w `packages/ui/src/patterns/` |
| **DS-19** | Brak **`Toast` z akcją „Ponów”** (dla nieudanej wiadomości) | S1: bubble z przyciskiem „Nie wysłano · Ponów”. DS `useToast` nie ma wariantu z akcją. | Rozszerzenie `Toast` o `action: { label, onClick }` |
| **DS-20** | Brak **`Select` z wyszukiwaniem (Combobox) dla krajów/stref czasowych** | S3: select strefy czasowej, kraj. DS ma `Select` (7–20 opcji) i `Combobox` (>15 lub wyszukiwanie). Strefy czasowych >20 → `Combobox`. | Użycie `Combobox` dla stref czasowych — brak luky, ale trzeba zademonstrować w Storybook |

---

## 6. Podsumowanie liczb

| Metryka | Liczba |
|---|---|
| **Ekrany (ID s01–s11)** | 11 |
| **Stany łącznie** | 47 (domyślny: 11, ładowanie: 11, pusty: 6, błąd: 11, brak dostępu: 3, konflikt: 3, usługa niedostępna: 2) |
| **Scenariusze do przełączania** | 24 |
| **Konta demo** | 6 (student, mentor approved, mentor draft, admin_trust, admin_finance, guest) |
| **Luki w specyfikacji** | 15 (GAP-01 – GAP-15) |
| **Luki w design systemie** | 20 (DS-01 – DS-20), z czego 2 już zaimplementowane (DS-12, DS-13) |

---

## Następne kroki

1. **Zatwierdzenie mapy** — proszę o przegląd tabeli ekranów, scenariuszy, kont demo i luk.
2. **Rozstrzygnięcie luk w specyfikacji (GAP-01 – GAP-15)** — odpowiedzi właściciela produktu wpiszą się do specyfikacji F1 (sekcja „Decyzje i zmiany”) i do backlogu.
3. **Plan wdrożenia luk w DS** — które komponenty (DS-01 – DS-20) trafić do F1 (E1-S2), a które do F2/F3.
4. **Tworzenie prototypu** — po zatwierdzeniu mapy, budowa klikalnego prototypu w `prototypes/konta-i-role/` z użyciem Storybook + `om-mockup-prototype` skill.

---

---

## 7. Decyzje i zmiany po zatwierdzeniu mapy (2026-11-22)

Mapa została zatwierdzona 2026-11-22 i przeniesiona do kryteriów akceptacji specyfikacji F1 (`.ai/specs/2026-11-10-f1-tozsamosc.md`, sekcja „Kryteria akceptacji” z identyfikatorami s01–s11). Cztery pozycje mapy zostały rozstrzygnięte inaczej, niż zakładała:

| Pozycja | Rozstrzygnięcie | Źródło |
|---|---|---|
| **GAP-01 / GAP-02** — ponowna akceptacja regulaminu (s11) i stan „wersja zmieniona” na logowaniu | **Poza F1** — w F1 tylko zapis wersji dokumentu; ekran powstaje przy pierwszej realnej zmianie dokumentu, wtedy też stan na logowaniu (bez osobnego modalu) | F1 Q6, decyzja 2026-11-22 |
| **GAP-06** — konflikt ról (student + mentor) | **Odrzucone** — konto ma **jedną rolę** w MVP; kto chce się uczyć i mentorować, zakłada drugie konto. Przełącznika ról w nagłówku nie ma | F1, decyzja 2026-11-22 |
| **s06** — sekcje „Metody płatności”, „Powiadomienia”, „Prywatność”, „Dodaj kartę” | **Poza F1** — płatności to F4 (L1), powiadomienia w aplikacji E3-S8, push L9; w prototypie mogą zostać jako atrapa z dopiskiem | F1 Q7, decyzja 2026-11-22 |
| **DS-12, DS-13, DS-15** | DS-12 i DS-13 **nie są lukami** (komponenty istnieją), DS-15 **nie powstaje** — banery robimy `Alert` | spec design systemu, decyzja 2026-11-22 |

Pozostałe luki z sekcji 4 mapy (GAP-03, GAP-04, GAP-05, GAP-09, GAP-14, GAP-15) dotyczą innych przepływów i są przypisane do zadań w `.ai/specs/backlog.md` (E3-S4, E3-S5, E3-S6, E3-S9, L1, L2) — specyfikacje F3–F5 jeszcze nie istnieją. Luki DS-01, DS-02 i DS-03 weszły do partii 4 etapu 2 design systemu, a DS-04…DS-11, DS-14 i DS-16…DS-20 do zadań F2/F3.

**Weryfikacja prototypu:** przejście przeglądarki (Chromium, 1440 i 320 px) wykonane 2026-11-22, a usterki naprawione tego samego dnia — 44/44 sprawdzenia stanów, 24/24 scenariusze, 0 błędów JS, 0 przekroczeń szerokości. Prototyp pokazuje wszystkie 47 stanów z tej mapy; raport i lista 12 napraw w `prototypes/discovery/konta-i-role/revision-001/README.md` §9.
