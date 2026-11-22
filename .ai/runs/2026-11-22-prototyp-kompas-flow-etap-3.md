---
title: Prototyp kompas-flow — etap 3 (notatki, README, testy nawigacji, axe)
date: 2026-11-22
agent: Claude Code (claude-opus-4) w cezarze
status: done
spec: .ai/specs/implemented/2026-11-21-prototyp-kompas-flow.md
branch: cez/2c93155b
---

# Prototyp kompas-flow — etap 3

## Zadanie
Dokończyć etap 3 prototypu po scaleniu etapu 2: notatki przy każdym ekranie, README z
„Ograniczeniami symulacji”, testy nawigacji, sprawdzenie w przeglądarce (320/1440 px, jasny/ciemny,
klawiatura, każda kontrolka scenariusza). Użytkownik potwierdził: gość wybiera termin przed
logowaniem (F1), silnik przeglądu z `om-ux-design` jest właściwy, start etapu 3.

## Przebieg
- Notatki: `notes` w `ScreenDef` (`src/screens/registry.ts`, 23 wpisy) + render w
  `src/shell/screen-frame.tsx` (historie / symulacja / czego nie rozstrzyga).
- README `prototypes/kompas-flow/README.md`: uruchomienie, testy, pasek przeglądu, konta demo,
  scenariusze, „Ograniczenia symulacji”, mapa ekranów, luki DS.
- Testy: `@playwright/test` + `@axe-core/playwright` w devDeps prototypu, `playwright.config.ts`
  (`vite preview`, 320/1440), `e2e/support.ts`, `e2e/navigation.spec.ts`, `e2e/a11y.spec.ts`.
- Debug: „kontrolki scenariuszy” — dwuznaczne `Brak`/`Brak sieci` → `exact`. „Threads” — tryb
  Comment sam otwiera panel, więc test najpierw zamyka go Escape; na 320 px otwarty panel zasłania
  pasek. axe — fałszywe `color-contrast` przed wczytaniem webfontów → `document.fonts.ready`
  w `setTheme`.

## Wynik
- 23 notatki przy ekranach; README z ograniczeniami symulacji; 20 testów Playwright (19 passed,
  1 celowo skipped — axe na szerokim ekranie).

## Weryfikacja
- `pnpm --filter @kompas/prototype-kompas-flow test:e2e` — 19 passed, 1 skipped.
- `pnpm lint` 0 błędów (knip, dependency-cruiser), `pnpm typecheck` 7/7, `pnpm build` 2/2.
- `check:classes` 0, `check-tokens` 0.
- axe WCAG 2.2 AA: 23 ekrany × jasny/ciemny — 0 poważnych naruszeń.

## Problemy i otwarte kwestie
- Na 320 px otwarty panel komentarzy zasłania pasek przeglądu (zamyka się Escape).
- Testy pokrywają każdą kontrolkę scenariusza i tryb silnika, ale nie każdy pojedynczy przycisk
  produktu; Safari/Firefox nie były sprawdzane.
- Pytania do specyfikacji: opłata 3 zł / `KOMPAS10`, edycja wniosku mentora czekającego na
  weryfikację, widoczność notatek mentora.

## Wnioski
- `.ai/lessons.md` (2026-11-22): axe `color-contrast` przed wczytaniem webfontów daje fałszywe
  trafienia — czekaj na `document.fonts.ready` i koniec przejścia kolorów.
