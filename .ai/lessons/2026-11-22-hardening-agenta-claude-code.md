---
title: Hardening agenta w Claude Code — deny rules, sandbox i hook
date: 2026-11-22
tags: [security, agent, claude-code, sandbox]
---

# Hardening agenta w Claude Code — deny rules, sandbox i hook

## Kontekst / objawy

Repozytorium nie miało `.claude/settings.json`, więc agent czytał dowolne pliki
(`~/.ssh`, `~/.aws`, `.env`) i mógł wysyłać je do sieci oraz uruchamiać dowolne
komendy. W logach sesji agenta leżały w plaintextcie klucze AWS.

## Przyczyna

Domyślnie Claude Code działa z uprawnieniami użytkownika i pyta o zgodę, ale
gdy nikt nie patrzy lub gdy użytkownik ślepo akceptuje, nie ma żadnej granicy
OS-owej. Brak też allowlisty domen i deny rules na pliki z sekretami.

## Rozwiązanie

Trzy warstwy w `.claude/settings.json` (schemat z docs.claude.com → „Bash
sandbox”, „Settings”) plus CODEOWNERS na `.claude/` i `.mcp.json`:

1. `permissions.deny` — `Read(...)`/`Edit(...)` na `.env*`, `~/.ssh`, `~/.aws`,
   `~/.claude.json`, `~/.claude/.credentials.json`, klucze prywatne; `Bash(...)`
   na `rm -rf /`, `git push --force`, `gh pr merge`, `chmod 777`, `sudo`,
   `security find-generic-password`; `WebFetch`, `WebSearch`, `mcp__*`.
2. `sandbox` — `enabled: true`, `failIfUnavailable: true`,
   `allowUnsandboxedCommands: false`, `filesystem.denyRead/denyWrite`,
   `network.allowedDomains` + `strictAllowlist: true`, `allowLocalBinding: true`.
3. `hooks.PreToolUse` (matcher `Bash`) — skrypt czytający JSON ze stdin i
   zwracający `hookSpecificOutput.permissionDecision = "deny"`.

## Pułapki (na co uważać)

- **`sandbox.credentials` w projektowym `.claude/settings.json` jest
  ignorowany** — honorowany tylko w user/managed settings i `--settings`.
  W repo blokuj sekrety przez `filesystem.denyRead` + `permissions.deny`
  `Read(...)`.
- `permissions.deny` `Bash(curl *)` **nie** łapie `/usr/bin/curl` ani
  `sh -c 'curl …'`, a deny na pliki nie działa na dowolne podprocesy — dlatego
  potrzebny jest sandbox (OS-level) i hook (druga warstwa na treści komendy).
- Sandbox obejmuje **tylko komendy shella**; `Read`/`Edit`/`WebFetch` i hooki
  działają poza nim — stąd osobne deny rules.
- Reguły muszą być zapisane jako poprawny glob `Tool(specifier)`; deny
  wygrywa przed allow.
- Hook powinien **fail-open** przy nieparsowalnym wejściu (deny + sandbox nie
  zależą od parsera), inaczej zepsuty parser zablokuje każdą komendę.

## Jak zapobiegać w przyszłości

- Każdy nowy projekt z agentem: skopiuj `.claude/settings.json` +
  `.claude/hooks/` i dopisz `.claude/`, `.mcp.json` do CODEOWNERS.
- Sekrety trzymaj w Keychain (`scripts/secrets.sh`), a `.env` traktuj jako
  plik tymczasowy — nigdy nie commituj i blokuj odczyt agentowi.
- Zmiany konfiguracji agenta (deny/hooks/sandbox/MCP) wymagają przeglądu
  człowieka — inaczej agent sam sobie poszerzy uprawnienia.

## Odnośniki

- Docs: `https://docs.claude.com/en/docs/claude-code/sandboxing`,
  `.../permissions`, `.../settings-reference`, `.../hooks`
- Run: `.ai/runs/2026-11-22-audyt-bezpieczenstwa-agenta.md`
- Spec: `.ai/specs/implemented/2026-11-22-hardening-agenta.md`
- Raport: `security-notes.md`
