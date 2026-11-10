---
title: Revert zepsutego scalenia PR #7 i rozpoznanie przeniesienia ekranów do szkieletu z main
date: 2026-11-10
agent: Claude Code (claude-opus-5-5) przez cezar
status: blocked
spec:
branch: cez/d24e11ee-revert-pr7
---

# Revert zepsutego scalenia PR #7 i rozpoznanie przeniesienia

## Zadanie
Użytkownik wybrał kierunek „szkielet z main” (zamiast struktury z PR #7): przenieść ekrany, reguły domenowe i testy z PR #7 do struktury z `main`, PR #7 zamknąć.

## Przebieg
- `git fetch`: PR #7 został w międzyczasie scalony (`e4aa59c`, merge `365fdee` z rozwiązaniem „obie strony”). CI na `main` pada: `package.json`, `packages/core/package.json`, `packages/ui/package.json`, `packages/core/tsconfig.json` to niepoprawny JSON (run 42835115146, `pnpm/action-setup`).
- Gałąź `cez/d24e11ee-revert-pr7` z `origin/main`, `git revert -m 1 e4aa59c` — drzewo identyczne z `775c142` (main sprzed #7; `git diff` pusty).
- Push odrzucony (403): aktywne konto `gh` to `aczyrek` z uprawnieniem tylko do odczytu (wcześniej `adrianczyrek-herodot`). Nie obchodzono — decyzja użytkownika.
- Sub-agent (Explore) zebrał konwencje szkieletu: plan F1–F8 na modułach domenowych (catalog, scheduling, billing…), RSC + oRPC, Temporal + `Money` (bigint), teksty tylko w `messages/pl.json`, shadcn w wariancie Base UI, PR ≤ ~400 linii, spec fazy z otwartymi pytaniami zatwierdzana przez człowieka, Vitest + Playwright w `apps/web/e2e` (360/1280 px, axe).

## Wynik
- Lokalny commit revertu na `cez/d24e11ee-revert-pr7` (niewypchnięty) + lekcje + ten log.

## Weryfikacja
- `git diff 775c142 HEAD` (przed dopisaniem lekcji/logu) — pusty.
- CI szkieletu zielone ostatnio przy #6 (run 39565838156); lokalnie pnpm niezainstalowany (instrukcja w lekcjach).

## Problemy i otwarte kwestie
- Brak uprawnień push na aktywnym koncie gh — do decyzji użytkownika.
- Sposób przeniesienia (demo 1:1 vs ekrany w fazach F1–F8 na prawdziwych modułach) — do decyzji użytkownika; demo na stanie w pamięci łamałoby zasady szkieletu (logika w kliencie, teksty na sztywno, `Date`/`number` w domenie).

## Wnioski
- `.ai/lessons.md`: konflikt „obie strony” w plikach konfiguracyjnych; zmiana konta gh między sesjami.
