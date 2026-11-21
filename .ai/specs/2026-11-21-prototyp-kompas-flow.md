---
title: Klikalny prototyp kompas-flow na @kompas/ui
status: in-progress
created: 2026-11-21
implemented:
related:
  - kompas-mentoring/KONCEPCJA.md
  - .ai/specs/product-brief.md
  - docs/design-system.md
  - .ai/runs/2026-11-21-przeglad-prototypu-kompas-flow.md
  - prototypes/kompas-flow/POSTEP.md
---

# Klikalny prototyp kompas-flow na @kompas/ui

## Kontekst i cel
Klikalny prototyp przepływów z mapy ekranów (KONCEPCJA §3.1) dla właściciela produktu (klika i komentuje) i developera (buduje z niego ekrany). Pierwsza wersja (etapy 0–2) nie używała design systemu, miała 156 błędów TS i 5 niedziałających ekranów — przegląd w `.ai/runs/2026-11-21-przeglad-prototypu-kompas-flow.md`. Użytkownik zdecydował: przebudowa na `@kompas/ui` od etapu 1.

## Zakres
- W zakresie: 23 ekrany mapy (P1–P4, U1–U9, S1–S3, M1–M5, A1–A2) ze stanami L/E/Er/S i ścieżkami błędów z przepływów F1–F6; pasek przeglądu z kontrolkami scenariuszy; konta demo; silnik przeglądu (komentarze) wg jego README; README, notatki przy ekranach, testy nawigacji.
- Poza zakresem: zmiany w `apps/*` i `packages/*`; funkcje spoza mapy; prawdziwe płatności, e-mail, logowanie, wideo.

## Wymagania
1. Ekrany wyłącznie z komponentów i tokenów `@kompas/ui`; brakujące elementy — najprostsza wersja z komponentów bazowych i tokenów w pliku ekranu, komentarz `// DS-GAP: <Nazwa>` i wpis w raporcie.
2. Identyfikatory i trasy ekranów jak w KONCEPCJA §3.1 (m.in. U3 = `/rezerwacja/:bookingId/potwierdzenie`).
3. Dane z `kompas-mentoring/mockupy/src/mocks.ts` (oceny i opinie z szarego prototypu dopuszczone — decyzja 2026-11-21); stały zegar demo `2026-10-20T14:00:00+02:00`, zero `Date.now()`/`new Date()` bez argumentu.
4. Symulacje oznaczone na ekranie; brak pól na prawdziwe dane karty i hasła do zewnętrznych serwisów.
5. Kontrolki scenariuszy tylko w pasku przeglądu, osobno od nawigacji produktu.
6. Każdy przycisk działa albo ma dopisek „w prototypie nie działa”.
7. Stan (wpisane dane, wybrany slot) przetrwa błąd żądania i nieudaną płatność.

## Kryteria akceptacji
- [ ] `tsc --noEmit` z kodem 0; build bez błędów; repozytorium: `pnpm lint`, `pnpm typecheck`, `pnpm build` przechodzą z prototypem w workspace.
- [ ] Testy nawigacji (Playwright): każda trasa w każdej roli renderuje się bez `pageerror`; bramki „zaloguj się” i „inna rola”; ścieżka F1 od P1 do U3.
- [ ] Zero kolorów hex / wartości arbitralnych w `src/` (sprawdzenie skryptem jak `check:tokens`).
- [ ] 320 i 1440 px, jasny i ciemny motyw, obsługa klawiaturą — sprawdzone w przeglądarce.
- [ ] README z kontami demo, scenariuszami i „Ograniczeniami symulacji”; notatka przy każdym ekranie.

## Projekt rozwiązania
Szczegółowy plan (stack, kolejność, kontrolki, konta, komponenty na ekran, luki): `prototypes/kompas-flow/POSTEP.md` → „Etap 0 — plan”.

## Plan wdrożenia
1. Etap 1 — szkielet (Vite + `@kompas/ui`, router, pasek przeglądu, silnik komentarzy) i ścieżka F1 bez błędów.
2. Etap 2 — pozostałe ekrany, stany, role, bramki, scenariusze (równolegle w 3 rozłącznych zadaniach po zamrożeniu wspólnych plików).
3. Etap 3 — notatki, README, testy nawigacji, sprawdzenie w przeglądarce, raport.

## Decyzje i zmiany
- 2026-11-21 — Przebudowa zamiast łatania pierwszej wersji (decyzja użytkownika). Stary kod zostaje w historii gita (commit `ea4e3f4`).
- 2026-11-21 — Oceny i opinie z szarego prototypu mogą zostać (decyzja użytkownika).
- 2026-11-21 — Plan zaakceptowany („dalej”). Ścieżki silnika przeglądu nie podano; użyty silnik znaleziony w `.agents/skills/om-ux-design/references/assets/` (głównego checkoutu). Skopiowany do `public/review/` z adapterem dla Reacta (zmiany oznaczone „kompas-flow adapter”) — README skilla zaznacza, że silnik DOM nie jest gotowym adapterem Reacta.
- 2026-11-21 — U1 dostępny dla gościa do momentu „Dalej” (przepływ F1: wybór terminu → logowanie z zachowanym slotem), mimo że KONCEPCJA §3.2 mówi „trasy U* wymagają zalogowania”. Sprzeczność w specyfikacji — pytanie do właściciela.
- 2026-11-21 — Opłata serwisowa 3 zł i kod KOMPAS10 (−10% ceny sesji) wzięte z szarego prototypu (KONCEPCJA wymienia oba elementy bez wartości).
- 2026-11-21 — Rejestracja w P4 tworzy konto „Nowe konto” (uczeń bez danych) — F1 od zera; rejestracja mentora otwiera konto demo Adam Górski.
- 2026-11-21 — Konfiguracja repo (nie kod aplikacji ani DS): `eslint.config.js` ignoruje `prototypes/*/public/review/**`, `knip.json` dostał wpis workspace prototypu (skrypty silnika ładowane z `index.html`). `pnpm-workspace.yaml` z `prototypes/*` zostaje (potrzebne do `workspace:*`).
- 2026-11-21 — Bez `@vitejs/plugin-react`: Vite 8 kompiluje JSX przez oxc; jedna zależność mniej, brak Fast Refresh.
