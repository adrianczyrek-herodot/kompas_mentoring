---
title: Product brief, backlog i zgłoszenia GitHub Issues
date: 2026-11-11
agent: Claude Code (claude-opus-5-5) przez cezar
status: done
spec: .ai/specs/product-brief.md, .ai/specs/backlog.md
branch: cez/482895f1
---

# Product brief, backlog i zgłoszenia GitHub Issues

## Zadanie
Utworzyć `.ai/specs/product-brief.md` (produkt, odbiorcy, cele, reguły, Now/Later, źródła, założenia, otwarte pytania), `.ai/specs/backlog.md` (epiki, historie, zadania z ID, zależnościami i linkami do zgłoszeń, Now oddzielone od Later) oraz zgłoszenia w GitHub Issues z etykietami priorytetu wg SDLC.

## Przebieg
- Poprzednia sesja (anulowana) nie zostawiła zmian ani zgłoszeń — start od zera.
- Źródła: `kompas-mentoring/KONCEPCJA.md`, spec stacku (plan F0–F8, Q1–Q12), spec F1, runy F0/F1, `SDLC.md`, `.ai/agentic.config.json`, stan `main` i PR-ów.
- Ustalenie: PR #19 i #20 (F1 krok 7: CLI adminów, 2FA) scalone do gałęzi stosu `cez/f1-6-account`, nie do `main` — kodu kroku 7 brak na `main`; ujęte jako pierwsza historia Now.
- `SDLC.md` nie miał zasad priorytetów, choć etykiety `priority-*` są skonfigurowane — dopisana sekcja „Backlog, zgłoszenia i priorytety”.
- Now = domknięcie F1 + F2 + F3 + fundamenty (preview, odpowiedzi na Q3–Q7/Q9–Q12); Later = F4–F8 i pomysły po MVP. Uzasadnienie: F4–F7 blokują otwarte pytania prawne i finansowe.
- Aktywne konto `gh` (`aczyrek`) nie ma uprawnień triage/push w repozytorium — etykiet nie da się nadać; przełączenie konta to decyzja człowieka (lekcja z 2026-11-10).

- Decyzje właściciela: zgłoszenia tworzone kontem `adrianczyrek-herodot` (token tylko w komendach, bez przełączania aktywnego konta); Now = F1–F3 bez płatności (Q-B2).
- Zgłoszenia utworzone skryptem poza repozytorium (dwa przebiegi: utworzenie, potem edycja treści z numerami powiązanych zgłoszeń); numery wpisane w backlog.
- Po otwarciu PR #48: job `e2e smoke` padał 3× w `playwright install --with-deps` (DNS do mirrora Ubuntu na runnerze, `apt` kod 100) — testy nie startowały, kod niewinny. Na prośbę właściciela PR #49 (`ci.yml`: przeglądarka z CDN Playwrighta, `install-deps` osobno z `continue-on-error`, lekcja) — CI zielone, e2e 40 passed. Ponowne uruchomienie e2e na PR #48.

## Wynik
- `.ai/specs/product-brief.md`, `.ai/specs/backlog.md` (4 epiki, 22 historie z zadaniami, Later L1–L16).
- `SDLC.md` §2a — backlog, format zgłoszeń, tabela priorytetów; `AGENTS.md` — wyjątek nazw dla dokumentów żyjących; 2 lekcje w `.ai/lessons.md`.
- GitHub Issues: epiki #22–#25, historie #26–#47; każde ma jedną etykietę `priority-*` i jedną kategorię; epiki linkują historie, historie linkują epik i zależności.

## Weryfikacja
- Próbny przebieg skryptu: 26 treści, przejrzane przykłady (E2-S3, E2).
- `gh issue list`: 26 zgłoszeń z poprawnymi etykietami; treści #23 i #30 z rozwiązanymi numerami (#28…, #29, #37).
- Backlog: każda historia i epik Now ma link do zgłoszenia. Zmiana tylko w dokumentach — lint/typecheck/test/build nie dotyczą.

## Problemy i otwarte kwestie
- Kod kroku 7 F1 (PR #19, #20) nie jest na `main` — historia E1-S1 (#26).
- Linki „Backlog” w zgłoszeniach wskazują `main` — zadziałają po scaleniu PR-a z tymi dokumentami.
- Otwarte pytania Q-B1, Q-B3–Q-B6 i Q3–Q7, Q9–Q12 spec stacku — E4-S2 (#47).

## Wnioski
- Dodane w `.ai/lessons.md`: PR-y ze stosu omijają `main`; etykiety zgłoszeń wymagają konta z triage, priorytety wg `SDLC.md` §2a.
