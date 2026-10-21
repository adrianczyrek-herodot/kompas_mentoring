---
title: F0 część B — dokumenty procesu (ADR, CODE_REVIEW, SDLC, BC, agentic.config, AGENTS.md)
date: 2026-10-21
agent: Claude Code (Sonnet 5.5) przez cezar, zadanie podrzędne ae621dfa
status: done
spec: .ai/specs/implemented/2026-10-21-f0-szkielet-i-harness.md
spec: .ai/specs/2026-10-21-f0-szkielet-i-harness.md
branch: cez/ae621dfa
---

# F0 część B — dokumenty procesu

## Zadanie
Utworzyć ADR 0001–0005 (MADR 4.0) z indeksem, `CODE_REVIEW.md`, `SDLC.md`, `BACKWARD_COMPATIBILITY.md`, `.ai/agentic.config.json` i uzupełnić `AGENTS.md` — zgodnie ze spec F0 i spec stacku. Zakres plików rozłączny z częścią A (kod).

## Przebieg
- Start — przeczytane `AGENTS.md`, `.ai/lessons.md`, obie specyfikacje. Schemat `agentic.config.json` odczytany z `~/.claude/skills/om-setup-agent-pipeline/SKILL.md` (kreatora nie uruchamiano).

- Napisane ADR 0001–0005 + README (commit `docs(adr)`), `CODE_REVIEW.md`, `SDLC.md`, `BACKWARD_COMPATIBILITY.md`, `.ai/agentic.config.json`, uzupełnienie `AGENTS.md` i jednej linii w `CLAUDE.md`.
- ADR 0003 i 0004 mają widoczną uwagę, że Q3/Q4/Q7 czekają na właściciela/prawnika.

## Wynik
Pliki: `docs/decisions/{README,0001…0005}.md`, `CODE_REVIEW.md`, `SDLC.md`, `BACKWARD_COMPATIBILITY.md`, `.ai/agentic.config.json`, `AGENTS.md` (sekcja Projekt rozszerzona, nowa sekcja „Standardy inżynieryjne”: reguły modułów, pieniądze/czas, język, słownik PL→EN), `CLAUDE.md` (punkt 8), ten log. Istniejące zasady `AGENTS.md` bez zmian (jedyna edycja: etykieta „w mockupach” przy komendzie mockupów).

## Weryfikacja
- `python3 -m json.tool .ai/agentic.config.json` — poprawny JSON.
- Sprawdzenie linków względnych w `AGENTS.md`, `CLAUDE.md`, dokumentach procesu i ADR — wszystkie istnieją; jedyny „brak” to pre-istniejący placeholder `lessons/YYYY-MM-DD-slug.md` w szablonie `AGENTS.md`.
- Brak kodu — typecheck/build mockupów nie dotyczy (nie dotykano `kompas-mentoring/`).

## Problemy i otwarte kwestie
- Schemat skilla `om-setup-agent-pipeline` używa klucza `baseBranch` (nie `defaultBranch`) — zastosowano `baseBranch: "main"`. Blok `humanReview` (ścieżki wymagające przeglądu człowieka) jest rozszerzeniem własnym: skille go nie czytają, więc egzekwują to CODE_REVIEW.md i SDLC.md; do rozważenia: ochrona gałęzi / CODEOWNERS.
- Okres wygaszania 6 mies. w `BACKWARD_COMPATIBILITY.md` to propozycja spoza spec stacku (oznaczona „do potwierdzenia”).
- Q3/Q4/Q7 nadal otwarte.

## Wnioski
Brak wpisów w `.ai/lessons.md` (zlecenie zabrania edycji) — propozycje przekazane w raporcie.
