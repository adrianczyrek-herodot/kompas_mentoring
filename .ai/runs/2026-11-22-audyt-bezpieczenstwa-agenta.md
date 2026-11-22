---
title: Audyt bezpieczeństwa konfiguracji agenta i hardening
date: 2026-11-22
agent: cezar / pi
status: in-progress
spec: .ai/specs/2026-11-22-hardening-agenta.md
branch: cez/5091a29b
---

# Audyt bezpieczeństwa konfiguracji agenta i hardening

## Zadanie
Audyt plików konfiguracyjnych agenta (własny projekt + dwa ostatnio sklonowane repozytoria),
skan skilli (grep + Snyk Agent Scan), skan i rotacja sesji w `~/.claude/projects/`,
PR z regułami deny, sandboxem i hookiem blokującym, przeniesienie `.env` do menedżera
sekretów, dopisanie `.claude/` i `.mcp.json` do CODEOWNERS oraz własny test prompt injection.
Wynik: `security-notes.md`.

## Przebieg
- 15:05 — start; przeczytano `.ai/lessons.md`, inwentarz konfiguracji agenta w HOME i projekcie.
- 15:05 — repo bez `.claude/`, bez `.mcp.json`, bez realnego `.env` (tylko `.env.example`), bez CODEOWNERS.

## Wynik
(w toku)

## Weryfikacja
(w toku)

## Problemy i otwarte kwestie
- `snyk` CLI niezainstalowane na maszynie.
- Brak `timeout`/`gtimeout` (macOS).

## Wnioski
(w toku)
