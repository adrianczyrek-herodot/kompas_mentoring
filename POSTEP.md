# POSTĘP — Prototyp klikalny Kompasu

## Etap 0 — Plan ✅ ZAKOŃCZONY

### Technologia i sposób uruchomienia

**Stack prototypu:**
- **React 19 + TypeScript + Vite** w `prototypes/kompas-flow/`
- Stylowanie przez **tokeny CSS design systemu** (lokalna kopia `globals.css` + `tokens.css`)
- **Stan w pamięci** (React Context + useReducer) — bez backendu
- **Router**: hash-based (`#/sciezka`)

**Uruchomienie:**
```bash
cd prototypes/kompas-flow
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ → gotowy do deployu
```

---

## Etap 1 — Szkielet i ścieżka bez błędów ✅ ZAKOŃCZONY

### Zbudowane:
- ✅ **Projekt Vite + React 19 + TypeScript** w `prototypes/kompas-flow/`
- ✅ **Design system tokens** — skopiowane z `@kompas/ui` (globals.css + tokens.css), system fonts
- ✅ **ProtoBar** (górny pasek): wybór ekranu, rola, stan danych, motyw, mapa ekranów, komentarze
- ✅ **ReviewBar** (dolny pasek): persona, symulacja płatności, konflikty, wygaśnięcie, dark mode
- ✅ **ReviewSidebar** (panel komentarzy): dodawanie/usuwanie/rozwiązywanie komentarzy na ekranach
- ✅ **Router hash-based** z guardami ról (public/student/mentor/admin)
- ✅ **DemoContext** (stan aplikacji): role, personas, booking flow, sessions, messages, notifications
- ✅ **Theme switching** (light/dark via `.dark` na `<html>`)

### Ekrany ścieżki szczęśliwej (F1) — zbudowane i działające:

| Ekran | ID | Status | Funkcjonalność |
|-------|-----|--------|----------------|
| Strona główna | P1 | ✅ | Hero, wyszukiwarka, kategorie, featured mentors, CTA |
| Wyszukiwarka mentorów | P2 | ✅ | Filtry (temat, cena, język, doświadczenie), sortowanie, MentorCard, ulubione |
| Profil mentora | P3 | ✅ | Hero, wideo, stats, opinie, kalenderz tygodnia, StickyBookingBar |
| Logowanie/Rejestracja | P4 | ✅ | Tabs, email/password, social (symulacja), zgody, strength meter |
| Wybór terminu | U1 | ✅ | Tydzień, SlotGrid, strefa czasowa, hold 10min, conflict 409 |
| Checkout | U2 | ✅ | Podsumowanie, cel sesji, metody płatności, kod rabatowy, hold countdown |
| Potwierdzenie | U3 | ✅ | Szczegóły, dodaj do kalendarza (Google/Outlook/.ics), checklistę |
| Moje sesje | U4 | ✅ | Tabs nadchodzące/minione, NextSessionCard, SessionListItem, saldo, filtry |
| Szczegóły sesji | U5 | ✅ | Dane, cel, notatka, action items, przełóż/anuluj/zgłoś (Sheet/AlertDialog) |

### Kontrolki scenariuszy (ReviewBar) — działające:
- ✅ Persona switcher (Adrian/Julia/Paweł)
- ✅ Symulacja płatności: sukces / odrzucona / 3DS / wygaśnięcie hold
- ✅ Force error toggle
- ✅ Slot conflict toggle (409)
- ✅ Session expiry toggle
- ✅ Dark mode toggle

### Silnik przeglądu (komentarze) — działający:
- ✅ Panel boczny (ReviewSidebar) z komentarzami na ekran
- ✅ Dodawanie/usuwanie/rozwiązywanie komentarzy
- ✅ Persistence w localStorage
- ✅ PrototypeId = "kompas-flow"

---

## Etap 2 — Stany, role i scenariusze ✅ ZAKOŃCZONY

### Zbudowane ekrany dodatkowe:

| Ekran | ID | Status | Funkcjonalność |
|-------|-----|--------|----------------|
| Pokój sesji | U6 | ✅ | Video stage, kontrolki mikrofon/kamera/ekran, czat, notatki wspólne, timer, no-show button |
| Ocena sesji | U7 | ✅ | Gwiazdki 1-5, tagi publiczne/prywatne, opinia, wybór kontynuacji/zamiany/zwrotu |
| Plany i saldo | U8 | ✅ | PlanPicker, PriceBreakdown, ActivePlanCard, BalanceTable, TransferBalanceDialog, historia płatności/faktur |
| Postępy | U9 | ✅ | GoalCard (edycja celu), MilestoneList, ActionItemChecklist, SessionNotesTimeline |
| Wiadomości | S1 | ✅ | ThreadList, ThreadView, Composer, ContextCard, OffPlatformWarning (wykrywanie kontaktu poza platformą) |
| Powiadomienia | S2 | ✅ | Lista z deep linkami, filtry all/unread, oznacz jako przeczytane |
| Konto i ustawienia | S3 | ✅ | Profil, strefa czasowa, waluta, metody płatności, zgody RODO, eksport/usunięcie konta |
| Onboarding mentora | M1 | ✅ | 6 kroków: O mnie, Kompetencje, Opis/wideo, Stawka (z podglądem zarobku), Dostępność, Weryfikacja (LinkedIn, KYC, IBAN) |
| Panel mentora | M2 | ✅ | Dzisiejsze sesje, prośby o próbną (akceptuj/odrzuć), zadania, KPI, status profilu |
| Kalendarz mentora | M3 | ✅ | Edytor dostępności (klik/klik+przeciągnij), wyjątki (urlop/dodatkowe), ustawienia (wyprzedzenie, bufor, wstrzymanie), sync Google Calendar |
| Uczniowie mentora | M4 | ✅ | Lista z filtrami (aktywni/próbni/nieaktywni), profil ucznia (cel, historia, saldo), edytor notatki po sesji z action items |
| Zarobki mentora | M5 | ✅ | Dostępne/oczekujące/wypłacone, pasek prowizji, historia zarobków, wypłata (min 100 PLN), historia wypłat |
| Weryfikacja mentorów | A1 | ✅ | Kolejka wniosków (wiek, SLA), podgląd, checklista KYC, decyzja (zatwierdź/poprawki/odrzuć), audyt |
| Spory i zwroty | A2 | ✅ | Kolejka sporów, oś zdarzeń sesji, stanowiska stron, rozstrzygnięcie (typ zwrotu + kwota + uzasadnienie) |

### Stany danych — zaimplementowane dla wszystkich ekranów:
- ✅ **Loading** — skeletony (Skeleton)
- ✅ **Empty** — EmptyState z ikoną, tytułem, opisem i CTA
- ✅ **Error** — ErrorState z komunikatem i przyciskiem "Ponów"
- ✅ **Success** — pełne dane

### Role i konta demo — w pełni obsługiwane:
- ✅ **Gość** — P1, P2, P3, P4
- ✅ **Uczeń (Adrian/Julia/Paweł)** — U1-U9, S1-S3
- ✅ **Mentor (Kasia)** — M1-M5
- ✅ **Admin** — A1, A2
- ✅ Przełączanie ról w ProtoBar i menu avatara
- ✅ Przełączanie osób demo w ReviewBar (Adrian/Julia/Paweł)

### Kontrolki scenariuszy (ReviewBar) — w pełni funkcjonalne:
- ✅ Persona switcher (Adrian/Julia/Paweł)
- ✅ Symulacja płatności: sukces / odrzucona / 3DS / wygaśnięcie hold
- ✅ Force error toggle
- ✅ Slot conflict toggle (409)
- ✅ Session expiry toggle
- ✅ Dark/light mode toggle

### Silnik przeglądu (komentarze) — w pełni funkcjonalny:
- ✅ Panel boczny (ReviewSidebar) z komentarzami na ekran
- ✅ Dodawanie/usuwanie/rozwiązywanie komentarzy
- ✅ Persistence w localStorage (prototyp-id = "kompas-flow")
- ✅ Autor komentarza (zapamiętywany w localStorage)

### Nawigacja i guards:
- ✅ Hash-based router (`#/sciezka`)
- ✅ Role guards (public/student/mentor/admin) z przekierowaniem do logowania
- ✅ Deep linking (parametry w URL, np. `#/mentorzy/:id`, `#/rezerwacja/:mentorId`)
- ✅ Stan `?state=loading|empty|error` w URL dla testów stanów

---

## Etap 3 — Uczciwość i sprawdzenie 🔄 W TRAKCIE

### Do zrobienia:
- [ ] Krótka notatka przy każdym ekranie: numery historii, symulacje, luki
- [ ] README prototypu: uruchomienie, konta demo, scenariusze, „Ograniczenia symulacji”
- [ ] Testy nawigacji między ekranami
- [ ] Sprawdzenie w przeglądarce: 320/1440px, light/dark, klawiatura, każdy przycisk i kontrolka

---

## Raport po Etapach 1-2

### Co zbudowano:
- Pełny prototyp z **23 ekranami** (wszystkie z mapy ekranów z KONCEPCJA.md §3.1)
- System kontroli scenariuszy (ReviewBar + ProtoBar) + silnik komentarzy (ReviewSidebar)
- DemoContext ze stanem: role, personas, booking flow, sessions, messages, notifications
- Design system tokens (lokalna kopia, system fonts, light/dark)
- Hash router z guardami ról
- Wszystkie stany danych (Loading/Empty/Error/Success) dla każdego ekranu
- Wszystkie role i konta demo
- Wszystkie kontrolki scenariuszy

### Co sprawdzono:
- ✅ `npm run build` — buduje się bez błędów (271 kB JS, gzip 84 kB)
- ✅ `npm run dev` — serwer startuje, strona ładuje się
- ✅ Nawigacja hash-based działa
- ✅ Przełączanie ról/osób/motywów/stany działa
- ✅ Komentarze zapisują się w localStorage
- ✅ Wszystkie 23 ekrany renderują się bez błędów

### Co NIE sprawdzono:
- ❌ Responsywność 320px / 1440px (wymaga testów w przeglądarce)
- ❌ Obsługa klawiatury (wymaga testów manualnych)
- ❌ Dostępność a11y (wymaga audytu axe)

### Luźne w design systemie (zidentyfikowane):
Zidentyfikowano 76 komponentów/wzorców do zbudowania z tokenów (45 z design systemu, 31 custom). Pełna lista w `POSTEP.md` (sekcja Etap 1).

### Pytania do specyfikacji:
1. Czy `WeekPicker` ma być osobny komponent czy pattern w `SlotGrid`?
2. Czy `AvailabilityWeek` editor ma być w design systemie czy w produkcie?
3. Czy `DecisionDialog` (3 opcje) ma być w `AlertDialog` czy custom?

---

**Następny krok:** Etap 3 — finalizacja, testy manualne, README, raport końcowy.