---
title: Prototyp kompas-flow — ekrany ucznia i wspólne (U6–U9, S1–S3)
date: 2026-11-22
agent: Claude Code (Sonnet 5.5), cezar
status: done
spec: .ai/specs/implemented/2026-11-21-prototyp-kompas-flow.md
branch: cez/eefe099f
---

# Prototyp kompas-flow — ekrany ucznia i wspólne (U6–U9, S1–S3)

## Zadanie
Zastąpić zaślepki U6, U7, U8, U9, S1, S2, S3 pełnymi ekranami na `@kompas/ui` wg KONCEPCJA §4 i zasad ze wspólnych reguł etapu 2. Zakres plików: `src/screens/{u6,u7,u8,u9,s1,s2,s3}-*.tsx` i ten log.

## Przebieg
- Odczyt zasad, `world.ts`, `demo-context`, wzorców U4/U5/U2, szarego prototypu (`student.ts`, `shared.ts`) i KONCEPCJA §4.
- U6: wejście (test sprzętu jako symulacja → „Dołącz”) → pokój (scena, sterowanie, czat, wspólne notatki, licznik, utrata połączenia, „Mentor się nie pojawił”, zakończenie). Zegar z `now` + sekundy rzeczywiste.
- U7: StarInput (RadioGroup), tagi (Checkbox), 2 pola tekstowe, wybór „co dalej” po sesji próbnej, podsumowanie i edycja do 7 dni.
- U8: aktywne plany (zmień od kolejnego okresu / wstrzymaj / anuluj), zakup przy `?mentor=`, saldo z przeniesieniem, historia płatności.
- U9: cel, kamienie milowe, zadania, oś notatek, formularz celu.
- S1: lista + wątek, nieprzeczytane, kompozytor, ostrzeżenie OFF_PLATFORM, nieudana wysyłka z „Ponów”. S2: lista z linkami. S3: Tabs.
- Weryfikacja w Playwrightcie (skrypty poza repo, `/tmp/pw-eefe`), poprawki znalezionych usterek (odliczanie „4550 min”, rozjazd układu na 320 px, stare dane po zmianie konta).

## Wynik
Siedem ekranów zastąpiło zaślepki; ekrany dzielone na pliki `*-parts.tsx`, `u8-dialogs.tsx`, `u8-ledger.tsx`. Pliki wspólne bez zmian.

## Weryfikacja
- `pnpm --filter @kompas/prototype-kompas-flow typecheck` → 0.
- `pnpm --filter @kompas/prototype-kompas-flow build` → OK; `check-classes.mjs` → „każda klasa ma CSS”; `check-tokens.mjs prototypes/kompas-flow/src` → „No values outside the design tokens”.
- `npx eslint` na plikach zakresu → 0 błędów, 34 ostrzeżenia (`max-lines-per-function`, `max-lines`).
- Playwright: wszystkie przejścia z raportu — zero `pageerror` i błędów konsoli; zrzuty 320 px, 1440 px i ciemny motyw obejrzane.

## Problemy i otwarte kwestie
Patrz raport (`--suggestions`): `retry-message` nie powiadamia drugiej strony, `hadTrialWith` liczy też sesje niezakończone, `start-plan` przy istniejącym planie nadpisuje subskrypcję, brak linku „napisz do mentora” (S1 nie tworzy nowych wątków).

## Wnioski
brak
