---
title: E2-S2 — onboarding mentora M1 kroki 1–4 (plan F2, kroki 1–6)
date: 2026-11-22
agent: Claude Code (Opus 5.5) i pi (MiniMax M3.1) przez cezar, dziecko runu 00c9b37b
status: done
spec: .ai/specs/2026-11-22-f2-katalog-onboarding.md
branch: cez/29c9af54
---

# E2-S2 — onboarding mentora M1 kroki 1–4

## Zadanie
Zaimplementować kroki 1–6 „Planu wdrożenia” specyfikacji F2 (zgłoszenie #29, epik #23): domena `catalog`, wspólne zdarzenia (outbox/inbox), migracja i komendy szkicu kroków 1–4, `FileStorage` i upload zdjęcia, komponenty UI, ekrany M1 kroków 1–4 ze strażnikiem `/mentor/*` i E2E.

## Przebieg
- 18:40 (sesja 1, Claude Code) — Start. Przeczytane: `AGENTS.md`, `.ai/lessons.md`, lekcje obszarowe (backend, ui, e2e), `packages/core/AGENTS.md`, `scheduling/AGENTS.md`, `docs/design-system.md`, `SDLC.md`, specyfikacja F2. W tej sesji zablokowane były `git commit`, `gh` i `docker` (reguły `permissions.ask` w `.claude/settings.json`) — implementacja powstała w drzewie roboczym jako jeden commit autosave (`ca0fe1d`, kroki 1–3).
- 20:00 (sesja 2, pi) — Kontynuacja. Kroki 1–3 (domena `catalog`, wspólne zdarzenia, migracja + komendy + router oRPC) przejęte z drzewa; krok 4 (FileStorage), 5 (komponenty UI) i 6 (ekrany M1 + E2E) napisane od zera.
- Krok 4: port `FileStorage` (domena) + adaptery R2 / lokalny / fake, test kontraktowy portu, komendy `request-photo-upload` / `confirm-photo-upload`, cron sprzątający (`catalog.cleanup-orphan-uploads`), trasa `/pliki/[...key]` w `apps/web`.
- Krok 5: `Stepper`, `TagInput`, `PhotoUploader`, `VideoLinkField`, `VideoFacade`, `RateInput`, `EarningsPreview` w `packages/ui` (stories + testy interakcji w Storybook).
- Krok 6: `/mentor` (status profilu), `/mentor/onboarding` i `/mentor/onboarding/[krok]` (kroki 1–4), layout-strażnik, server actions, teksty w `messages/pl.json`, E2E `onboarding.spec.ts` (360 i 1280 px, axe).
- Poprawki po weryfikacji: kody problemów kontraktów zgodne z domeną; `Temporal.Instant` → `Date` w adapterze MikroORM (DriverException „Cannot use valueOf”); cykl `catalog.errors.ts` ↔ `mentor-profile.state.ts` rozwiązany plikiem `mentor-profile.status.ts`; katalog kategorii i seed w migracji.

## Wynik
Kroki 1–6 planu specyfikacji F2 zaimplementowane. Moduł `catalog` ma domenę `MentorProfile` (maszyna stanów, polityki pól, stawka jako `Money`, slug), błędy, testy Vitest, `AGENTS.md`/`CLAUDE.md` i nowe uprawnienia w `identity`; wspólna szyna zdarzeń (pg-boss w transakcji, inbox z deduplikacją) z testami integracyjnymi; migracja schematu `catalog` z seedem kategorii, komendy szkicu kroków 1–4, zapytanie profilu i router oRPC; port `FileStorage` z adapterami i presigned uploadem; siedem nowych komponentów UI; ekrany M1 kroków 1–4 z formularzami, błędami inline i E2E.

## Weryfikacja
Wszystkie polecenia z `AGENTS.md` → „Projekt” zielone w worktree (Docker Desktop włączony, `docker compose up -d`, `pnpm db:migrate`):

| Polecenie | Wynik |
|---|---|
| `pnpm lint` | 0 błędów (132 ostrzeżenia wyłącznie w `prototypes/`, sprzed historii) |
| `pnpm typecheck` | 7/7 pakietów OK |
| `pnpm test` | 200 testów OK (core 174, contracts 22, testing 2, worker 2) |
| `pnpm build` | OK (`@kompas/web`, `@kompas/ui`) |
| `pnpm test:integration` | 22 testy OK (4 pliki: `catalog`, `identity`, `events`, `migrations`) |
| `pnpm test:e2e` | 72 testy `apps/web` + 21 `prototypes` OK (16 nowych w `onboarding.spec.ts`) |
| `pnpm --filter @kompas/ui test:stories` | 379 testów OK (jasny motyw) |
| `pnpm --filter @kompas/ui test:stories:themes` | 379 + 379 OK (jasny i ciemny) |
| `pnpm --filter @kompas/ui check:tokens` | „No values outside the design tokens.” |

## Problemy i otwarte kwestie
- `next build` (Next.js 16.4.2) raz na ~5 minut przerywa się błędem `SecurityFatalError` (znana podatność wersji Next.js) i każe powtórzyć to samo polecenie — w CI (bez zmiennych agenta) warunek ten nie zachodzi. Rekomendacja od Next.js: `next upgrade --agent=security` (decyzja właściciela, poza zakresem E2-S2).
- Kroki 5–6 M1 (dostępność, weryfikacja, DAC7) oraz `/mentor` ze statusem wniosku należą do E2-S3 — ekrany M1 pokazują w tym miejscu komunikat „ten krok dochodzi w kolejnym etapie”.
- Ścieżki `humanReview` (migracja `catalog`, uprawnienia w `identity`) oznaczone w PR do przeglądu człowieka.

## Wnioski
- Kontrakt w `packages/contracts` i domena w `packages/core` muszą mówić o błędach **jednymi kodami** — inaczej formularz pokazuje inny komunikat niż serwer i oba wyglądają na losowe.
- MikroORM 7 nie przyjmuje `Temporal.Instant` jako parametru zapytania (woła `valueOf()` na obiekcie) — w adapterach konwertujemy na `Date` (`toDate`), a w maperach z powrotem na `Temporal.Instant`.
- `packages/testing` nie może importować `packages/core` (cykl pakietów) — fake portu `FileStorage` stoi obok portu w module, który go definiuje.
