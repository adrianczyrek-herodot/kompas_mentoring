---
title: Plik decyzji o referencjach wizualnych (lekcja 06, ćwiczenie 2)
date: 2026-11-11
agent: Claude Code (claude-opus-5-5) przez cezar
status: done
spec:
branch: cez/714c2c96
---

# Plik decyzji o referencjach wizualnych (lekcja 06, ćwiczenie 2)

## Zadanie
Przełożyć karty referencji na plik decyzji `lekcja-06/referencje.md`: obserwacje, cechy z rodzinami, antyreferencje z podpisami, konflikty i luki. Przed zapisem zadać pytania i dać do akceptacji każdą propozycję osobno.

## Przebieg
- Prompt przyszedł z niewypełnionymi miejscami i bez kart. Użytkownik wybrał karty DevMentora z `lekcja-06/od-opinii-do-decyzji-devmentor.txt` (R01 GitHub, R02 Slack, A01) i kontekst Kompasu (brief, KONCEPCJA, bez wywiadów).
- Przeczytane: `.ai/specs/product-brief.md`, `kompas-mentoring/KONCEPCJA.md`. Brak `.ai/specs/research/` i brak zrzutów.
- Agent przedstawił propozycje P1–P15, konflikty K1–K3 i luki. Użytkownik przyjął wszystkie propozycje, w K1 wybrał „gęsto w listach”, kolor i typografię zostawił do kolejnych kart, zrzutów nie dodaje.
- Na prośbę użytkownika agent zaproponował karty R03 FT, R04 Notion, R05 GOV.UK i R06 HEY / Basecamp dla luk w kolorze, typografii i tonie. Wszystkie przyjęte, obserwacje oznaczone jako „z pamięci agenta”. Konflikty K4–K6 rozstrzygnął użytkownik.
- Podpis A01 sprawdzony w `lekcja-06/02-rekrutacja.html` (grep: `linear-gradient`, `background-clip: text`, `backdrop-filter`).

## Wynik
- `lekcja-06/referencje.md`: 22 cechy (R01–R06), 4 antyreferencje (A01–A04), 6 rozstrzygniętych konfliktów (K1–K6), luki.

## Weryfikacja
Dokument, bez kodu. `lekcja-06/` jest wykluczony z lintu (biome, ESLint), więc nie było czego uruchamiać.

## Problemy i otwarte kwestie
- Karty R03–R06 nie mają zrzutów, a ich obserwacje pochodzą z pamięci agenta. Barwa akcentu i konkretny krój zostają na krok tokenów.
- Brak referencji dla ruchu, pokoju U6 i e-maili transakcyjnych.

## Wnioski
Brak.
