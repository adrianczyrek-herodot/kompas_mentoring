---
title: Podział lekcji na obszary i czytanie dużych plików fragmentami
status: implemented
created: 2026-11-22
implemented: 2026-11-22
related: [docs/context-audit/REPORT.md, .ai/runs/2026-11-22-audyt-kontekstu-agenta.md]
---

# Podział lekcji na obszary i czytanie dużych plików fragmentami

## Kontekst i cel
Audyt kontekstu (`docs/context-audit/REPORT.md` §5, znaleziska 3 i 4) wskazał dwie szybkie wygrane:
- `.ai/lessons.md` (~8 100 tok) jest czytany w całości na starcie każdego zadania, a większość lekcji dotyczy jednego obszaru (UI/Storybook, e2e, backend/Better Auth, prototypy);
- duże specyfikacje są czytane w całości i wielokrotnie (spec auth 4× w jednej sesji, 69 000 tok).

Cel: mniej tokenów na start zadania i na pracę ze specyfikacjami, bez utraty lekcji.

## Zakres
- W zakresie: podział `.ai/lessons.md` na część ogólną i pliki obszarowe `.ai/lessons/areas/*.md`; trasy do nich w routerze `AGENTS.md`; aktualizacja zasad 1 i 6 oraz sekcji „Lekcje” i „Katalog `.ai/`”; reguła czytania dużych plików fragmentami; sprawdzanie w `pnpm agents:check-router`, że każdy plik obszarowy jest podpięty w routerze.
- Poza zakresem: zmiana treści lekcji (przenosimy dosłownie), spis treści w samych specyfikacjach, ustawienia konta (skille, MCP).

## Wymagania
1. Każda lekcja z obecnego `.ai/lessons.md` trafia dosłownie do dokładnie jednego pliku: `.ai/lessons.md` (proces, narzędzia, CI, praca agentów) albo pliku obszarowego.
2. Pliki obszarowe mają stałe angielskie nazwy (wyjątek od reguły `YYYY-MM-DD-slug.md`, zapisany w `AGENTS.md`): `ui.md`, `e2e.md`, `backend.md`, `prototypes.md`.
3. `.ai/lessons.md` zawiera spis plików obszarowych z opisem, kiedy je czytać.
4. Każdy plik obszarowy jest wymieniony w tabeli routera `AGENTS.md`; `pnpm agents:check-router` kończy się błędem, gdy któregoś brakuje.
5. `AGENTS.md` ma regułę: duże pliki (> ~300 linii) czytaj od nagłówków i fragmentami; nie wczytuj ponownie niezmienionego pliku.

## Kryteria akceptacji
- [x] Liczba punktów lekcji przed = suma punktów po (żaden nie zginął, żaden nie jest zdublowany).
- [x] `.ai/lessons.md` ma wyraźnie mniej tokenów niż ~8 100 (pomiar: znaki ÷ 1,95, współczynnik zmierzony w audycie).
- [x] `pnpm agents:check-router` przechodzi; po usunięciu trasy do pliku obszarowego zwraca błąd.
- [ ] Biome dla `scripts/check-task-router.mjs` bez błędów — nie sprawdzone lokalnie (brak Biome w worktree), sprawdzi CI.

## Projekt rozwiązania
- `.ai/lessons.md`: nagłówek + spis obszarów + sekcja „Proces i narzędzia” (z dotychczasowej sekcji oraz lekcji o narzędziach lint/CI i o naprawie u źródła).
- `.ai/lessons/areas/ui.md` — Storybook, tokeny CSS, Tailwind, komponenty `packages/ui`.
- `.ai/lessons/areas/e2e.md` — Playwright, axe, CI e2e, baza testowa, testy integracyjne.
- `.ai/lessons/areas/backend.md` — MikroORM, Better Auth, RSC/DI, boundaries, logowanie.
- `.ai/lessons/areas/prototypes.md` — `prototypes/*` (kompas-flow, discovery).
- `AGENTS.md`: router (wiersze błąd, core, identity, UI, e2e, prototyp), wyjątek nazw w „Katalog `.ai/`”, zasady 1 i 6, „Sposób pracy” pkt 5, „Lekcje”.
- `scripts/check-task-router.mjs`: każdy `.ai/lessons/areas/*.md` musi wystąpić w sekcji routera.

## Plan wdrożenia
1. Utworzyć pliki obszarowe z lekcjami przeniesionymi dosłownie; przebudować `.ai/lessons.md`.
2. Zmienić `AGENTS.md` i skrypt sprawdzający.
3. Uruchomić `pnpm agents:check-router` (pozytywnie i negatywnie), Biome; policzyć punkty i rozmiar.
4. Pokazać diff właścicielowi; po akceptacji commit, spec → `implemented/`.

## Decyzje i zmiany
- 2026-11-22 — Pliki obszarowe w podkatalogu `areas/` ze stałymi nazwami zamiast `YYYY-MM-DD-slug.md`: to dokumenty żyjące (jak `backlog.md`), data w nazwie byłaby myląca.
