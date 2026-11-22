---
title: kompas-flow etap 2 — ekrany zespołu zaufania A1–A2
date: 2026-11-22
agent: cezar (pi)
status: done
spec: .ai/specs/implemented/2026-11-21-prototyp-kompas-flow.md
branch: cez/cd8b5349 (fork od cez/2c93155b)
---

# kompas-flow etap 2 — ekrany zespołu zaufania A1–A2

## Zadanie
Zbudować pełne ekrany obszaru zaufania w klikalnym prototypie `prototypes/kompas-flow`
(React 19 + `@kompas/ui`): A1 `/admin/weryfikacja` (kolejka wniosków mentorów, KYC, checklista,
decyzja) i A2 `/admin/spory` (kolejka sporów, oś zdarzeń, stanowiska stron, rozstrzygnięcie).
Zastąpić zaślepki „w przygotowaniu”. Zakres plików: `src/screens/a{1,2}-*.tsx` + ten log.

## Przebieg
- 12:0x — Przeczytane: `shared-rules.md`, `area-admin.md`, specyfikacja prototypu, `POSTEP.md`,
  KONCEPCJA §4 (A1, A2) i §2.2 (F4, F6), szary `mockupy/src/screens/admin.ts`, `docs/design-system.md`,
  `packages/ui/src/index.ts`, tokeny, wzorce etapu 1 (`u4`, `u5`, `m2`) i wzorzec „Decyzja z powodem”.
- 12:0x — Rozbieżność podstawy: worktree utworzony z `main` (etap 1, PR #56) zamiast z `cez/2c93155b`.
  Gałąź `cez/cd8b5349` zresetowana na `cez/2c93155b` (poprawny fork point z zamówienia; brak własnych
  commitów do zachowania). Na `cez/2c93155b` A1/A2 to zaślepki `PlannedScreen`, a `app.tsx` już je importuje.
- 12:0x — `pnpm install --frozen-lockfile` przez corepack (pnpm 11.28.6); bazowy `typecheck` = 0.
- 12:0x — A1: kolejka `world.applications` (status `submitted`) w `Table`, wybór przez `?id=`
  (`replace(withQuery(...))`), wiek względem `now` i SLA 2 dni robocze, badge KYC, LinkedIn,
  kategorie, wideo jako opisana symulacja, checklista `VERIFICATION_CHECKLIST` (Checkbox),
  decyzja (RadioGroup) z walidacjami jak w szarym A1, zapis przez `useAction` → `decide-application`,
  dziennik `world.audit`. Pliki: `a1-verification.tsx`, `a1-parts.tsx`.
- 12:0x — A2: kolejka `world.disputes` z zakładkami Otwarte/Rozstrzygnięte, wybór przez `?id=`,
  oś zdarzeń (`events`) jako DS-GAP, stanowiska stron (brak `mentorSays` → „Czeka na stanowisko
  mentora (48 h)”), formularz rozstrzygnięcia (RadioGroup: saldo/karta/częściowy/brak), kwota
  częściowa ≤ wartość sesji (bigint), wiadomość 20–1000 → `resolve-dispute`. Po rozstrzygnięciu
  widok przełącza się na zakładkę „Rozstrzygnięte” i pokazuje decyzję. Pliki: `a2-disputes.tsx`, `a2-parts.tsx`.
- 12:0x — Weryfikacja statyczna i Playwright (42/42 asercji, 0 `pageerror`/błędów konsoli); zrzuty 1440/320
  i ciemny motyw.

## Wynik
- Nowe pliki: `src/screens/a1-verification.tsx`, `a1-parts.tsx`, `a2-disputes.tsx`, `a2-parts.tsx`.
- A1: zatwierdzenie Adama (`decide-application approve`) sprawia, że konto Adama jest zatwierdzone
  (`accountOf` czyta status wniosku) → `/mentor` otwiera M2 zamiast bramki „czeka na weryfikację”.
  „Poproś o zmiany” zostawia bramkę pending, a M1 pozostaje dostępny.
- A2: F6 — zgłoszenie z U5 (`/sesje/s4`) pojawia się w kolejce A2; rozstrzygnięcie „zwrot do salda”
  zwiększa saldo Adriana (3 → 4 sesje w U4).
- Kwoty wyłącznie `bigint`/`Money`; brak `Date.now()`/`new Date()`; zero `alert()`; natywne kontrolki
  zastąpione komponentami DS (`Checkbox`, `RadioGroup`, `Input`, `Textarea`, `Tabs`, `Table`).
- Commit na gałęzi `cez/cd8b5349` (hash w raporcie zadania).

## Weryfikacja
- `pnpm --filter @kompas/prototype-kompas-flow typecheck` → kod 0.
- `npx eslint prototypes/kompas-flow/src/screens/a1-*.tsx a2-*.tsx` → 0 błędów (6 ostrzeżeń `max-lines-per-function`).
- `pnpm --filter @kompas/prototype-kompas-flow build` → OK.
- `node prototypes/kompas-flow/scripts/check-classes.mjs` → 0 („każda klasa ma CSS”).
- `node packages/ui/scripts/check-tokens.mjs "$PWD/prototypes/kompas-flow/src"` → 0.
- Playwright (Chromium, dev server :5203): 42/42 asercji, 0 `pageerror` i błędów konsoli. Pokryte:
  A1 — kolejka (3), KYC, „Po SLA”, checklista (5), wideo-symulacja, walidacje (bez decyzji, approve bez
  checklisty, changes bez pól, komentarz 10–1000), stany danych (ładowanie/pusto/błąd + „Ponów”),
  błąd następnego żądania (`FailureAlert`, dane zachowane), „poproś o zmiany”, „zatwierdź” + zmiana
  bramki Adama na M2, dziennik audytu; A2 — kolejka (2), oś zdarzeń, stanowiska, walidacje (wynik,
  kwota częściowa, wiadomość), rozstrzygnięcie + widok decyzji, zakładka „Rozstrzygnięte”, stany
  danych, F6 od U5 do salda Adriana; 320 px (treść `main` bez poziomego przewijania) i ciemny motyw.
- Klawiatura: strzałki w Tabs przełączają zakładkę; RadioGroup obsługuje strzałki (komponenty Base UI).

## Problemy i otwarte kwestie
- Rozbieżność podstawy gałęzi (worktree z `main` zamiast `cez/2c93155b`) — patrz „Przebieg”; naprawiona
  resetem na `cez/2c93155b`.
- Nie sprawdzono: pełnego przejścia klawiaturą przez każdą kontrolkę (tylko Tabs/RadioGroup), renderowania
  pól i komentarza po „poproś o zmiany” w M1 (M1 buduje inne zadanie — sprawdzono tylko, że trasa M1
  działa, a bramka pozostaje „pending”), Safari/Firefox, automatycznego audytu axe.
- Pytania do specyfikacji:
  1. SLA A1 „2 dni robocze” — liczyć dni kalendarzowe czy robocze? Użyto dni kalendarzowych i progu > 2.
  2. A2 „zwrot do salda” dla sesji próbnej: reducer dolicza sesję do salda tylko dla `type === 'plan'`.
     Czy dla sporów o sesję próbną „zwrot do salda” ma być niedostępny (a tylko zwrot na kartę)?
  3. A2 kwota częściowa: format wejścia (przecinek/kropka, grosze) — przyjęto „12,50”/„12.5”, 1–2 miejsca.

## Wnioski
- Brak wpisów w `.ai/lessons.md` (zakres zadania obejmuje wyłącznie pliki A1/A2 i ten log). Ustalenia
  przekazane w raporcie (`--suggestions`): luka w `check-classes.mjs` dla `cn(...)` z wyrażeniami oraz
  poziome przewijanie paska przeglądu na 320 px (wspólna powłoka).
