---
title: Migracja do monorepo — faza 2 (ekrany publiczne P1–P4 w React + Tailwind)
date: 2026-10-20
agent: Claude Code (claude-opus-5-5) przez cezar
status: done
spec: .ai/specs/2026-10-20-migracja-mockupu-do-monorepo.md
branch: cez/d24e11ee
---

# Migracja do monorepo — faza 2 (ekrany publiczne P1–P4 w React + Tailwind)

## Zadanie
Kontynuować migrację według planu: zaimplementować pierwszą nieukończoną fazę (2), zweryfikować, zaktualizować postęp w planie.

## Przebieg
- Wznowienie po limicie dostawcy: handoff + `git log` — faza 1 zacommitowana (`475cdfe`), drzewo czyste, faza 2 nierozpoczęta.
- Projekt fazy 2 dopisany do specyfikacji (wspólny root layout, stan demo z subskrypcją, `toUrl`, przekierowanie tras publicznych z `legacy`).
- `git mv legacy/store.ts → demo/store.ts` (+ `notify`/`subscribe`, `useDemoStore`); `demo/navigation.ts` (role, menu, `DEFAULT_ROUTE`, `PUBLIC_SCREENS`, `matchPattern`, `toUrl`); `legacy/main.ts` bez P1–P4, z przekierowaniem; `screens/public.ts` usunięty.
- `(legacy)` → `(frontend)` (root layout z `frontend.css` + `Toaster`), `/app` jako host `legacy`, `(public)/` z chrome React; strony `/`, `/mentorzy`, `/mentorzy/[id]`, `/logowanie`, `/rejestracja` + widoki w `src/views/public/`.
- `@devmentor/ui`: `frontend.css` (motyw Tailwinda z tokenami Kompasu, `kompas.css` w warstwie, bez preflightu), komponenty `frontend/*`; `hero.tsx` (placeholder ze szkieletu) usunięty. `@devmentor/core`: `domain/search.ts`, `validation.ts`.
- Typecheck i build zielone od pierwszego podejścia.
- Zrzuty P1–P4 vs mockup: różnice z braku preflightu (natywne przyciski w pasku, pole wyszukiwania, ulubiony) i z kolejności klas w `cva` (ramka przycisku „ghost”) → poprawione (`cn()` w wariantach, jawne `border-0 bg-transparent`).
- Katalog tmp z narzędziami zrzutów został wyczyszczony między sesjami — odtworzony (Playwright 1.57, pixelmatch, stary mockup przez `git archive a4ca05f`).

## Wynik
- Strony React (Tailwind) dla P1–P4 pod prawdziwymi adresami; pozostałe ekrany pod `/app#/…`; wspólny stan demo; pasek mockupu i nagłówek w React.
- Zmienione/nowe: `packages/app/src/{demo,views/public}/*`, `packages/app/src/app/(frontend)/**`, `packages/app/src/legacy/{main,ui,kompas-app}`, `packages/core/src/{domain/search,validation}.ts`, `packages/ui/src/{frontend/*,styles/frontend.css}`, eksporty pakietów; dokumentacja `README.md`, `AGENTS.md`, `kompas-mentoring/README.md`; specyfikacja (faza 2 odhaczona), lekcje.

## Weryfikacja
- `npm run typecheck` (4 pakiety) i `npm run build` — zielone; trasy: `/`, `/mentorzy`, `/mentorzy/[id]`, `/logowanie`, `/rejestracja`, `/app`, `/admin`, `/api/health`.
- Kolizje klas: 353 klasy utilities w zbudowanym CSS ∩ 258 klas `kompas.css` = ∅; preflight nieobecny.
- Ekrany w `legacy` (`/app#/…`) vs mockup: 24/24 identyczne co do piksela przy 1280 px i 24/24 przy 360 px.
- Przepływy fazy 2 (28 sprawdzeń: walidacja i wyszukiwanie P1, filtry/sortowanie/czyszczenie/ulubiony/stany P2, profil i brak profilu P3, `returnTo` z rezerwacji przez rejestrację do płatności, toast po przejściu, linki legacy → React i „wstecz”, przełącznik roli, `zajety@kompas.pl`, logowanie społecznościowe, stare `/#/…`, CTA mentora, `/app` bez hasha) — ALL PASS na `next start` i `next dev`.
- Wyniki wyszukiwarki identyczne z mockupem dla 8 kombinacji filtrów.
- Zrzuty P1–P4 obejrzane obok mockupu (1280 px) i P3 przy 360 px (bez poziomego przewijania).

## Problemy i otwarte kwestie
- Placeholder wideo w P3 wyższy niż w mockupie (opisane w specyfikacji).
- Chrome (pasek mockupu/nagłówek) istnieje podwójnie: React dla P1–P4 i HTML w `legacy` — do fazy 4.
- Skrypty zrzutów i przepływów wciąż poza repo, a katalog tmp bywa czyszczony — propozycja: dodać je do repo jako skrypt (`playwright` jako devDependency) przed fazą 3.
- Następny etap: faza 3 — ekrany ucznia (U1–U9) i współdzielone (S1–S3) w React.

## Wnioski
- `.ai/lessons.md` → „Kod i mockupy”: brak preflightu i `cva` + `cn()`; nawigacja klienta między React a `/app`; dopisek o czyszczeniu katalogu tmp.
