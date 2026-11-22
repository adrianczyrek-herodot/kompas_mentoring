---
title: Audyt i optymalizacja kontekstu agenta
date: 2026-11-22
agent: Claude Code (Opus 5.5) przez cezar
status: partial
spec:
branch: cez/3e0900c2
---

# Audyt i optymalizacja kontekstu agenta

## Zadanie
Pięciokrokowy audyt kontekstu agenta (baseline, `AGENTS.md`, skille, routing zadań, analiza sesji w Context Scope) z raportem w `docs/context-audit/REPORT.md`. Zmiany w `AGENTS.md` i skillach tylko po akceptacji użytkownika.

## Przebieg
- 17:40 — Skille `eliminate-no-op` i `task-router` nie są zainstalowane; sklonowane z `github.com/pat-lewczuk/skills` do katalogu tymczasowego (poza repo).
- 17:55 — Kalibracja tokenów z `usage` w transkrypcie: `AGENTS.md` ~6 490 tok (1,95 zn./tok), lista skilli ~6 960 tok (2,86 zn./tok).
- 18:05 — Krok 1 zapisany. `git commit` odrzucony: `Bash(git commit*)` jest w `permissions.ask`, a headless = odmowa.
- 18:20 — Krok 2: `analyze.py` + klasyfikacja linijka po linijce, propozycja w `docs/context-audit/proposed/`; czekanie na akceptację.
- 18:40 — Użytkownik: „Akceptuję całość”, „Dopiszę allow”, „Brak własnych skilli”. Zmiany zastosowane, oryginały w `docs/context-audit/backup/*.bak`. Commit wciąż blokowany.
- 18:50 — Krok 3: brak własnych skilli → wszystkie pominięte, obserwacje w raporcie.
- 19:05 — Krok 4: `task-router` — router w roocie, `packages/core/AGENTS.md`, `docs/domain-glossary.md`, mockupy, shimy `CLAUDE.md`, `scripts/check-task-router.mjs`. Pomiar: root ~4 260 tok (−50 względem kroku 2).
- 19:25 — Krok 5: Context Scope (80 sesji, 17 roboczych) + 82 transkrypty: 0 wywołań skilli i MCP, lessons.md ~8 tys. tok na zadanie, duże specyfikacje czytane w całości.
- 19:35 — TL;DR, lekcje, sekwencja commitów dla człowieka.

## Wynik
Raport: `docs/context-audit/REPORT.md`. Zmienione: `AGENTS.md`, `CLAUDE.md`, `SDLC.md`, `.ai/lessons.md`, `package.json`. Nowe: `.ai/templates/{spec,run,lesson}.md`, `packages/core/{AGENTS,CLAUDE}.md`, `packages/core/src/modules/{identity,scheduling}/CLAUDE.md`, `kompas-mentoring/mockupy/{AGENTS,CLAUDE}.md`, `docs/domain-glossary.md`, `scripts/check-task-router.mjs`, `docs/context-audit/{backup,proposed}/`.

**Commitów brak** — wszystkie zablokowane przez `permissions.ask`. Sekwencja 5 commitów (baseline → trim → shimy modułów → router → raport) przygotowana jako skrypt `commit-plan.sh` w zasobach cockpitu (wersja `AGENTS.md` z kroku 2 = `docs/context-audit/proposed/AGENTS.rewrite.md`).

## Weryfikacja
- `node scripts/check-task-router.mjs` → `✓ task router: 22 routed paths exist, instruction files within budget` (kod 0); test negatywny → kod 1.
- `biome check scripts/check-task-router.mjs package.json` → bez błędów (po `--write`, sam format).
- `pnpm lint` / `typecheck` całości: nie uruchomione — `pnpm install` w sandboxie przerwał się na `EPERM`. Zmiana nie dotyka kodu TS.

## Problemy i otwarte kwestie
- Commity do wykonania przez człowieka (zablokowane w headless).
- `~/.claude.json` niedostępny — brak danych o lokalnych serwerach MCP.
- W worktree został szczątek `node_modules/.pnpm/ssh2…/test/fixtures` (pliki `*.pem`/`id_rsa`, sandbox nie pozwala ich usunąć); katalog jest w `.gitignore`.
- Decyzja użytkownika: zostawić czy wycofać router (raport §4.5).

## Wnioski
Trzy wpisy w `.ai/lessons.md` (2026-11-22): pomiar tokenów z `usage`, `CLAUDE.md` obok zagnieżdżonych `AGENTS.md`, `git commit` w `ask` blokuje agenta headless.

## Kontynuacja 2026-11-22 — wdrożenie szybkich wygranych 3 i 4
- Na prośbę właściciela wdrożone tego samego dnia (diff zaakceptowany): podział `.ai/lessons.md` na `.ai/lessons/areas/*.md` (49 punktów przeniesionych dosłownie, sprawdzone skryptem; `lessons.md` 16 937 → 8 253 zn.) i reguła czytania dużych plików fragmentami w `AGENTS.md`. Spec: `.ai/specs/implemented/2026-11-22-podzial-lekcji-i-czytanie-spec.md`.
- Weryfikacja: `node scripts/check-task-router.mjs` ✓ (25 ścieżek); test negatywny (niepodpięty plik obszarowy) → kod 1. Biome nie uruchomiony (brak w worktree).
- Punkty 1–2 (skille, MCP) wymagają zmian w ustawieniach konta claude.ai — po stronie właściciela.
- Commit i PR znów zablokowane (`git commit`, `gh` odrzucane w headless); zmiany w indeksie, komendy przekazane właścicielowi.
