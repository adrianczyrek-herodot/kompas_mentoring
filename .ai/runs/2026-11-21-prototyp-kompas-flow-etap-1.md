---
title: Prototyp kompas-flow na @kompas/ui — etapy 0–1
date: 2026-11-21
agent: Claude Code (Opus 5.5) w cezar
status: done
spec: .ai/specs/2026-11-21-prototyp-kompas-flow.md
branch: cez/2c93155b
---

# Prototyp kompas-flow na @kompas/ui — etapy 0–1

## Zadanie
Po przeglądzie pierwszej wersji (`2026-11-21-przeglad-prototypu-kompas-flow.md`) użytkownik wybrał przebudowę na `@kompas/ui`. Etap 0: nowy plan; etap 1: szkielet, silnik przeglądu i ścieżka F1 bez błędów.

## Przebieg
- Spis DS: 31 komponentów bazowych + 16 produktowych w eksporcie; `packages/ui/POSTEP.md` opisuje 45 produktowych (29 nie istnieje).
- Plan v2 w `prototypes/kompas-flow/POSTEP.md` i specyfikacji; zaakceptowany „dalej”.
- Silnik przeglądu znaleziony w `.agents/skills/om-ux-design/references/assets/` (głównego checkoutu); skopiowany z adapterem dla Reacta.
- Stary `src/` usunięty (`git rm`), nowy szkielet, ekrany P1–P4, U1–U5.
- Poprawki po sprawdzeniu: zwężający się pasek przeglądu, błąd pola celu po edycji, błędy ESLint (FormEvent, wyczerpujące switch), knip (skrypty silnika, nieużywane eksporty).

## Wynik
`prototypes/kompas-flow/` — nowy kod; `eslint.config.js`, `knip.json` — wyjątki dla skryptów silnika. Szczegóły w `POSTEP.md` → „Etap 1”.

## Weryfikacja
`tsc --noEmit` 0 błędów; `pnpm lint`, `pnpm typecheck`, `pnpm build` — kod 0; `check-tokens.mjs` na `src/` — 0; Playwright: 32 trasy × 6 kont bez błędów, F1 od gościa do U4, rezerwacja z salda, akcje U5, silnik komentarzy, prezentacja i „Back”; 320 px i ciemny motyw; axe WCAG 2.2 AA — 0 poważnych naruszeń na 9 ekranach × 2 motywy.

## Problemy i otwarte kwestie
- Sprzeczność KONCEPCJA: F1 (gość wybiera termin, loguje się przy „Dalej”) vs §3.2 (U* wymagają logowania).
- Usterki DS: `checkbox.tsx` (brak spacji w klasie hover/aria-invalid), `AppHeader` bez `render` dla linków.
- Komentarze nie kotwiczą w nakładkach (portal poza `.frame`).

## Wnioski
Wpis w `.ai/lessons.md` (Kod i mockupy, 2026-11-21) o rozbieżności `packages/ui/POSTEP.md` z kodem.
