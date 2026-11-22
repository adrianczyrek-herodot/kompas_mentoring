#!/usr/bin/env bash
# PreToolUse hook for the Bash tool.
#
# Blocks destructive, irreversible or secret-exfiltrating commands *before*
# Claude Code runs them. This is the second line of defence: the first is the
# `permissions.deny` list and the OS-level `sandbox` in .claude/settings.json.
#
# Contract (Claude Code hooks): JSON input on stdin, decision on stdout.
#   deny  -> {"hookSpecificOutput":{"hookEventName":"PreToolUse",
#                                  "permissionDecision":"deny",
#                                  "permissionDecisionReason":"..."}}
#   allow -> no output, exit 0 (the normal permission flow continues).
#
# If the input cannot be parsed the hook fails open (exit 0), by design: the
# deny rules and the sandbox do not depend on this script, and a broken parser
# must not brick every Bash call. See security-notes.md.
#
# Manual test:
#   echo '{"tool_name":"Bash","tool_input":{"command":"git push --force"}}' \
#     | .claude/hooks/block-dangerous-commands.sh
set -u

payload="$(cat)"

extract_command() {
  if command -v jq >/dev/null 2>&1; then
    jq -er '.tool_input.command // empty' >/dev/null 2>&1 <<<"$payload" &&
      jq -r '.tool_input.command // empty' <<<"$payload" && return 0
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 -c 'import json,sys
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(1)
cmd = (data.get("tool_input") or {}).get("command", "") or ""
sys.stdout.write(cmd)' <<<"$payload" && return 0
  fi
  # Last resort: match against the raw JSON payload.
  printf '%s' "$payload"
}

command_text="$(extract_command)"
[ -n "$command_text" ] || exit 0

# Extended regular expressions, one per dangerous behaviour. They are written to
# match real dangerous invocations without catching ordinary development work.
patterns=(
  # --- filesystem destruction ---------------------------------------------
  ':[[:space:]]*\([[:space:]]*\)[[:space:]]*\{[^}]*\|[^}]*&[^}]*\}'                        # fork bomb :(){ :|:& };:
  'rm[[:space:]]+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*[[:space:]]+(/|~|\$HOME|\.\.)([[:space:]]|$|/)'
  'rm[[:space:]]+-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*[[:space:]]+(/|~|\$HOME|\.\.)([[:space:]]|$|/)'
  'rm[[:space:]]+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*[[:space:]]+\.git([[:space:]]|$|/)'
  'rm[[:space:]]+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*[[:space:]]+--no-preserve-root'
  'mkfs([[:space:]]|\.)|dd[[:space:]]+if=|diskutil[[:space:]]+erase|(^|[;&|[:space:]])shutdown([[:space:]]|$)|(^|[;&|[:space:]])reboot([[:space:]]|$)'
  'chmod[[:space:]]+(-R[[:space:]]+)?777'

  # --- irreversible git / forge operations --------------------------------
  'git[[:space:]]+push([[:space:]]+[^|;&]*)?[[:space:]]+(--force([[:space:]]|$)|-f([[:space:]]|$))'
  'git[[:space:]]+reset[[:space:]]+--hard'
  'git[[:space:]]+clean[[:space:]]+-[a-zA-Z]*f'
  'git[[:space:]]+branch[[:space:]]+-D[[:space:]]+(main|master)([[:space:]]|$)'
  'gh[[:space:]]+pr[[:space:]]+merge|gh[[:space:]]+repo[[:space:]]+delete|gh[[:space:]]+release[[:space:]]+delete|gh[[:space:]]+api[[:space:]][^|;&]*-X[[:space:]]*DELETE'

  # --- privilege escalation ------------------------------------------------
  '(^|[;&|[:space:]])sudo[[:space:]]'

  # --- remote code execution / unknown payloads ----------------------------
  '(curl|wget)[^|;&]*\|[[:space:]]*(ba|z|k)?sh'
  '(curl|wget)[^|;&]*\|[[:space:]]*sudo'
  '(base64[[:space:]]+(-d|--decode))[^|;&]*\|[[:space:]]*(ba|z|k)?sh'

  # --- raw network egress / reverse shells ---------------------------------
  '(^|[;&|[:space:]])(nc|ncat|telnet)[[:space:]]|/dev/tcp/'

  # --- secret access from the shell ----------------------------------------
  '(cat|head|tail|less|more|xxd|base64|grep|strings|awk|sed|cp)[^|;&]*[[:space:]](~/\.ssh|~/\.aws|~/\.gnupg|~/\.npmrc|~/\.netrc|~/\.claude\.json|~/\.claude/|\.ssh/id_|\.aws/credentials|\.gnupg/)'
  'security[[:space:]]+(dump-keychain|find-generic-password|find-internet-password|export)'

  # --- secret exfiltration -------------------------------------------------
  '(curl|wget|nc|ncat)[^|;&]*(--data|-d[[:space:]]|-F[[:space:]]|-T[[:space:]]|--upload-file|--data-binary)[^|;&]*(\.ssh|\.aws|\.env|id_rsa|credentials)'
  '(curl|wget|nc|ncat)[^|;&]*\$[[:space:]]*\((cat|env)[^)]*(\.env|environ)'
)

for pattern in "${patterns[@]}"; do
  if printf '%s' "$command_text" | grep -Eiq -- "$pattern"; then
    cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Blocked by .claude/hooks/block-dangerous-commands.sh: the command is destructive, irreversible, or attempts to read or exfiltrate secrets. Run it manually outside the agent, or narrow it to a safe form."}}
JSON
    exit 0
  fi
done

exit 0
