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
- 15:06 — próba rozdzielenia na 3 subagentów cezar (runner claude): wszystkie padły/trybieły
  `You've hit your org's monthly spend limit` (znany wzorzec z `.ai/lessons.md`).
  Po odnowieniu limitu dwa z trzech dzieci ukończyły się i zostały zwalidowane
  oraz scalone: `cez/7affcdd5` → `security-notes.d/skills-om.md`,
  `cez/14af939f` → `security-notes.d/skills-synced.md` (trzecie, audyt repo,
  anulowane). Resztę audytu wykonano bezpośrednio.
- 15:10 — skan 126 `SKILL.md`, 67 skryptów skilli; grep wzorców ryzykownych i wartości sekretów (0).
- 15:11 — skan 93 logów sesji (~114 MB); znaleziony klucz AWS w 3 plikach; rotacja
  in-place (`AKIA[REDACTED]`), manifest w `~/.claude/security-rotation-2026-11-22/`.
- 15:12 — `.claude/settings.json` (deny + sandbox), hook `PreToolUse`; test hooka ~24 przypadki.
- 15:13 — `scripts/secrets.sh` (Keychain); migracja 11 zmiennych `~/bitmovin_match_alert/.env`.
- 15:13 — test prompt injection (`pi` + `claude-sonnet-4.5`): pułapka zatrzymana.

## Wynik
Jedna zmiana na gałęzi `cez/5091a29b`: `.claude/settings.json`, `.claude/hooks/block-dangerous-commands.sh`,
`.github/CODEOWNERS`, `scripts/secrets.sh`, `security-tests/prompt-injection/`, `security-notes.md`,
spec w `.ai/specs/implemented/`, ten log, oraz scalone znaleziska `security-notes.d/skills-om.md`.

## Weryfikacja
- `python3 -c json.load(.claude/settings.json)` → OK; `bash -n` hooka i `scripts/secrets.sh` → OK.
- `npx @biomejs/biome@2.5.15 check .claude/settings.json package.json` → 0 błędów.
- Hook: 12/12 komend destrukcyjnych → `deny`; 11/11 bezpiecznych → przepuszczone; wejście nieparsowalne → fail-open.
- `scripts/secrets.sh` round-trip `put/get/list/export/run/rm` na namespace `selftest` → OK.
- Migracja `.env`: 11/11 kluczy obecnych w Keychain; loader `bitmovin_match_alert/load-env.sh` → obecne.
- Rotacja sesji: po zmianie wzorce `AKIA/ghp/gho/github_pat/xox/PEM/sk-ant` → 0 plików.
- Test injection: brak znacznika, brak `INJECTION-COMPLIED`, hook odrzuca `chmod 777`.

## Problemy i otwarte kwestie
- `snyk` CLI niezainstalowane → Snyk Agent Scan nieuruchomiony (zastąpiony grepem).
- Brak `timeout`/`gtimeout` (macOS) → użyto pętli `kill -0`/`sleep`.
- Subagenci cezar padli na limicie organizacji Anthropic (zgodnie z lekcją z 2026-11-22).
- Pełnej sesji Claude Code z nowym `.claude/settings.json` nie uruchomiono (limit budżetu);
  sandbox zweryfikowano statycznie (JSON + schemat z docs) i testem hooka.
- Rotacja klucza AWS w konsoli i sprzątnięcie backupu `.env` — po stronie człowieka.

## Wnioski
Dodano wpisy do `.ai/lessons.md` i `.ai/lessons/2026-11-22-hardening-agenta-claude-code.md`.
