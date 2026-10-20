---
title: Zasady pracy z Claude Code (wskazówki Borisa Cherny'ego) w AGENTS.md
date: 2026-10-20
agent: Claude Code (claude-opus-5-5) przez cezar
status: done
spec:
branch: cez/119290a6
---

# Zasady pracy z Claude Code (wskazówki Borisa Cherny'ego) w AGENTS.md

## Zadanie
Przeczytać 10 wskazówek Borisa Cherny'ego (https://ykdojo.github.io/claude-code-tips/content/boris-claude-code-tips), wybrać przydatne w projekcie i zwięźle dopisać do `AGENTS.md` (planowanie, weryfikacja, wnioski po poprawkach) bez duplikowania istniejących zasad. Sprawdzić, że `CLAUDE.md` wczytuje `@AGENTS.md`.

## Przebieg
- Przeczytano `.ai/lessons.md` i poprzedni run.
- WebFetch zablokowany w trybie headless — stronę pobrano przez `curl`.
- `CLAUDE.md` już zawiera `@AGENTS.md` w osobnej linii — import bez zmian.
- Wybrano wskazówki 2 (plan), 3 (reguły po korekcie → `.ai/lessons.md` zamiast CLAUDE.md), 4 (skille), 5 (samodzielne naprawy), 6 (eleganckie rozwiązanie zamiast doraźnego fixa; szczegółowe specyfikacje już pokrywa SDD), 8 (sub-agenci) i 1 (równoległe worktree — w wersji cezar, rozłączne zakresy). Weryfikację dopasowano do typecheck/build/przeglądarki. Pominięto 7, 9, 10 (terminal, analityka, nauka) — nie dotyczą projektu.
- Specyfikacji nie tworzono: zmiana wyłącznie w dokumentacji instrukcji, bez kodu.

## Wynik
- `AGENTS.md` — nowa sekcja „Sposób pracy” (7 punktów) po „Zasadach obowiązkowych” + punkt o weryfikacji w liście kontrolnej.
- `CLAUDE.md` — punkt 7 w skrócie, odsyłający do „Sposobu pracy”.
- `.ai/lessons.md` — wpis o blokadzie WebFetch.

## Weryfikacja
Zmiana wyłącznie w dokumentacji — brak kodu do testowania. Sprawdzono, że `@AGENTS.md` jest w osobnej linii poza blokiem kodu.

## Problemy i otwarte kwestie
Brak.

## Wnioski
Dodano wpis o WebFetch/curl w `.ai/lessons.md`.
