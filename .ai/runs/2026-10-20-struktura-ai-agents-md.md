---
title: Struktura .ai oraz AGENTS.md i CLAUDE.md
date: 2026-10-20
agent: Claude Code (claude-opus-5-5) przez cezar
status: done
spec:
branch: cez/6eb9d49c
---

# Struktura .ai oraz AGENTS.md i CLAUDE.md

## Zadanie
Utworzyć `AGENTS.md`, `CLAUDE.md` i katalog `.ai/` (`specs/` z `implemented/` i `archive/`, `runs/`, `lessons.md`, `lessons/`), opisać strukturę i zapisać instrukcje wymuszające korzystanie z niej.

## Przebieg
- Utworzono katalogi z plikami `.gitkeep`, żeby puste katalogi trafiły do gita.
- `AGENTS.md` — pełne zasady obowiązkowe, konwencja nazw, cykl życia specyfikacji, szablony specyfikacji / runu / lekcji, lista kontrolna.
- `CLAUDE.md` — importuje `AGENTS.md` (`@AGENTS.md`) i zawiera skrót zasad dla Claude Code.
- `.ai/lessons.md` — indeks lekcji z sekcjami tematycznymi i pierwszym wpisem.
- `.gitignore` — wykluczono `.ai/cezar/` (katalog roboczy cezar w głównym checkoucie).

## Wynik
Nowe pliki: `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `.ai/lessons.md`, `.ai/runs/2026-10-20-struktura-ai-agents-md.md`, `.gitkeep` w `.ai/specs/`, `.ai/specs/implemented/`, `.ai/specs/archive/`, `.ai/runs/`, `.ai/lessons/`.

## Weryfikacja
Zmiana wyłącznie w dokumentacji — brak kodu do testowania.

## Problemy i otwarte kwestie
Brak.

## Wnioski
Dodano wpis o `.ai/cezar/` w `.ai/lessons.md`.
