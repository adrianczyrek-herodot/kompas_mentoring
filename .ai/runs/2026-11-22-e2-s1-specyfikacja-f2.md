---
title: E2-S1 — specyfikacja F2 (katalog i onboarding mentora)
date: 2026-11-22
agent: Claude Code (claude-opus-5-5) przez cezar, headless
status: partial          # szkic gotowy; commit, PR i zgłoszenia — człowiek (git commit i gh zablokowane w sesji)
spec: .ai/specs/2026-11-22-f2-katalog-onboarding.md
branch: cez/00c9b37b
---

# E2-S1 — specyfikacja F2 (katalog i onboarding mentora)

## Zadanie
Pierwotne polecenie wskazywało specyfikację „2026-09-08-mentors-become-bookable”, dokument przekazania „2026-09-09-e02-design-handoff.md” i epik #8 — żaden z tych plików nie istnieje w repozytorium (sprawdzone w drzewie, historii wszystkich gałęzi i treści plików). Właściciel wybrał zakres **E2-S1 z backlogu**: szkic specyfikacji F2 z otwartymi pytaniami do akceptacji (zgłoszenie #28, epik #23). Bez kodu.

## Przebieg
- 17:55 — Poprzednia sesja (runner pi) zakończyła się bez pracy (0 tokenów); gałąź równa `main`.
- 17:56 — Brak plików wskazanych w zadaniu; pytanie do właściciela (CEZ:ASK). Odpowiedź: „E2-S1 z backlogu”.
- 18:00 — Przeczytane: `.ai/lessons.md`, brief, backlog (E2, notatki prototypu), KONCEPCJA (F4, P1–P3, M1, A1, model), spec stacku (§0, §1.3, §2.3–2.5, §3, §4.3, §4.6–4.8, §8, §13), spec F1 (wzór), Storybook (`packages/ui/src/{components,product,patterns,screens}`), stan `packages/core` (moduły `identity`, `scheduling`; brak publikacji zdarzeń między modułami — tylko heartbeat pg-boss).
- 18:10 — Szkic specyfikacji `.ai/specs/2026-11-22-f2-katalog-onboarding.md` (`status: draft`), link w backlogu E2.

## Wynik
Szkic specyfikacji F2 z 14 otwartymi pytaniami (Q1–Q14), kryteriami akceptacji z identyfikatorami ekranów i planem 15 kroków przypisanych do historii E2-S2…E2-S8.

## Weryfikacja
Zmiana wyłącznie w dokumentach `.ai/` — bez uruchamiania `pnpm lint/typecheck/test/build` (nie dotyczą markdownu w `.ai/`).

## Problemy i otwarte kwestie
- `gh` jest zablokowany w tej sesji (tryb „don't ask”) — nie zaktualizowano zgłoszeń #28/#23 ani nie otwarto PR. Do zrobienia przez człowieka lub w sesji interaktywnej (komentarz w #28 z linkiem do specyfikacji, etykieta `in-progress`).
- `git commit` jest w `permissions.ask` (lekcja 2026-11-22) — commit może wymagać człowieka.
- 2026-11-22 — Właściciel przyjął wszystkie rekomendacje Q1–Q14; spec `approved`, reguła 8 briefu poprawiona (Q2: KYC w F4), backlog E2-S1/E2-S3/E2-S5 zaktualizowany. E2-S1 zamknięte merytorycznie; zostaje commit, PR i komentarz w #28.

## Wnioski
Dopisana lekcja w `.ai/lessons.md`: polecenie odwołujące się do specyfikacji, epiku i zgłoszeń, których nie ma w repozytorium (inne nazewnictwo „E02”, epik #8), to prawdopodobnie prompt z innego projektu — zatrzymaj się przed implementacją i zaproponuj najbliższe pozycje backlogu.
