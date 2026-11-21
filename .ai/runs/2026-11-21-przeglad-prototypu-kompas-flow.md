---
title: Przegląd prototypu kompas-flow po etapach 0–2
date: 2026-11-21
agent: Claude Code (Opus 5.5) w cezar
status: done
spec:
branch: cez/2c93155b
---

# Przegląd prototypu kompas-flow po etapach 0–2

## Zadanie
Użytkownik zmienił model i poprosił o solidne sprawdzenie prototypu zbudowanego wcześniej w `prototypes/kompas-flow/` (etapy 0–2). Tylko przegląd, bez poprawek kodu.

## Przebieg
- `npx tsc --noEmit` → 156 błędów (95 nieużywane zmienne; reszta to realne błędy: nieistniejące `updateDraft`, `setDraft`, `toggleFavorite`, `mentorTemplate`, `onboarding`, `useParams`, niezdefiniowane `center`, `filteredMentorCountMessage`, `require` w przeglądarce, kolizje typów w `mocks.ts`).
- `vite build` przechodzi (nie sprawdza typów) — stąd wcześniejszy raport „build OK”.
- Smoke test Playwright (Chromium, 1440 px) po 29 trasach w 4 rolach: 5 ekranów to biała strona — P2 (`filteredMentorCountMessage is not defined`), U1 (`setDraft is not a function`), U9 (`center is not defined`), M3 (`reading 'forEach'`); U2 nieosiągalny z U1. Na każdym ekranie `Maximum update depth exceeded`.
- Gość na `#/sesje` widzi „Ten ekran wymaga innej roli. Przekierowuję…” bez przekierowania (powinno być „zaloguj się”).
- 320 px: pasek prototypu nachodzi na nagłówek produktu; P3 bez stylów (tagi sklejone, awatar jako tekst „KN”).
- Zero importów `@kompas/ui`; własna kopia tokenów w `src/styles/globals.css` i klasy BEM bez komponentów DS; kolory hex w kodzie ekranów.
- Brak `README.md` i `POSTEP.md` w katalogu prototypu (POSTEP.md leży w korzeniu repo), brak testów nawigacji, brak notatek przy ekranach.
- Silnik przeglądu: materiały w zadaniu nie zostały uzupełnione (placeholdery `{{…}}`), więc komentarze to własny panel, nie silnik z README.
- Poza katalogiem prototypu zmienione: `pnpm-workspace.yaml` (+`prototypes/*`), `pnpm-lock.yaml`, `POSTEP.md` — przez workspace prototyp wchodzi do `turbo build` repo, więc `pnpm build`/`pnpm typecheck` całego repo padną.

## Wynik
Raport dla użytkownika w rozmowie; kod prototypu bez zmian.

## Weryfikacja
`npx tsc --noEmit` (156 błędów), `npx vite build` (OK), skrypt Playwright poza repo (`/tmp/kf-check`), zrzuty 1440/320 px i ciemny motyw.

## Problemy i otwarte kwestie
Decyzja użytkownika: przebudowa na komponentach `@kompas/ui` vs łatanie obecnego kodu; uzupełnienie materiałów (silnik przeglądu, szary prototyp, miejsce podglądu w Storybooku).

## Wnioski
Wpis w `.ai/lessons.md` (Proces i narzędzia, 2026-11-21) o „build OK” bez `tsc`.
