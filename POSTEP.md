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

## Etap 2 — Stany, role i scenariusze 🔄 W TRAKCIE

### Do zrobienia:
- [ ] Ekrany U6-U9, S1-S3, M1-M5, A1-A2 (placeholdery gotowe)
- [ ] Wszystkie stany Loading/Empty/Error dla każdego ekranu
- [ ] Przełączanie kont demo w kontekście (ReviewBar → DemoContext)
- [ ] Testy nawigacji między ekranami
- [ ] Sprawdzenie 320px / 1440px, light/dark, klawiatura

### Luźne w design systemie (zidentyfikowane):
1. `WeekPicker` — custom (Popover + Button)
2. `DurationToggle` — ToggleGroup (disabled 60 dla próbnej)
3. `TimezoneSelect` — Select (IANA)
4. `MentorSummaryBar` — Card + Money + Avatar
5. `OrderSummary` — dl + Money
6. `PaymentMethodSelector` — RadioGroup + Card
7. `PromoCodeField` — Field + Input
8. `GuaranteeNote` / `SuccessHeader` — Alert
9. `BookingCard` / `CalendarButtons` / `PrepChecklist` — custom
10. `SessionHeader` / `PolicyNotice` / `RescheduleSheet` — custom
11. `ProblemReportForm` / `NotesPanel` — custom
12. `VideoStage` / `ControlBar` / `ChatPanel` / `SharedNotes` / `Timer` / `NoShowButton` — custom
13. `StarInput` / `TagSelector` / `ContinueChoice` — custom
14. `PlanPicker` / `PriceBreakdown` / `ActivePlanCard` / `BalanceTable` / `TransferBalanceDialog` / `InvoiceList` — custom
15. `GoalCard` / `MilestoneList` / `ActionItemChecklist` / `SessionNotesTimeline` — custom
16. `ThreadList` / `ThreadView` / `MessageBubble` / `Composer` / `ContextCard` / `OffPlatformWarning` — custom
17. `NotificationItem` — custom
18. `OnboardingStepper` / `PhotoUpload` / `VideoLinkField` / `RateField` / `AvailabilityWeek` / `KycEmbed` / `ProfilePreview` — custom
19. `TodayAgenda` / `TrialRequestCard` / `KpiTiles` / `ProfileHealthCard` — z design systemu ✓
20. `ExceptionDialog` / `CalendarSettingsForm` / `CalendarSyncCard` — custom
21. `StudentList` / `StudentDetail` / `SessionNoteEditor` / `ActionItemEditor` — custom
22. `BalanceSummary` / `CommissionTierProgress` / `EarningsTable` / `PayoutButton` / `PayoutHistory` — custom
23. `ApplicationQueue` / `ApplicationDetail` / `VerificationChecklist` / `DecisionDialog` / `AuditLog` — custom
24. `DisputeQueue` / `SessionEventTimeline` / `StatementsPanel` / `ResolutionForm` — custom

---

## Etap 3 — Uczciwość i sprawdzenie ⏳ OCZEKUJE

### Do zrobienia po Etapie 2:
- [ ] Krótka notatka przy każdym ekranie: numery historii, symulacje, luki
- [ ] README prototypu: uruchomienie, konta demo, scenariusze, „Ograniczenia symulacji”
- [ ] Testy nawigacji między ekranami
- [ ] Sprawdzenie w przeglądarce: 320/1440px, light/dark, klawiatura, każdy przycisk i kontrolka

---

## Raport po Etapie 1

### Co zbudowano:
- Pełny szkielet prototypu z 9 ekranami ścieżki F1 (P1-P4, U1-U5)
- System kontroli scenariuszy (ReviewBar) + silnik komentarzy (ReviewSidebar)
- DemoContext ze stanem: role, personas, booking flow, sessions, messages
- Design system tokens (lokalna kopia, system fonts, light/dark)
- Hash router z guardami ról

### Co sprawdzono:
- ✅ `npm run build` — buduje się bez błędów
- ✅ `npm run dev` — serwer startuje, strona ładuje się
- ✅ Nawigacja hash-based działa
- ✅ Przełączanie ról/osób/motywów/stany działa
- ✅ Komentarze zapisują się w localStorage

### Co NIE sprawdzono:
- ❌ Ekrany U6-U9, S1-S3, M1-M5, A1-A2 (placeholdery)
- ❌ Wszystkie stany Loading/Empty/Error
- ❌ Responsywność 320px / 1440px
- ❌ Obsługa klawiatury
- ❌ Dostępność (a11y)

### Luźne w design systemie:
Zidentyfikowano 76 komponentów/wzorców do zbudowania z tokenów (45 z design systemu, 31 custom)

### Pytania do specyfikacji:
1. Czy `WeekPicker` ma być osobny komponent czy pattern w `SlotGrid`?
2. Czy `AvailabilityWeek` editor ma być w design systemie czy w produkcie?
3. Czy `DecisionDialog` (3 opcje) ma być w `AlertDialog` czy custom?

---

**Następny krok:** Etap 2 — implementacja pozostałych ekranów, stanów, ról i scenariuszy.