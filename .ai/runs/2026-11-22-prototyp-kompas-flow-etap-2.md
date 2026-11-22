---
title: Prototyp kompas-flow — etap 2 od nowa (14 ekranów, stany, role, scenariusze)
date: 2026-11-22
agent: Claude Code (claude-opus-5-5) + sub-zadania cezar (sonnet)
status: done
spec: .ai/specs/implemented/2026-11-21-prototyp-kompas-flow.md
branch: cez/2c93155b
---

# Prototyp kompas-flow — etap 2 od nowa

## Zadanie
Użytkownik: „kontynuuj” (etap 3). Przed etapem 3 sprawdzenie etapu 2 (commit `202c452`, zrobiony innym modelem) — wynik: do przepisania.

## Przebieg
- Przegląd `202c452`: `tsc` 0, ale `pnpm lint` — 42 błędy (CI PR #57 czerwony). Ekrany używają klas spoza DS (`bg-surface-primary`, `text-text-primary`, `bg-accent-primary`, `text-white`, `text-heading-*` — nie istnieją w `globals.css`, więc bez stylu), hooki po wczesnym `return` (U6), `alert()` (M1), natywne `<input type=checkbox>` zamiast `Checkbox`, kwoty jako `number` (M5), martwe przyciski („Zapisz notatkę”, „Dodaj zdjęcie”, „Zleć wypłatę”, potwierdzenie „Opuść pokój”), krok M1 nie podąża za trasą (`setStep` nieużywane), dane spoza mocków.
- Luka z etapu 1: scenariusz „wygaśnięcie sesji” jest w stanie, ale bez kontrolki i bez obsługi; brak presetów zegara, „mentor nie dołączył”.
- Decyzja: wspólna warstwa stanu i scenariusze — sam; ekrany — 3 równoległe zadania o rozłącznych plikach (uczeń U6–U9 + S1–S3, mentor M1–M5, admin A1–A2).

## Wynik
- Warstwa wspólna: `src/data/*` (cele, plany, płatności, wiadomości, powiadomienia, praca mentora, wnioski, spory), `src/state/world.ts` (akcje między rolami), `useAction`/`FailureAlert`, kontrolki scenariuszy (wygaśnięcie sesji, presety zegara, „mentor nie dołącza”, odpowiedź mentora na próbną), licznik nieprzeczytanych na dzwonku.
- 14 ekranów etapu 2 zbudowane w 3 zadaniach cezar (uczeń U6–U9 + S1–S3, mentor M1–M5, admin A1–A2) na rozłącznych plikach, scalone po kolei.
- Nowy strażnik `prototypes/kompas-flow/scripts/check-classes.mjs`: klasa z JSX musi mieć CSS w `dist`; skanuje całą treść pliku (także `cn(…)` i wartości wieloliniowe), liczy tylko literały.
- Poprawki integracyjne: ponowiona wysyłka wiadomości dociera do odbiorcy; saldo tylko do mentora po próbnej; sloty P3/U1/U5 respektują ustawienia M3 (wyprzedzenie, bufor, dni wolne); `planned-screen.tsx` usunięty, gdy wszystkie ekrany gotowe.
- Pasek przeglądu zawija kontrolki (`flex-wrap` w `index.html` i `src/styles.css`), więc przy 320 px nic nie jest ucięte.
- PR #59 (mentor) zamknięty jako duplikat: jego gałąź nie ma commita, którego nie ma `cez/2c93155b` (0 do przodu, 10 do tyłu); zawartość M1–M5 jest w PR #57.

## Weryfikacja
- `pnpm typecheck` 7/7, `pnpm lint` 0 błędów (knip + dependency-cruiser), `pnpm build` 2/2.
- CI PR #57: `build`, `lint`, `typecheck`, `unit`, `integration`, `Storybook`, `e2e smoke` — zielone (run 45018155729).
- Playwright: 7 kont × 23 trasy × 2 motywy = 322 przejścia bez `pageerror`/błędów konsoli; 320/375/1440 px bez poziomego przewijania i bez uciętych kontrolek; `check-classes` 0; `check-tokens` 0.

## Problemy i otwarte kwestie
- Pytania do specyfikacji: gość wybiera termin przed logowaniem (F1 vs KONCEPCJA §3.2); opłata 3 zł i `KOMPAS10` bez wartości w KONCEPCJI; czy mentor edytuje wniosek czekający na weryfikację.
- axe dla 14 nowych ekranów i U2 oraz klawiatura/Safari/Firefox — zostają do etapu 3.
- Rozbieżność `packages/ui/POSTEP.md` (45 komponentów) vs kod (16) — do zgłoszenia.
- Usterka DS `checkbox.tsx` (brak spacji w `hover:bg-surface-hoveraria-invalid:`) — poza zakresem, do zgłoszenia.

## Wnioski
- „Build OK” bez `tsc` mylące (już w `lessons.md`); tu doszło: raport podzadania to twierdzenie — każdą gałąź sprawdzono diffem, typami, lintem, klasami i przeglądarką przed scaleniem.
