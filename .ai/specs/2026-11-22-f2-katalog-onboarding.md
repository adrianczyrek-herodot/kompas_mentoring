---
title: F2 — katalog i onboarding mentora (M1, A1, P1–P3, ulubieni)
status: in-progress         # draft | approved | in-progress | implemented | archived
created: 2026-11-22
implemented:
related:
  - .ai/specs/product-brief.md (E2, reguła 8)
  - .ai/specs/backlog.md (E2-S1…E2-S8, zgłoszenia #23, #28–#35)
  - .ai/specs/2026-10-21-tech-stack-i-standardy-inzynieryjne.md (§1.3, §2.3–2.5, §3, §4.3, §4.6–4.8, §8, §13)
  - .ai/specs/implemented/2026-11-10-f1-tozsamosc.md (Q3: rola `mentor` + profil `draft` w `catalog`)
  - kompas-mentoring/KONCEPCJA.md (F4 onboarding, P1, P2, P3, M1, A1, §5 model)
  - docs/design-system.md, packages/ui/src/screens/{p2-search,p3-profile}.stories.tsx
  - prototypes/kompas-flow/ (notatki „Czego nie rozstrzyga” dla P1–P3, M1, A1)
  - .ai/runs/2026-11-22-e2-s1-specyfikacja-f2.md
---

# F2 — katalog i onboarding mentora (M1, A1, P1–P3, ulubieni)

## Kontekst i cel

Druga faza funkcjonalna (spec stacku, plan faz). Po F1 kandydat na mentora ma konto z rolą `mentor`, ale nie ma profilu, a gość nie ma kogo szukać. F2 dostarcza całą drogę **od „Zostań mentorem” do publicznego profilu w wyszukiwarce**:

1. mentor wypełnia onboarding M1 (6 kroków, szkic zapisywany po każdym kroku) i wysyła wniosek;
2. zespół zaufania (`admin_trust`) weryfikuje go w A1 i zatwierdza, prosi o zmiany albo odrzuca;
3. zatwierdzony profil pojawia się w wyszukiwarce P2, na profilu P3 i (wyróżniony) na stronie głównej P1; uczeń może dodać mentora do ulubionych.

Reguła 8 briefu: **mentor jest widoczny publicznie dopiero po zatwierdzeniu wniosku**. Cele briefu: C1 (gość szybko znajduje mentora), C4 (mało administracji, SLA weryfikacji ≤ 2 dni robocze), C6 (DAC7, DSA, WCAG od pierwszego dnia).

Ta specyfikacja realizuje E2-S1 (#28) i jest podstawą historii E2-S2…E2-S8 (#29–#35). Implementacja startuje dopiero po odpowiedziach na Open Questions i `status: approved` (SDLC §1).

## Ekrany

Identyfikatory ekranów z KONCEPCJI §3 są stałe; kryteria akceptacji odwołują się do nich.

| ID | Ekran | Trasa | Rola | Historia |
|---|---|---|---|---|
| **M1** | Onboarding mentora, kroki 1–4 (O mnie, Kompetencje, Opis i wideo, Stawka) | `/mentor/onboarding/[krok]` | mentor | E2-S2 |
| **M1** | Onboarding, kroki 5–6 (Dostępność, Weryfikacja) + podgląd + wysłanie + status wniosku | `/mentor/onboarding/[krok]`, `/mentor` | mentor | E2-S3 |
| **A1** | Weryfikacja mentorów: kolejka, szczegóły, checklista, decyzja, audyt | `/admin/weryfikacja[/:id]` | `admin_trust` | E2-S4 |
| **P2** | Wyszukiwarka mentorów | `/mentorzy` | wszyscy | E2-S5 |
| **P3** | Profil mentora | `/mentorzy/[slug]` | wszyscy | E2-S6 |
| **P1** | Strona główna | `/` | wszyscy | E2-S7 |
| — | Ulubieni mentorzy (przycisk na P2/P3 + lista) | `/ulubieni` | student | E2-S8 |
| — | Zasady rankingu wyszukiwarki (DSA art. 27) | `/zasady-rankingu` | wszyscy | E2-S5 |

Kroki M1 w URL (po polsku, stałe): `o-mnie`, `kompetencje`, `opis-i-wideo`, `stawka`, `dostepnosc`, `weryfikacja`, `podglad`.

## Zakres

- W zakresie:
  - **Moduł `catalog`** (nowy): agregat `MentorProfile` z maszyną stanów, polityki walidacji, taksonomia (kategorie, tagi), komendy szkicu i wysłania, read model wyszukiwarki (`catalog.mentor_search`), zapytania P1–P3, ulubieni.
  - **Moduł `trust`** (nowy): `MentorApplication` (wniosek i decyzja), `AuditEntry` (append-only), uprawnienie do decyzji tylko dla `admin_trust`.
  - **Moduł `payouts`** (nowy, minimalny): `PayoutProfile` z danymi DAC7 i do wypłat, szyfrowanymi w bazie (Q5). Logika wypłat zostaje w F7.
  - **Zdarzenia między modułami** (pierwsze w projekcie): publikacja zdarzenia jako zadania pg-boss w transakcji zmiany (outbox, spec §4.6), schematy w `packages/contracts/events`, konsument z deduplikacją (inbox).
  - **Port `FileStorage`** (spec §1.3) z adapterem R2 (jurysdykcja EU), adapterem lokalnym dla dev/e2e i fake'iem; presigned upload zdjęcia.
  - **Port `KycProvider`** tylko jako interfejs i fake, zgodnie z Q2. Adapter Stripe w F4.
  - **UI:** M1 (7 widoków), A1 (kolejka + szczegóły), P1, P2, P3, ulubieni, strona zasad rankingu; brakujące komponenty w `packages/ui` ze stories.
  - **Seed:** zatwierdzeni mentorzy z `kompas-mentoring/mockupy/src/mocks.ts` (bez opinii i ocen), kategorie, przykładowe wnioski w kolejce A1.
  - **Strażnik tras mentora:** M2–M5 dostępne dopiero po zatwierdzeniu profilu; wcześniej przekierowanie na M1 ze statusem (KONCEPCJA §3.2).
- Poza zakresem:
  - Edytor dostępności i silnik slotów (E3-S2, E3-S3). Krok 5 M1 **osadza** edytor z E3-S2, a filtr dostępności w P2 i tydzień dostępności na P3 dochodzą po E3-S3 (zależność w backlogu).
  - Rezerwacja (U1, E3-S4). Sticky CTA na P3 prowadzi do U1 dopiero po E3-S4. Do tego czasu jest ukryte flagą (Q12).
  - Opinie i oceny (F5), wiadomości „Napisz” (F6), upload wideo MP4/MOV (Bunny Stream, v1.1), wypłaty i Stripe Connect (F4/F7), eksport DAC7 (F7), moderacja treści DSA notice & action (F6), M2 jako panel (E3-S7). W F2 `/mentor` pokazuje tylko status profilu i wniosku.
  - Prawdziwe e-maile o decyzji. Wysyłka idzie przez port `EmailSender` z adapterem logującym, SES dochodzi w E3-S8.

## Model domeny

### `MentorProfile` — maszyna stanów (spec stacku §4.3)

```ts
const transitions = {
  draft:             { submitted: 'submitted' },
  submitted:         { approved: 'approved', changes_requested: 'changes_requested', rejected: 'rejected' },
  changes_requested: { submitted: 'submitted' },
  approved:          { suspended: 'suspended' },          // zawieszenie przez admin_trust (Q8)
  suspended:         { reinstated: 'approved' },
  rejected:          {},                                   // ponowny wniosek — Q7
} as const satisfies Record<MentorProfileStatus, Partial<Record<MentorProfileEvent, MentorProfileStatus>>>;
```

- Profil powstaje leniwie przy pierwszym wejściu mentora na M1 (`draft`, krok 1). Nie powstaje przy rejestracji, bo `catalog` nie słucha `identity` w F1.
- **Publiczny** jest wyłącznie profil `approved`. `suspended`, `rejected` i każdy inny stan → P3 zwraca 404 „Profil niedostępny” + podobni mentorzy.
- Edycja w `submitted` jest zablokowana: formularze tylko do odczytu, komunikat „Wniosek czeka na weryfikację” (pytanie z prototypu M1, Q6). Edycja w `changes_requested` jest dozwolona, a pola wskazane przez admina są wyróżnione.
- Edycja profilu `approved` — Q6.
- Kolumna `version` (optimistic locking): konflikt → 409 „Profil zmienił się w innej karcie — odśwież”.

### Pola i walidacje (polityki w `catalog/domain/policies/`, stałe w `config.ts`)

| Krok | Pole | Reguła (źródło: KONCEPCJA M1, backlog E2-S2) |
|---|---|---|
| 1 O mnie | zdjęcie | JPG/PNG, ≥ 400×400 px, ≤ 5 MB; kadrowanie w przeglądarce do kwadratu; „widoczna twarz” sprawdza admin (checklista A1) |
| 1 | imię wyświetlane | z `identity` (imię z rejestracji, 2–50 znaków); zmiana w S3 |
| 1 | kraj | ISO 3166-1 alfa-2, domyślnie `PL` (mentorzy spoza PL — Q-B5 briefu, Later L11) |
| 1 | języki sesji | 1–5 z listy ISO 639-1, co najmniej jeden |
| 2 Kompetencje | kategorie | 1–5 z zamkniętej listy (Q3) |
| 2 | tagi | 3–15; 2–30 znaków; normalizacja: przycięcie, małe litery do porównań, bez duplikatów (Q3) |
| 2 | lata doświadczenia | liczba całkowita 0–50 |
| 2 | firmy / role | 0–10 pozycji: firma 2–80, rola 2–80, lata od–do (opcjonalnie) |
| 3 Opis i wideo | headline | 20–80 znaków |
| 3 | opis | 300–2000 znaków, zwykły tekst z akapitami (bez HTML/markdown — XSS, prostota) |
| 3 | wideo | opcjonalne (Q4); link YouTube (`youtube.com/watch`, `youtu.be`, `/shorts/`) albo Vimeo (`vimeo.com/<id>`); zapisywany jako `{ provider, videoId }`, nie surowy URL |
| 4 Stawka | stawka za 60 min | `Money` PLN, 40–1000 zł, pełne złote (Q9); 30 min = połowa, zaokrąglona w dół do grosza (`Money.allocate`) |
| 4 | podgląd zarobku | Q9 (prowizja nieznana — Q-B4 briefu) |
| 5 Dostępność | szablon tygodniowy | ≥ 3 h tygodniowo — walidacja w `scheduling` (E3-S2); `catalog` pyta o sumę przez publiczne zapytanie `scheduling` |
| 6 Weryfikacja | LinkedIn | URL `https://(www.)linkedin.com/in/<slug>`; wymagany; widoczny tylko dla admina |
| 6 | dane DAC7 i do wypłat | w `payouts` (niżej); wymagane przed wysłaniem wniosku (KONCEPCJA M1: „wymagane przed publikacją”) |
| 6 | KYC | Q2 |
| wysłanie | — | wszystkie kroki poprawne (pełny schemat), dostępność ≥ 3 h, dane DAC7 kompletne, akceptacja oświadczenia (prawdziwość danych, regulamin dla mentorów — Q13) |

Walidacja tych samych schematów zod (`packages/contracts/catalog`) działa w przeglądarce i na serwerze. Zapis szkicu kroku przyjmuje **częściowy** schemat kroku (dozwolone puste pola, niedozwolone niepoprawne). Wysłanie wymaga pełnego.

### `MentorApplication` (moduł `trust`)

- Jeden wniosek na każde wysłanie (`submitted`), z migawką profilu (`snapshot jsonb`). Admin ocenia to, co mentor wysłał, a nie stan zmieniany w tle.
- Decyzja: `approved` | `changes_requested` (≥ 1 pole z listy + komentarz 10–1000 znaków) | `rejected` (powód z listy + komentarz 10–1000 znaków). Lista powodów jest w `trust/domain/policies/config.ts`.
- Decyzja podjęta → wniosek zamknięty (`decided_at`, `decided_by`). Kolejny wniosek po poprawkach to nowy wiersz z odnośnikiem do poprzedniego, więc A1 pokazuje historię wniosków mentora.
- SLA: wiek wniosku w dniach roboczych (pon–pt, bez świąt w MVP — Q10); próg ostrzeżenia 2 dni robocze (C4).
- Każda decyzja (i zawieszenie/przywrócenie) → `trust.audit_entry` w tej samej transakcji.

### `PayoutProfile` (moduł `payouts`, dane DAC7 — spec stacku W5, §13)

Pola: imię i nazwisko prawne, data urodzenia, adres zamieszkania (ulica, kod, miasto, kraj), TIN + kraj wydania (dla PL: PESEL albo NIP), forma: osoba fizyczna / JDG; dla JDG: NIP (wymagany), REGON (opcjonalny), nazwa firmy (to także dane identyfikujące przedsiębiorcę z art. 30 DSA, spec §13); IBAN (walidacja sumy kontrolnej mod-97). Pola osobowe są szyfrowane w bazie (Q5). W UI po zapisie widać tylko maskowane wartości („PL61 … 1234”).

### Zdarzenia (spec §4.7, schematy w `packages/contracts/events`)

| Zdarzenie | Nadawca → odbiorca | Ładunek | Skutek |
|---|---|---|---|
| `catalog.mentor_application_submitted.v1` | `catalog` → `trust` | `mentorProfileId`, `userId`, `submittedAt`, `snapshot` | `trust` tworzy `MentorApplication` |
| `trust.mentor_application_decided.v1` | `trust` → `catalog` | `applicationId`, `mentorProfileId`, `decision`, `requestedFields?` | `catalog` zmienia stan profilu; przy `approved` ustawia `published_at` |
| `trust.mentor_suspension_changed.v1` | `trust` → `catalog` | `mentorProfileId`, `suspended: boolean` | `suspended` / `approved` |
| `catalog.mentor_profile_published.v1`, `catalog.mentor_profile_updated.v1`, `catalog.mentor_profile_unpublished.v1` | `catalog` → `catalog` (worker) | `mentorProfileId` | odświeżenie `mentor_search` (debounce) i `revalidateTag('mentor:{id}')` |

Kierunek zależności: `trust` nie importuje `catalog` ani odwrotnie. Łączą je tylko zdarzenia (reguła 5 §2.4). Zdarzenie wysyłamy jako zadanie pg-boss **w tej samej transakcji** co zmiana (opcja `db` z klientem transakcji MikroORM). Konsument zapisuje `event_id` w tabeli inbox swojego modułu z unikalnym indeksem przed przetworzeniem, więc duplikat nie ma efektu.

## Wymagania

1. **M1:** mentor bez profilu wchodzący na `/mentor` trafia na krok 1. Pasek postępu pokazuje 6 kroków i ukończone kroki. „Zapisz i dalej” zapisuje szkic kroku. Powrót do onboardingu otwiera pierwszy niekompletny krok. Przerwanie w dowolnym miejscu nie gubi zapisanych kroków.
2. **Zdjęcie:** upload bezpośrednio do magazynu przez presigned URL z ograniczeniem typu i rozmiaru (`content-length-range`). Serwer po uploadzie potwierdza wymiary (odczyt nagłówka pliku) i dopiero wtedy przypina klucz do profilu. Nieprzypięte pliki starsze niż 24 h sprząta zadanie pg-boss.
3. **Wideo:** na P3 odtwarzacz ładuje się dopiero po kliknięciu (fasada z miniaturą; `youtube-nocookie.com`, Vimeo z `dnt=1`). Przed kliknięciem nie ma cookies stron trzecich (RODO, CSP `frame-src` tylko dla tych dwóch domen).
4. **Wysłanie wniosku** (E2-S3): ekran „Wysłano do weryfikacji, zwykle do 2 dni roboczych”. `/mentor` pokazuje status (`submitted`, `changes_requested` z listą pól i komentarzem, `rejected` z powodem, `approved` z linkiem do publicznego profilu).
5. **Strażnik:** `proxy.ts` sprawdza tylko sesję (jak w F1). Status profilu sprawdza layout tras `/mentor/*` przez zapytanie `catalog`: przed `approved` każda trasa M2–M5 przekierowuje na M1/status, a M1 po `approved` przekierowuje na `/mentor`.
6. **A1:** kolejka wniosków `submitted` od najstarszego, z wiekiem i oznaczeniem przekroczonego SLA. Szczegóły pokazują migawkę profilu (jak P3), LinkedIn, status KYC, kompletność danych DAC7 (bez pełnych wartości — Q5), historię wniosków i wpisy audytu. Checklista (zdjęcie z twarzą, headline i opis bez danych kontaktowych, LinkedIn zgodny z imieniem, stawka, dane DAC7 kompletne, KYC wg Q2) zapisuje się razem z decyzją. Okno decyzji wymaga pól z punktu „MentorApplication”.
7. **Autoryzacja:** wszystkie zapytania i komendy `trust` wymagają uprawnienia `trust.mentor_application.decide` (tylko `admin_trust`). `admin_finance` nie ma dostępu do A1, ale ma dostęp do pełnych danych DAC7 (Q5). Mentor czyta i edytuje tylko swój profil (cudzy → 404). Nowe uprawnienia: `catalog.mentor_profile.edit.own`, `catalog.favorite.manage.own`, `trust.mentor_application.decide`, `payouts.payout_profile.edit.own`, `payouts.payout_profile.read_sensitive`.
8. **P2:** filtry temat (fraza → kategorie, tagi, headline), cena za 60 min 0–1000 zł, język sesji, minimum lat doświadczenia. Filtra „tylko zweryfikowani” nie ma w F2 — wraca w F4 jako „zweryfikowana tożsamość” (KYC) z plakietką (Q11). Sortowanie: trafność, cena ↑, cena ↓. Sortowanie po ocenie i liczbie sesji dochodzi w F5, bo do tego czasu wszyscy mają „Nowy mentor”. Wszystkie filtry, sortowanie i kursor są w URL (link do udostępnienia). Paginacja kursorem z przyciskiem „Pokaż więcej” zamiast przewijania w nieskończoność (WCAG 2.2: przewidywalny fokus i dostęp do stopki). Na mobile filtry są w bottom sheet. Stany L/E/Er/S jak w KONCEPCJI. Przy E: „Wyczyść filtr X” dla filtra, którego usunięcie daje najwięcej wyników (liczone zapytaniem `count` bez każdego filtra osobno).
9. **Trafność:** dopasowanie frazy (`pg_trgm` + `unaccent` na headline, tagach i nazwach kategorii; dokładne trafienie w tag/kategorię wyżej), potem kompletność profilu (wideo), potem data publikacji (nowi nie lądują na końcu). Zasady opisane publicznie na `/zasady-rankingu` (DSA art. 27, obawa mentorów o „niejasny ranking”). Brak płatnego pozycjonowania.
10. **P3:** hero (zdjęcie, imię, headline, kraj, języki, stawka 60/30 min), wideo, opis, kompetencje (kategorie, tagi), doświadczenie (lata, firmy), statystyki („Nowy mentor” do F5), podobni mentorzy (ta sama kategoria, podobna stawka, maks. 4). Strona publiczna z Cache Components (`"use cache"`, tag `mentor:{id}`), unieważniana zdarzeniami `catalog.*`. Profil niedostępny → 404 „Profil niedostępny” + podobni.
11. **P1:** pole tematu z autouzupełnianiem (2–80 znaków; błąd API → pole działa jak zwykłe wyszukiwanie), kafelki kategorii, „Jak to działa” (3 kroki), wyróżnieni mentorzy (Q12; pusta lista → sekcja ukryta), CTA „Zostań mentorem” → rejestracja z wybraną rolą mentora.
12. **Ulubieni:** dodaj/usuń na karcie P2 i na P3 (zalogowany uczeń). Gość → logowanie z `returnTo` i po powrocie mentor dodaje się do ulubionych. Mentor i admin nie widzą przycisku. Lista `/ulubieni` zawiera tylko profile `approved`, a zawieszony mentor znika z listy bez błędu.
13. **Teksty i stany:** wszystkie teksty w `apps/web/messages/pl.json`, stany L/E/Er/S na każdym ekranie, WCAG 2.2 AA (0 naruszeń axe serious/critical), 360 i 1280 px.
14. **Kontrakty:** oRPC `/api/v1` (KONCEPCJA §4): `GET/PUT /me/mentor-profile`, `PUT /me/mentor-profile/steps/:step`, `POST /me/mentor-profile/submit`, `POST /uploads/mentor-photo` (presigned), `GET/PUT /me/payout-profile`, `GET /mentors`, `GET /mentors/:slug`, `GET /mentors/:id/similar`, `GET /mentors/featured`, `GET /topics?query=`, `GET/POST/DELETE /me/favorites[/:mentorId]`, `GET /admin/mentor-applications`, `GET /admin/mentor-applications/:id`, `POST /admin/mentor-applications/:id/decision`. Formularze w RSC wołają te same serwisy aplikacyjne przez server actions.

## Kryteria akceptacji

- [x] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone; testy integracyjne i E2E w CI zielone; brak nowych ostrzeżeń Knip i dependency-cruiser (granice `catalog` ↔ `trust` ↔ `payouts` tylko przez `index.ts` i zdarzenia). *(E2-S2 — PR #68, CI zielone)*
- [x] **[M1]** Polityki walidacji (tabela pól) mają testy Vitest na granicach (np. headline 19/20/80/81 znaków, stawka 39/40/1000/1001 zł, 2/3/15/16 tagów); pokrycie gałęzi `catalog/domain` ≥ 90%. *(E2-S2, kroki 1–4 planu)*
- [x] **[M1]** Maszyna stanów `MentorProfile`: test każdego dozwolonego przejścia i odrzucenia niedozwolonego (`catalog.invalid_transition`). *(E2-S2, krok 1)*
- [x] **[M1]** Szkic: E2E przechodzi kroki 1–4, przeładowuje stronę i wraca do pierwszego niekompletnego kroku z zachowanymi danymi; błędy pól inline, fokus na pierwszym błędzie. *(E2-S2, krok 6)*
- [x] **[M1]** Zdjęcie: plik > 5 MB, GIF i obraz 399×399 odrzucone z komunikatem; poprawny plik widoczny w podglądzie; test kontraktowy `FileStorage` przechodzi na fake'u i adapterze lokalnym. *(E2-S2, kroki 4 i 6)*
- [x] **[M1]** Wideo: link YouTube/Vimeo zapisany jako `{ provider, videoId }`; inny URL odrzucony. *(E2-S2, kroki 1 i 6)*
- [ ] **[M1]** Wysłanie: brak dostępności ≥ 3 h, niekompletne dane DAC7 albo brak oświadczenia → wysłanie zablokowane z listą brakujących kroków; po wysłaniu formularze tylko do odczytu; test integracyjny: wysłanie w jednej transakcji zmienia stan i dodaje zadanie zdarzenia (rollback → brak zdarzenia).
- [ ] **[M1]** IBAN z błędną sumą kontrolną odrzucony; dane DAC7 w bazie zaszyfrowane (test integracyjny czyta surową kolumnę i nie widzi tekstu jawnego); w UI tylko wartości maskowane.
- [ ] **[M1, A1]** Pełny przepływ E2E: mentor wysyła → admin prosi o zmiany (pola „headline” i „zdjęcie”) → mentor widzi wyróżnione pola i komentarz, poprawia, wysyła ponownie → admin zatwierdza → profil widoczny na P2 i P3.
- [ ] **[A1]** Odrzucenie wymaga powodu, a prośba o zmiany wymaga ≥ 1 pola i komentarza (zod + test komendy); decyzja tworzy wpis w `trust.audit_entry`; student, mentor i `admin_finance` → 403 na trasach i w komendach `trust`; cudzy/nieistniejący wniosek → 404.
- [ ] **[A1]** Zdarzenia: duplikat `trust.mentor_application_decided.v1` nie zmienia stanu drugi raz (test inbox); konkurencyjne decyzje dwóch adminów → druga dostaje 409.
- [ ] **[A1]** Kolejka pokazuje wiek wniosku w dniach roboczych i oznacza przekroczenie 2 dni (test z `FakeClock` przez weekend).
- [ ] **[P2]** Filtry w URL odtwarzają ten sam wynik po wklejeniu linku; cena min > max → komunikat walidacji; E2E stanów L/E/Er/S; E: przycisk „Wyczyść filtr X” wskazuje filtr dający najwięcej wyników (test integracyjny).
- [ ] **[P2]** Wyszukiwanie bez polskich znaków („jezyk”, „zrodla”) znajduje profile z polskimi znakami; profil `submitted`/`suspended` nie pojawia się w wynikach (test integracyjny `mentor_search`).
- [ ] **[P2]** Strona `/zasady-rankingu` istnieje i jest podlinkowana z P2.
- [ ] **[P3]** Profil `approved` renderuje się bez JS dla treści (RSC); wideo ładuje się dopiero po kliknięciu (E2E: brak żądań do domen YouTube/Vimeo przed kliknięciem); profil niedostępny → 404 + podobni; po zmianie profilu przez mentora P3 pokazuje nową treść (unieważnienie tagu).
- [ ] **[P1]** Autouzupełnianie 2–80 znaków, przy błędzie API pole działa jak zwykłe wyszukiwanie (E2E z przechwyconym 500); brak wyróżnionych → sekcja ukryta.
- [ ] **[ulubieni]** Gość klika „Dodaj do ulubionych” → logowanie → powrót, mentor jest na liście (E2E); mentor i admin nie widzą przycisku.
- [ ] **[M1, A1, P1, P2, P3]** E2E 360 i 1280 px z axe (0 naruszeń serious/critical) dla każdego ekranu F2.
- [ ] Przegląd człowieka: migracje (`catalog`, `trust`, `payouts`), moduł `payouts` (szyfrowanie DAC7) — `.ai/agentic.config.json` `humanReview`.

## Projekt rozwiązania

### `packages/core`

- `src/shared/infrastructure/events/` — **nowe, wspólne:** `publishEvent(em, event)` (pg-boss `send` z klientem transakcji MikroORM), `subscribe(queue, handler)` dla workera, tabela inbox per moduł (`<schema>.inbox_event(event_id pk, processed_at)`), helper `withInbox`. Wzorzec staje się częścią „wzoruj się na” w `scheduling/AGENTS.md`.
- `src/modules/catalog/` (struktura jak `scheduling`, §2.4):
  - `domain/` — `mentor-profile.entity.ts`, `mentor-profile.state.ts`, `mentor-profile.events.ts`, `catalog.errors.ts` (`catalog.invalid_transition`, `catalog.profile_locked`, `catalog.incomplete_profile`, `catalog.photo_invalid`, `catalog.not_found`), `policies/` (`profile-fields.policy.ts`, `video-link.policy.ts`, `rate.policy.ts`, `submission-readiness.policy.ts`, `slug.policy.ts`, `relaxing-filter.policy.ts`, `config.ts`), `ports/file-storage.ts`.
  - `application/` — `get-my-mentor-profile.query.ts`, `save-profile-step.command.ts`, `request-photo-upload.command.ts`, `confirm-photo-upload.command.ts`, `submit-mentor-profile.command.ts`, `apply-application-decision.handler.ts`, `search-mentors.query.ts`, `get-public-profile.query.ts`, `get-similar-mentors.query.ts`, `get-featured-mentors.query.ts`, `suggest-topics.query.ts`, `favorites.commands.ts`, `list-favorites.query.ts`, `get-mentor-access.query.ts` (dla strażnika `/mentor/*`).
  - `infrastructure/` — rekordy MikroORM, repozytoria, `r2-file-storage.ts`, `local-file-storage.ts` (dev/e2e: katalog na dysku + trasa Next serwująca pliki), widok `mentor_search` przez Kysely.
  - `jobs/` — `refresh-mentor-search` (debounce/singleton), `cleanup-orphan-uploads` (cron).
  - `migrations/` — schemat `catalog`: `mentor_profile` (`id`, `user_id` FK unikalny, `status`, `slug` unikalny, `headline`, `bio`, `photo_key`, `video_provider`, `video_id`, `country`, `languages text[]`, `years_experience`, `experience jsonb`, `rate_60_amount bigint`, `currency char(3)`, `linkedin_url`, `accepting_new`, `completed_steps text[]`, `requested_fields text[]`, `submitted_at`, `published_at`, `version`, `created_at`, `updated_at`), `category` (`slug`, `name`, `sort`), `mentor_profile_category`, `tag` (`id`, `label`, `normalized` unikalny), `mentor_profile_tag`, `favorite` (`student_user_id`, `mentor_profile_id`, `created_at`, PK złożony), `upload` (klucz, właściciel, `confirmed_at`), `inbox_event`; zmaterializowany widok `mentor_search` (tylko `approved`; `tsvector`/trigramy z `unaccent`, indeksy GIN, unikalny indeks pod `REFRESH … CONCURRENTLY`).
- `src/modules/trust/` — `domain/` (`mentor-application.entity.ts`, `decision.policy.ts`, `sla.policy.ts` z dniami roboczymi, `audit-entry.entity.ts`, `config.ts` z powodami i polami), `application/` (`list-mentor-applications.query.ts`, `get-mentor-application.query.ts`, `decide-mentor-application.command.ts`, `set-mentor-suspension.command.ts`, `open-application.handler.ts`), `migrations/` (schemat `trust`: `mentor_application`, `audit_entry`, `inbox_event`), `AGENTS.md` + `CLAUDE.md`.
- `src/modules/payouts/` — `domain/` (`payout-profile.entity.ts`, `iban.policy.ts`, `tin.policy.ts`), `application/` (`get-my-payout-profile.query.ts`, `save-payout-profile.command.ts`, `get-payout-profile-completeness.query.ts` — publiczne zapytanie dla `catalog` i `trust`), `infrastructure/` (`field-cipher.ts`: AES-256-GCM, klucz `PAYOUTS_ENCRYPTION_KEY` z env walidowanego zod, wersja klucza w kolumnie), `migrations/` (schemat `payouts`: `payout_profile`), `AGENTS.md` + `CLAUDE.md`.
- `identity/domain/role.ts` — nowe uprawnienia (wymaganie 7).
- Zależności między modułami: `catalog` → `scheduling` (zapytanie „suma dostępności”, E2-S3), `catalog` → `payouts` (kompletność), `trust` → `payouts` (kompletność dla checklisty), `catalog` ↔ `trust` tylko zdarzenia. Bez cykli.

### `packages/contracts`

`catalog/` (schematy kroków M1 — częściowe i pełne, filtry P2 jako schemat parametrów URL, odpowiedzi P1–P3), `trust/` (decyzja), `payouts/` (formularz DAC7), `events/` (schematy zdarzeń z tabeli), routery oRPC.

### `packages/ui` (Storybook — design system, ADR-0006)

- **Do użycia z istniejących:** `MentorCard`, `ProfileHero`, `StickyBookingBar`, `ActiveFilters`, `PageHeader`, `Money`, ekrany-wzorce `screens/p2-search` i `screens/p3-profile`, wzorce `patterns/form`, `patterns/filter-list`, `patterns/detail-view`, `patterns/decision-reason` (decyzja A1); komponenty bazowe `Field`, `Input`, `Textarea`, `Select`, `Combobox`, `Slider`, `Sheet`, `Table`, `Tabs`, `Badge`, `Alert`, `EmptyState`, `ErrorState`, `Skeleton`, `Dialog`, `Toast`.
- **Brakujące (nowe, ze stories i stanami):** `Stepper` (6 kroków, stan ukończony/bieżący/błąd, dostępny jako lista z `aria-current="step"`), `TagInput`, `PhotoUploader` (wybór, kadrowanie, postęp, błąd, ponów), `VideoLinkField` + `VideoFacade`, `RateInput` + `EarningsPreview`, `ProfileStatusCard` (status wniosku na `/mentor`), `ApplicationQueueTable`, `VerificationChecklist`, `AuditTrail`, `FavoriteToggle`, `TopicSearch` (autouzupełnianie na `Combobox`). Każdy dochodzi w kroku planu, który go używa, z dopiskiem w `docs/design-system.md`.

### `apps/web`

`app/mentor/layout.tsx` (strażnik statusu), `app/mentor/page.tsx` (status zamiast placeholdera F1), `app/mentor/onboarding/[krok]/page.tsx` (RSC + formularz-liść `"use client"`), `app/admin/weryfikacja/page.tsx`, `app/admin/weryfikacja/[id]/page.tsx`, `app/mentorzy/page.tsx`, `app/mentorzy/[slug]/page.tsx` (+ `not-found.tsx`), `app/page.tsx` (P1 zamiast strony szkieletu), `app/ulubieni/page.tsx`, `app/zasady-rankingu/page.tsx`, `app/pliki/[...key]/route.ts` (tylko adapter lokalny), nagłówki CSP (`img-src` R2/lokalny, `frame-src` YouTube nocookie i Vimeo), `messages/pl.json`.

### `apps/worker`

Rejestracja konsumentów zdarzeń (`trust` ← submitted, `catalog` ← decided/suspension, `catalog` ← published/updated → odświeżenie widoku i unieważnienie cache), cron `cleanup-orphan-uploads`. Unieważnienie cache Next z workera idzie przez wywołanie wewnętrznej trasy `web` z sekretem (`revalidateTag` działa tylko w procesie Next).

### Bezpieczeństwo (OWASP Top 10:2025, spec §8)

- A01 (kontrola dostępu): własność profilu w każdej komendzie (`userId` z sesji, nigdy z ciała żądania); `admin_trust` tylko dla `trust`; testy 403/404.
- A02/A04 (kryptografia, dane wrażliwe): DAC7 szyfrowane w kolumnach, klucz poza bazą, pełne wartości tylko dla `admin_finance` z wpisem w audycie odczytu (Q5); brak DAC7 w logach (redakcja pino).
- A03 (łańcuch dostaw): jedyna nowa zależność to klient S3 dla R2 (`@aws-sdk/client-s3` + `s3-request-presigner`) i lekki czytnik nagłówków obrazów; obie z `minimumReleaseAge`.
- A05 (wstrzyknięcia): opis jako zwykły tekst (React escapuje), filtry P2 przez zod i parametryzowane zapytania Kysely, wideo jako `{ provider, videoId }` składane w URL po naszej stronie.
- Upload: presigned URL ważny 5 min, klucz generowany przez serwer (`mentor-photos/<profileId>/<uuid>`), typ i rozmiar w polityce, wymiary sprawdzane po stronie serwera.
- Obchodzenie platformy: checklista A1 obejmuje dane kontaktowe w opisie. Automatyczne `detectOffPlatformContact` dochodzi w F6 i może sprawdzać też opis profilu.

## Plan wdrożenia

Każdy krok to osobny PR (≤ ~400 linii poza migracjami, snapshotami i seedem), w tej kolejności. W nawiasie historia z backlogu.

1. `feat(catalog)`: moduł — domena `MentorProfile` (maszyna stanów, polityki pól, stawka jako `Money`, slug), błędy, testy Vitest; `AGENTS.md`/`CLAUDE.md` modułu; uprawnienia w `identity`. **(E2-S2 T1)**
2. `feat(core)`: wspólna publikacja i konsumpcja zdarzeń (pg-boss w transakcji, inbox), schematy w `contracts/events`, test integracyjny „rollback = brak zdarzenia”, „duplikat = brak efektu”. **(E2-S2 T1, wymagane przez E2-S3)**
3. `feat(catalog)`: migracja schematu `catalog` (profil, taksonomia, upload), seed kategorii, komendy szkicu kroków 1–4 i zapytanie profilu, router oRPC; testy integracyjne (własność, 409 przy wersji). **(E2-S2 T1)**
4. `feat(catalog)`: port `FileStorage` + adapter R2 + lokalny + fake + test kontraktowy; presigned upload i potwierdzenie zdjęcia; cron sprzątający. **(E2-S2 T2)**
5. `feat(ui)`: `Stepper`, `TagInput`, `PhotoUploader`, `VideoLinkField`/`VideoFacade`, `RateInput`/`EarningsPreview` ze stories (a11y). **(E2-S2 T3)**
6. `feat(web)`: M1 kroki 1–4 (`/mentor/onboarding/[krok]`), strażnik `/mentor/*`, E2E 360/1280 + axe. **(E2-S2 T3, T4)**
7. `feat(payouts)`: moduł minimalny — `PayoutProfile`, IBAN/TIN, szyfrowanie pól, migracja, zapytanie kompletności; testy. **(E2-S3 T2)**
8. `feat(catalog)`: krok 5 (osadzony edytor dostępności z E3-S2 + zapytanie sumy z `scheduling`), krok 6 (LinkedIn, formularz DAC7, KYC wg Q2), podgląd, wysłanie → zdarzenie; `/mentor` ze statusem; E2E. **Wymaga ukończonego E3-S2.** **(E2-S3 T1–T4)**
9. `feat(trust)`: moduł — `MentorApplication`, `AuditEntry`, decyzja, zawieszenie, SLA w dniach roboczych, konsument `submitted`, migracja, testy; konsument decyzji w `catalog`. **(E2-S4 T1, T3)**
10. `feat(web)`: A1 kolejka, szczegóły z checklistą, okno decyzji, audyt; seed wniosków; E2E pełnego przepływu M1 → A1 → P3. **(E2-S4 T2, T4)**
11. `feat(catalog)`: widok `mentor_search`, zapytanie wyszukiwania z filtrami i kursorem, „filtr najbardziej zawężający”, job odświeżania; testy integracyjne (polskie znaki, tylko `approved`). **(E2-S5 T1, T2)**
12. `feat(web)`: P2 (filtry w URL, bottom sheet, stany), `/zasady-rankingu`, seed mentorów z mockupów; E2E. **(E2-S5 T3, T5)** — T4 (filtr dostępności) po E3-S3.
13. `feat(web)`: P3 (Cache Components + unieważnianie z workera, fasada wideo, podobni, 404), CTA za flagą do E3-S4; E2E. **(E2-S6 T1, T3, T4)** — T2 (tydzień dostępności) po E3-S3.
14. `feat(web)`: P1 (autouzupełnianie tematów, kategorie, wyróżnieni, CTA mentora); E2E. **(E2-S7)**
15. `feat(catalog)`: ulubieni — komendy, lista `/ulubieni`, `FavoriteToggle`, `returnTo` dla gościa; E2E. **(E2-S8)**

Kroki 1–7 i 9 nie zależą od F3; krok 8 czeka na E3-S2. Kroki 11–15 można robić równolegle z F3 (rozłączny zakres modułów: `catalog`/`apps/web` trasy publiczne vs `scheduling`).

## Open Questions

Każde pytanie ma rekomendację; po odpowiedziach wpisujemy decyzje w „Decyzje i zmiany” i ustawiamy `status: approved`.

- **Q1. Dane DAC7 i do wypłat — w F2 czy później?** KONCEPCJA i backlog zbierają je w kroku 6, ale w Now nie ma płatności ani wypłat. Rekomendacja: **zbieramy w F2** (moduł `payouts`, minimalny). Weryfikacja i tak obejmuje te dane, a dopisywanie ich później oznaczałoby drugą falę onboardingu dla wszystkich mentorów. Alternatywa: krok 6 tylko z LinkedIn, a DAC7 przy pierwszej wypłacie (F7).
- **Q2. KYC (dokument tożsamości) przed publikacją?** Dostawcą KYC jest Stripe Connect (spec stacku §1.3), który wchodzi w F4. Rekomendacja: w F2 **bez KYC dokumentowego**. Port `KycProvider` istnieje tylko jako interfejs i fake, admin weryfikuje LinkedIn, zdjęcie i dane DAC7, a status KYC na profilu to „do uzupełnienia w F4”. **Wypłaty (F7) i przyjmowanie płatności (F4) są zablokowane bez KYC.** To łagodzi regułę 8 briefu („KYC przed publikacją”), więc wymaga Twojej decyzji. Alternatywy: (a) Stripe Connect onboarding już w F2 (wciąga F4 wcześniej, wymaga konta Stripe), (b) brak publikacji do F4 (Now kończy się bez widocznych mentorów — sprzeczne z celem Now).
- **Q3. Taksonomia.** Rekomendacja: **kategorie** jako zamknięta lista seedowana i zmieniana migracją (start: IT/programowanie, data i AI, produkt i UX/design, kariera i rekrutacja, biznes i zarządzanie, marketing i sprzedaż; ~6–10 pozycji). **Tagi** wpisuje mentor dowolnie, z normalizacją i podpowiedziami z istniejących; bez moderacji tagów w MVP. Słownik synonimów wyszukiwarki dochodzi, gdy dane pokażą potrzebę. Kto zatwierdza listę kategorii?
- **Q4. Wideo wymagane?** Rekomendacja: **opcjonalne** (próg wejścia dla mentorów jest ważniejszy w starcie podaży), z punktem w trafności za wideo i podpowiedzią w M1. KONCEPCJA nie przesądza.
- **Q5. Ochrona danych DAC7.** Rekomendacja: szyfrowanie pól aplikacyjne (AES-256-GCM, klucz w Secret Manager, wersjonowany). `admin_trust` widzi tylko kompletność i wartości maskowane. Pełne wartości widzi tylko `admin_finance`, a każdy odczyt trafia do audytu. Retencja zgodna z DAC7 (10 lat od końca roku raportowego) — do potwierdzenia przez doradcę razem z Q6 spec stacku.
- **Q6. Edycja profilu po wysłaniu i po zatwierdzeniu** (pytanie z prototypu M1). Rekomendacja: w `submitted` edycja zablokowana, z opcją „Wycofaj wniosek” (powrót do `draft`). W `approved` stawka, języki i dostępność zmieniają się od razu. Zdjęcie, headline, opis i wideo publikujemy od razu, ale zmiana trafia do A1 jako „zmiana po zatwierdzeniu” (post-moderacja, bez ukrywania profilu). Alternatywa: każda zmiana treści wymaga ponownej weryfikacji, a profil zostaje w starej wersji do decyzji.
- **Q7. Po odrzuceniu** — czy mentor może złożyć nowy wniosek? Rekomendacja: tak, po 30 dniach (stała w `config.ts`), z historią poprzednich wniosków w A1. Odrzucenie z powodu „fałszywa tożsamość / nadużycie” jest ostateczne.
- **Q8. Zawieszenie (`suspended`) w F2?** P3 ma stan „profil niedostępny (np. zawieszony)”. Rekomendacja: **tak, minimalnie** — `admin_trust` zawiesza/przywraca z powodem i wpisem w audycie, a profil znika z P1–P3 i ulubionych. Skutki dla zaplanowanych sesji ustala F3 (backlog E3-S5 T2).
- **Q9. Stawka i podgląd zarobku.** Rekomendacja: stawka w pełnych złotych (40–1000), 30 min = połowa. Podgląd „ile dostaniesz” **bez kwoty po prowizji**, dopóki model prowizji jest otwarty (Q-B4 briefu) — tekst „Prowizja platformy: zasady ogłosimy przed uruchomieniem płatności”. Alternatywa: pokazać przykładową prowizję z KONCEPCJI (ryzyko obietnicy bez decyzji).
- **Q10. SLA weryfikacji** — 2 dni robocze liczone pon–pt **bez świąt** w MVP (rekomendacja), czy z kalendarzem świąt PL od razu?
- **Q11. „Tylko zweryfikowani” w P2.** Skoro publiczni są tylko zatwierdzeni mentorzy, filtr nic nie zmienia. Rekomendacja: **usunąć filtr w F2**, a plakietkę „Zweryfikowany” oznaczającą KYC dodać w F4 razem z filtrem. Alternatywa: zostawić filtr jako „zweryfikowana tożsamość” po F4.
- **Q12. CTA rezerwacji i wyróżnieni.** (a) Do E3-S4 sticky CTA na P3 ukryte flagą środowiskową `NEXT_PUBLIC_BOOKING_ENABLED` (PostHog jeszcze nie działa) — akceptujesz? (b) Wyróżnieni na P1 (notatka prototypu P1): rekomendacja — automatycznie 4 mentorów z kompletnym profilem (zdjęcie + wideo), rotacja dzienna deterministyczna (ziarno = data), reguła opisana na `/zasady-rankingu`; bez ręcznego wyboru w MVP.
- **Q13. Oświadczenie i regulamin dla mentorów** przy wysłaniu wniosku — czy istnieje treść (regulamin świadczenia usług przez mentorów, zasady treści profilu)? Rekomendacja: checkbox z wersjonowaną zgodą (mechanizm zgód z F1, nowy typ `mentor_terms`) i robocza treść do czasu wersji prawnej.
- **Q14. Adres profilu.** Rekomendacja: `/mentorzy/<imie>-<6 znaków id>` (np. `anna-k3x9q2`), bez nazwiska (F1 zbiera tylko imię). Slug stały po publikacji, więc zmiana imienia go nie zmienia. Alternatywa: czysty UUID (gorsze SEO).

## Decyzje i zmiany

- 2026-11-22 — Szkic specyfikacji (E2-S1, #28). Polecenie zadania wskazywało nieistniejące pliki („2026-09-08-mentors-become-bookable”, „2026-09-09-e02-design-handoff.md”, epik #8). Właściciel wybrał zakres E2-S1 z backlogu tego repo. Specyfikacja opiera się na briefie, backlogu, KONCEPCJI, spec stacku, spec F1 i komponentach Storybook. Rozstrzygnięcia przyjęte bez pytania (zgodne ze spec stacku): `FileStorage` (nazwa ze spec stacku; backlog mówił `StorageProvider`) z R2 w jurysdykcji EU i adapterem lokalnym dla dev/e2e; wideo tylko jako link YouTube/Vimeo (§1.3); paginacja „Pokaż więcej” zamiast nieskończonej (WCAG); wyszukiwarka na widoku zmaterializowanym (§4.8); dane DAC7 w nowym module `payouts` (§2.3), a nie w `catalog`. **Status `draft` — czeka na odpowiedzi Q1–Q14 i akceptację właściciela.**
- 2026-11-22 — **Odpowiedzi właściciela (wszystkie zgodne z rekomendacjami), `status: approved`:** **Q1** dane DAC7 i do wypłat zbierane w F2, krok 6 M1, w minimalnym module `payouts`; **Q2** publikacja bez KYC dokumentowego — port `KycProvider` tylko jako interfejs i fake, KYC przez Stripe w F4, płatności (F4) i wypłaty (F7) zablokowane bez KYC; reguła 8 briefu poprawiona; **Q3** kategorie jako zamknięta lista (seed + migracja), tagi wolne z normalizacją i podpowiedziami, bez moderacji tagów; **Q4** wideo opcjonalne, z punktem w trafności; **Q5** szyfrowanie pól DAC7 (AES-256-GCM, klucz wersjonowany poza bazą), pełne wartości tylko dla `admin_finance` z audytem odczytu, `admin_trust` widzi kompletność i maski; **Q6** w `submitted` edycja zablokowana z „Wycofaj wniosek”, w `approved` zmiany publikowane od razu, a zmiany treści (zdjęcie, headline, opis, wideo) trafiają do A1 jako post-moderacja; **Q7** nowy wniosek po 30 dniach od odrzucenia, odrzucenie za nadużycie ostateczne; **Q8** zawieszanie i przywracanie w F2 (`admin_trust`, powód, audyt); **Q9** podgląd zarobku bez kwoty po prowizji; **Q10** SLA 2 dni robocze liczone pon–pt bez świąt; **Q11** filtr „tylko zweryfikowani” usunięty do F4; **Q12** CTA rezerwacji za flagą `NEXT_PUBLIC_BOOKING_ENABLED` do E3-S4, 4 wyróżnionych dobieranych automatycznie (kompletny profil, rotacja dzienna z ziarnem = data, reguła na `/zasady-rankingu`); **Q13** wersjonowana zgoda `mentor_terms` (mechanizm zgód F1) z roboczą treścią; **Q14** adres `/mentorzy/<imie>-<6 znaków id>`, slug stały po publikacji. E2-S1 zamknięte; następna historia: E2-S2 (kroki 1–6 planu).
- 2026-11-23 — **E2-S2 (#29) — kroki 1–6 planu zaimplementowane** (kroki 7–15 zostają w E2-S3…E2-S8). Odejścia od planu, zapisane zgodnie z SDLC §3:
  - **Krok 2 (zdarzenia):** publikacja idzie do pg-boss przez `fromKysely(transakcja)` (MikroORM 7 prowadzi transakcję na Kysely), a konsument zapisuje `event_id` w `catalog.inbox_event` przed przetworzeniem — „rollback = brak zdarzenia” i „duplikat = brak efektu” pokrywają testy integracyjne.
  - **Krok 4 (FileStorage):** port zostaje w domenie (`catalog/domain/ports/file-storage.ts`), a fake stoi obok niego w `catalog/infrastructure/` — `packages/testing` nie może importować `packages/core` (cykl pakietów), więc fake nie trafi do `@kompas/testing`. Adapter lokalny podpisuje swój upload HMAC-em (klucz, typ, rozmiar, wygaśnięcie) i wystawia go pod `/pliki/<klucz>` — trasa `apps/web/app/pliki/[...key]/route.ts` (GET: serwuje plik, PUT: przyjmuje podpisany upload). W produkcji pliki leżą w R2 (jurysdykcja EU), a R2 adapter wystawia prawdziwy presigned URL.
  - **Krok 6 (M1):** formularze kroków 1–4 walidują się tym samym schematem z `packages/contracts/catalog` co serwer, ale zwracają **kody problemów domeny** (`required`, `too_short`, `too_few`, `out_of_range`, …) zamiast domyślnych komunikatów Zoda — dzień dziś browser i serwer mówią o tym samym błędzie tak samo. Kroki 5–6 (dostępność, weryfikacja, DAC7) pokazują komunikat „ten krok dochodzi w kolejnym etapie” (E2-S3).
  - **Krok 6 (strażnik):** `proxy.ts` pilnuje tylko sesji (tak jak w F1), a layout `/mentor/*` sprawdza rolę `mentor`; status profilu sprawdza sam ekran M1 (po `approved` odsyła na `/mentor`), bo tras M2–M5 w F2 jeszcze nie ma.
  - **Domena:** typy `MentorProfileStatus`/`MentorProfileEvent` wydzielone do `mentor-profile.status.ts` — `catalog.errors.ts` i maszyna stanów odwoływały się do siebie nawzajem, a dependency-cruiser odrzuca cykle.
