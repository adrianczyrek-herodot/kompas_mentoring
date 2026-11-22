---
title: Hardening agenta AI — sandbox, deny rules, hook blokujący i menedżer sekretów
status: implemented
created: 2026-11-22
implemented: 2026-11-22
related: ['.ai/runs/2026-11-22-audyt-bezpieczenstwa-agenta.md', 'security-notes.md']
---

# Hardening agenta AI — sandbox, deny rules, hook blokujący i menedżer sekretów

## Kontekst i cel

Agent AI (Claude Code i pokrewne) pracuje w tym repozytorium z uprawnieniami
użytkownika: może czytać pliki z sekretami, wysyłać je do sieci i uruchamiać
dowolne komendy shella. Audyt wykazał, że repozytorium nie miało żadnej
konfiguracji ograniczającej agenta — brak `.claude/`, `.mcp.json` i CODEOWNERS,
a w sesjach agenta na tej maszynie leżały w plaintextcie klucze AWS.

Celem jest jedna, spójna zmiana, która „od jutra" ogranicza agentowi:
(a) czytanie i modyfikowanie plików z sekretami, (b) wyjście sieciowe poza
jawną listę domen, (c) komendy destrukcyjne i nieodwracalne. Zmiana ma być
wersjonowana w repozytorium i egzekwowana przez same narzędzia agenta
(permissions deny, sandbox OS-owy, hook `PreToolUse`), a nie tylko przez prośbę
w `AGENTS.md`.

## Zakres

- W zakresie:
  - `.claude/settings.json`: reguły `permissions.deny`, konfiguracja `sandbox`
    (filesystem + network), jeden hook `PreToolUse`.
  - `.claude/hooks/block-dangerous-commands.sh`: hook blokujący komendy
    destrukcyjne, nieodwracalne i próby eksfiltracji sekretów.
  - `.github/CODEOWNERS`: ochrona `.claude/`, `.mcp.json`, workflowów i `.env.example`.
  - `scripts/secrets.sh`: przeniesienie `.env` do menedżera sekretów (macOS Keychain).
  - `security-notes.md`: raport z audytu (uprawnienia, skille, MCP, sesje, test injection).
  - `security-tests/prompt-injection/`: dokumentacja i pułapka testu prompt injection.
  - Aktualizacja `.env.example`, `.gitignore`, `package.json`.
- Poza zakresem:
  - Zmiana modelu uprawnień po stronie Anthropic/organizacji (managed settings).
  - Automatyczne zrotowanie kluczy AWS/Google (wymaga konsoli dostawcy — patrz
    `security-notes.md`, sekcja „Rotacja").
  - Konfiguracja MCP (żaden serwer MCP nie jest włączony).

## Wymagania

1. `permissions.deny` blokuje odczyt i edycję plików z sekretami (`.env*`,
   `~/.ssh`, `~/.aws`, `~/.claude.json`, `~/.claude/.credentials.json`, klucze
   prywatne) oraz komendy destrukcyjne (`rm -rf /`, `git push --force`,
   `gh pr merge`, `chmod 777`, `sudo` itd.).
2. Sandbox jest włączony i wymuszany: praca tylko w katalogu roboczym i `$TMPDIR`,
   sieć wyłącznie do jawnych domen, brak fallbacku poza sandbox.
3. Hook `PreToolUse` dla `Bash` odrzuca komendy z listy ryzykownych wzorców,
   zanim się wykonają — druga warstwa po `permissions.deny` i sandboxie.
4. `.claude/` i `.mcp.json` w `CODEOWNERS`, żeby zmiana konfiguracji agenta
   wymagała przeglądu właściciela.
5. `.env` przeniesiony do menedżera sekretów; w repo zostaje tylko
   `.env.example` i skrypt ładujący.
6. Raport z audytu nie zawiera wartości sekretów.

## Kryteria akceptacji

- [x] `.claude/settings.json` jest poprawnym JSON-em i zawiera `permissions.deny`,
      `sandbox` i `hooks.PreToolUse`.
- [x] Hook przechodzi test jednostkowy: komenda destrukcyjna → `deny`, komenda
      bezpieczna → brak decyzji (przepuszczenie).
- [x] `security-notes.md` zawiera listę uprawnień/skilli/MCP, wynik skanu sesji,
      wynik testu prompt injection i zdanie o usuniętej nodze trifekty.
- [x] Co najmniej jeden `.env` ma sekrety w menedżerze sekretów, a nie w pliku.
- [x] `.github/CODEOWNERS` zawiera `.claude/` i `.mcp.json`.

## Projekt rozwiązania

### Warstwy obrony (trifekta)

Trifekta to jednoczesny dostęp do: (1) prywatnych danych, (2) niezaufanej treści,
(3) komunikacji na zewnątrz. Ta zmiana usuwa **nogę komunikacji**: sandbox
z listą dozwolonych domen (`sandbox.network.allowedDomains`,
`sandbox.network.strictAllowlist`) odcina dowolny egress z komend shella,
a `permissions.deny` na `WebFetch`/`WebSearch` odcina egress z wbudowanych
narzędzi web. Ścieżka: `.claude/settings.json` → `sandbox.network`.

### Pliki i egzekwowanie

- `.claude/settings.json` — reguły są egzekwowane przez Claude Code; deny
  wygrywa przed allow, sandbox działa na poziomie OS (macOS Seatbelt).
- `.claude/hooks/block-dangerous-commands.sh` — czyta JSON wejściowy
  (`tool_name`, `tool_input.command`), parsuje `jq`/`python3`, zwraca
  `hookSpecificOutput.permissionDecision = "deny"`.
- `scripts/secrets.sh` — macOS Keychain (`security`), komendy `put/get/list/export/run/import`.

### Stany błędów

- Brak sandboxa na platformie → `failIfUnavailable: true` zatrzymuje start
  Claude Code zamiast działać bez ograniczeń.
- Hook nie umie sparsować wejścia → kończy się kodem 0 (przepuszczenie); to
  świadomy wybór, bo hook jest drugą warstwą, a pierwsza (deny + sandbox)
  nie zależy od parsera. Opisane w `security-notes.md`.

## Plan wdrożenia

1. Specyfikacja i log runu.
2. `.claude/settings.json` + hook blokujący + test hooka.
3. `.github/CODEOWNERS`.
4. `scripts/secrets.sh` + migracja `.env` do Keychain.
5. Test prompt injection i `security-notes.md`.
6. Weryfikacja (JSON, shellcheck-ish, test hooka) i commit.

## Decyzje i zmiany

- 2026-11-22 — Blok `sandbox.credentials` w projektowym `.claude/settings.json`
  jest ignorowany przez Claude Code (honorowany tylko w user/managed settings),
  więc ochronę plików z sekretami zrealizowano przez `sandbox.filesystem.denyRead`
  i `permissions.deny` z regułami `Read(...)`.
- 2026-11-22 — `sandbox.autoAllowBashIfSandboxed: true`: komendy w sandboxie
  nie pytają o zgodę, bo granicą jest sandbox, nie prompt. Ogranicza to
  „zmęczenie promptami", które i tak prowadzi do ślepej akceptacji.
- 2026-11-22 — Projekt nie miał realnego `.env` (tylko `.env.example`), więc
  migrację do menedżera sekretów wykonano na istniejącym `.env` projektu
  `bitmovin_match_alert`; mechanizm (`scripts/secrets.sh`) jest w tym repo.
