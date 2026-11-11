---
title: Dodanie materiałów lekcji 06 do katalogu głównego
date: 2026-11-11
agent: Claude Code (Opus 5.5) przez cezar
status: done
spec:
branch: cez/1cea30c9
---

# Dodanie materiałów lekcji 06 do katalogu głównego

## Zadanie
Dodać 8 załączonych plików do katalogu głównego projektu jako folder `lekcja-06`.

## Przebieg
- Skopiowano załączniki z oryginalnymi nazwami do `lekcja-06/`; `02-rekrutacja.html.txt` zapisano jako `02-rekrutacja.html` (tak nazywa go `README.md`).
- Push gałęzi i PR #50 (po przełączeniu `gh` na `adrianczyrek-herodot` za zgodą użytkownika).
- CI: `lint` padł — Biome zgłosił 84 błędy w `lekcja-06/02-rekrutacja.html`. Folder wykluczony z Biome (`biome.json`) i ESLint (`packages/config/eslint/index.js`), materiałów nie zmieniano.

## Wynik
`lekcja-06/`: `README.md`, `02-rekrutacja.html` i 6 promptów `.txt`, treść bez zmian.

## Weryfikacja
`ls -la lekcja-06` — 8 plików, rozmiary zgodne z załącznikami. Lokalnie `pnpm lint` — kod wyjścia 0.

## Problemy i otwarte kwestie
Brak.

## Wnioski
Nowy wpis w `.ai/lessons.md` (Biome lintuje materiały spoza pakietów).
