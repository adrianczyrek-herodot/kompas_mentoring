---
title: E3-S2 — dostępność mentora M3 (kroki 2–5 specyfikacji F3)
date: 2026-11-23
agent: cezar (subagent bb79d6aa, model pi)
status: done
spec: .ai/specs/2026-11-23-f3-dostepnosc-rezerwacje.md
branch: cez/bb79d6aa
---

# E3-S2 — dostępność mentora M3 (kroki 2–5)

## Zadanie
Zaimplementować historię E3-S2 (#37, epik #24) — kroki 2–5 planu wdrożenia F3: domena dostępności,
migracja i komendy szablonu/wyjątków/ustawień z routerem oRPC, komponenty `packages/ui` ze stories
oraz ekran M3 `/mentor/kalendarz` z E2E (360/1280 px, axe). Jeden commit na krok planu, PR do `main`.

## Przebieg
- 12:20 — Rozpoznanie: spec F3, `scheduling/AGENTS.md`, `catalog` (wzorzec modułu), spec stacku §2.4/§4.3/§4.4, lekcje backend/ui/e2e. `pnpm install --frozen-lockfile` w worktree.
- 12:22 — Krok 2: domena dostępności (`availability.entity.ts`, polityki szablonu/settingsów/wyjątków, stałe w `config.ts`), dwa nowe przejścia `Booking` (`hold_released`, `cancelled_by_student`), testy jednostkowe. Commit `506e9d7`.
- 12:25 — Krok 4 (UI) zlecony subagentowi `8975ebd8` (rozłączny zakres `packages/ui`).
- 12:30 — Krok 3: migracja `scheduling` (`mentor_schedule`, `availability_rule`, `availability_exception`, `inbox_event`), repozytorium MikroORM, komendy szablonu/wyjątków/ustawień (puste kolizje), `getMentorCalendar`, publiczne `getWeeklyAvailabilityMinutes`, uprawnienie `scheduling.availability.manage.own`, kontrakty zod i router oRPC. Commit `e4306f2`.
- 12:45–13:20 — Krok 5 (web): server actions (`availability-actions.ts`), RSC `app/mentor/kalendarz/page.tsx`, klient (`calendar-screen.tsx`, `settings-form.tsx`, `exceptions-section.tsx`, `zone-time.ts`), liść `AvailabilityTemplateForm`, teksty w `messages/pl.json`, E2E `e2e/availability.spec.ts`.
- 13:40 — Raport subagenta UI (`20722e3`, 15 plików, 2174 insertions): zwalidowany (zakres tylko `packages/ui` + `docs/design-system.md`, zgodny z sygnaturami). Wniesiony jako krok 4 (`2c6f28a`) po poprawkach knip.
- 13:55 — Krok 5 domknięty, poprawka importu `.tsx` (Turbopack), knip czysty.

## Wynik
- **Krok 2** `506e9d7` `feat(scheduling)`: `domain/availability.entity.ts`, `domain/policies/{availability-template,availability-exception,mentor-schedule}.policy.ts`, stałe w `config.ts`, dwa nowe przejścia `Booking`, testy jednostkowe.
- **Krok 3** `e4306f2` `feat(scheduling)`: migracja `Migration20261123000000SchedulingAvailability`, rekordy + mapper + repozytorium MikroORM, komendy `saveAvailabilityTemplate` / `addAvailabilityException` / `deleteAvailabilityException` / `updateMentorSettings`, `getMentorCalendar`, `getWeeklyAvailabilityMinutes`, uprawnienie w `identity`, kontrakty zod (`packages/contracts/src/scheduling`) i router oRPC; testy integracyjne i parity kontraktów.
- **Krok 4** `2c6f28a` `feat(ui)`: `AvailabilityEditor` (DS-05), `WeekCalendar`, `ExceptionDialog`, `CalendarSyncCard`, ekran-wzorzec `screens/m3-calendar` (+ `.mdx`), stories i dopisek w `docs/design-system.md`; autorstwo: subagent `8975ebd8`, wniesione na gałąź.
- **Krok 5** (commit poniżej) `feat(web)`: M3 `/mentor/kalendarz` (tydzień, edytor, wyjątki, ustawienia, baner pustej dostępności), `AvailabilityTemplateForm` (liść dla M1·5), server actions, teksty `messages/pl.json`, E2E 360/1280 + axe.
- Odstępstwa: dopisane w „Decyzje i zmiany” specyfikacji F3 (kody błędów `scheduling.forbidden`/`version_conflict`, `BOOKING_HORIZON` w godzinach, strażnik M3 `mentor.access`, lista stref zamiast `TimezoneSelect`, brak przełącznika accepting-new — krok 7).
- **PR:** [#71](https://github.com/adrianczyrek-herodot/kompas_mentoring/pull/71) (do `main`, `Refs #37, #24`, **nie scalony**); zgłoszenie #37 oznaczone `in-progress` i skomentowane postępem. Wymaga przeglądu człowieka: migracja `scheduling` i zmiana uprawnień w `identity`.

## Weryfikacja
- `pnpm typecheck` — 7/7 pakietów zielone.
- `pnpm lint` — exit 0; dependency-cruiser „no dependency violations”; knip czysty; 136 ostrzeżeń ESLint `max-lines-per-function` (132 wcześniejsze w `prototypes/kompas-flow`; 4 nowe w formularzach M3, ten sam wzorzec co formularze M1).
- `pnpm test` — core 231, contracts 22, testing 2, worker 2.
- `pnpm --filter @kompas/ui test:stories` — 71 plików / 408 testów.
- `pnpm --filter @kompas/ui build-storybook` — zielony.
- `pnpm test:integration` (Testcontainers, Docker) — 5 plików / 31 testów, w tym nowy `scheduling.int.test.ts`.
- `pnpm build` — `@kompas/web` zielony.
- `E2E_EXPECT_DB=up pnpm --filter @kompas/web test:e2e` — **78/78** (mobile-360 i desktop-1280), w tym nowy `availability.spec.ts` (baner pustej dostępności, zaznaczenie wtorku 18:00–20:00 klawiaturą + zapis, axe 0 naruszeń serious/critical).

## Problemy i otwarte kwestie
- `Temporal.Instant.add` nie przyjmuje dni/tygodni — `BOOKING_HORIZON` = 56×24 h (opisane w specyfikacji).
- Turbopack wymaga dokładnego rozszerzenia importu (`.tsx` dla plików TSX) — `tsc` to przepuścił, `next build` nie; poprawione.
- Lokalny `pnpm lint` początkowo czerwony przez 6 nowych nieużywanych eksportów z kroku 4 (`SLOTS_PER_DAY`, `SLOT_MINUTES`, `timeToSlot`, `addDays`, `Weekday`, `AvailabilityIssueView`) — usunięte z eksportu; subagent nie uruchamiał knip (uruchamiał tylko eslint), co warto dopisać do jego zleceń na przyszłość.
- PR może raportować konflikt z `main`, jeśli inne gałęzie zmienią `packages/ui/src/index.ts` — do rozwiązania przy scalaniu.

## Wnioski
- Zlecenie subagentowi UI z dokładnymi sygnaturami propsów zadziałało: kod wniósł się bez zmian w integracji (poza jednym importem `.tsx`). Warto jednak dopisywać do zlecenia „uruchom też `knip`” — eslint tego nie łapie.
- `.ai/lessons/areas/ui.md`: `biome check --write` na całym katalogu `apps/web/app/mentor` sformatował pliki spoza zakresu (onboarding) — czyścić je trzeba świadomie; `pnpm lint` (bez `lint:biome`) tego nie wymusza.
