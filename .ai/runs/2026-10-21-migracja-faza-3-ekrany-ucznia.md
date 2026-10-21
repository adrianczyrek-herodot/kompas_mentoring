---
title: Migracja do monorepo — faza 3 (ekrany ucznia U1–U9 i współdzielone S1–S3 w React)
date: 2026-10-21
agent: Claude Code (claude-opus-5-5) przez cezar
status: done
spec: .ai/specs/2026-10-20-migracja-mockupu-do-monorepo.md
branch: cez/d24e11ee
---

# Migracja do monorepo — faza 3 (ekrany ucznia U1–U9 i współdzielone S1–S3 w React)

## Zadanie
Użytkownik: „Ok to róbmy fazę 3” — przepisać U1–U9 i S1–S3 z `src/legacy` na React + Tailwind według planu, zweryfikować, zaktualizować plan.

## Przebieg
- Przeczytano `.ai/lessons.md`, specyfikację, `screens/student.ts` (745 linii), `screens/shared.ts` i style ekranów w `kompas.css`.
- Znaleziono przyczynę różnicy wideo w P3 z fazy 2: reguła `.layout-profile .video-ph { height: 300px }` na końcu `kompas.css`.
- Projekt fazy 3 dopisany do specyfikacji (tabela ekranów z dostępem, akcje stanu demo, nowe komponenty UI).
- `core`: `domain/sessions.ts` (podział sesji, polityka anulowania, okno zgłoszeń, cena próbnej z opłatą i kodem), walidatory karty. `app/src/demo`: `SCREENS` z `access`/`bare`, `reactScreen`, `actions.ts` (wszystkie mutacje stanu, także z fazy 2), strażnik dostępu i tryb „bare” w chrome; grupa `(public)` → `(site)`.
- `ui/frontend`: `Modal`, `Badge`, `Spinner`, `TextareaField`, `cardClass`, klasy listy/tabeli, nagłówki; `Avatar` z `--avatar-size`; wariant `dangerGhost`; `react-dom` jako peer.
- 13 widoków (`views/student/*`, `views/shared/*`) i 14 stron; `screens/student.ts` i `screens/shared.ts` usunięte, `legacy/main.ts` tylko z M1–M5, A1–A2.
- Poprawki z fazy 2: wideo w P3 300 px, karta mentora ≤480 px.
- Typecheck: moduł `typography.ts` niewidoczny przez eksport `./frontend/*` (→ `*.tsx`) — zmiana na `.tsx`. Build zielony.
- Katalog tmp z narzędziami zrzutów znów wyczyszczony — odtworzony.
- Pierwszy przebieg testów: 4 FAIL — wszystkie to błędne oczekiwania testu (najbliższa sesja nie trafia na listę; s3 ma 18 h do startu; Ewa ma już wątek `t2`), poprawione; potem ALL PASS.

## Wynik
- U1–U9, S1–S3 i mapa ekranów jako strony React + Tailwind; w `legacy` zostały M1–M5 i A1–A2.
- Commit z kodem, dokumentacją (`README.md`, `AGENTS.md`, `kompas-mentoring/README.md`), specyfikacją (faza 3 odhaczona) i lekcjami.

## Weryfikacja
- `npm run typecheck` (4 pakiety) i `npm run build` — zielone, 23 trasy.
- Ekrany w `legacy` (M1–M5, A1–A2) vs mockup: 12/12 identycznych przy 1280 i 360 px.
- 69 sprawdzeń przepływów fazy 3 — ALL PASS na `next start` i `next dev`, bez błędów JS.
- 24 ekrany porównane z mockupem obok siebie (1280 px); różnice opisane w specyfikacji (test sprzętu z marginesami).
- Kolizje klas: 533 utilities ∩ `kompas.css` = ∅.
- P3: wysokość wideo 300 px; P2 przy 360 px — karty jak w mockupie.

## Problemy i otwarte kwestie
- Skrypty zrzutów i przepływów nadal poza repo (katalog tmp czyszczony co sesję) — warto dodać je do repo (`playwright` jako devDependency) przed fazą 4; czeka na decyzję użytkownika.
- Chrome nadal podwójny (React + `legacy` dla M/A) — do fazy 4.
- Następny etap: faza 4 — M1–M5 i A1–A2 na shadcn/ui w `(backend)`, usunięcie `src/legacy` i `kompas.css`.

## Wnioski
- `.ai/lessons.md` → „Kod i mockupy”: nawigacja w testach przez `window.next.router.push`; reguły kontekstowe na końcu `kompas.css`.
