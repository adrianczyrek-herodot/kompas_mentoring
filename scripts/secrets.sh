#!/usr/bin/env bash
# Secret-manager bridge for Kompas.
#
# Secrets live in the OS keychain (macOS `security`), never in a committed file
# and never in a plaintext `.env` that an AI agent can read. This script is the
# only supported way to put a secret in and take it out.
#
#   scripts/secrets.sh put BETTER_AUTH_SECRET          # prompts for the value, stores it
#   scripts/secrets.sh get BETTER_AUTH_SECRET          # prints the value (careful!)
#   scripts/secrets.sh import .env [--remove]          # migrate an existing .env
#   scripts/secrets.sh export                          # prints `export KEY=value` lines
#   scripts/secrets.sh run -- pnpm db:migrate          # exports then runs a command
#   scripts/secrets.sh list                            # variable names only, no values
#   scripts/secrets.sh rm BETTER_AUTH_SECRET           # deletes from the keychain
#
# Namespace: KOMPAS_SECRETS_NAMESPACE (default: dev). Keychain service is
# `kompas.<namespace>.<VAR>`; the account is the current user.
set -euo pipefail

NAMESPACE="${KOMPAS_SECRETS_NAMESPACE:-dev}"
SERVICE_PREFIX="kompas.${NAMESPACE}"
INDEX_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/kompas-secrets"
INDEX_FILE="${INDEX_DIR}/${NAMESPACE}.keys"

die() { printf 'secrets: %s\n' "$*" >&2; exit 1; }

command -v security >/dev/null 2>&1 ||
  die "the macOS 'security' CLI is required (keychain backend)"

service_of() { printf '%s.%s' "$SERVICE_PREFIX" "$1"; }

validate_name() {
  case "$1" in
    ''|*[!A-Za-z0-9_]*) die "invalid variable name: '$1' (use [A-Za-z0-9_])" ;;
  esac
}

index_add() {
  mkdir -p "$INDEX_DIR"
  chmod 700 "$INDEX_DIR"
  touch "$INDEX_FILE"
  chmod 600 "$INDEX_FILE"
  grep -qxF "$1" "$INDEX_FILE" 2>/dev/null || printf '%s\n' "$1" >>"$INDEX_FILE"
}

index_remove() {
  [ -f "$INDEX_FILE" ] || return 0
  grep -vxF "$1" "$INDEX_FILE" >"${INDEX_FILE}.tmp" || true
  mv "${INDEX_FILE}.tmp" "$INDEX_FILE"
}

cmd_put() {
  local name="${1:-}" value
  validate_name "$name"
  if [ "${2:-}" != "" ]; then value="$2"; else
    printf 'Value for %s (input hidden): ' "$name" >&2
    IFS= read -r -s value
    printf '\n' >&2
  fi
  [ -n "$value" ] || die "refusing to store an empty value"
  security add-generic-password -a "$USER" -s "$(service_of "$name")" \
    -w "$value" -U >/dev/null
  index_add "$name"
  printf 'stored %s in keychain service %s\n' "$name" "$(service_of "$name")" >&2
}

cmd_get() {
  local name="${1:-}"
  validate_name "$name"
  security find-generic-password -a "$USER" -s "$(service_of "$name")" -w 2>/dev/null ||
    die "no secret named $name in namespace $NAMESPACE"
}

cmd_list() {
  [ -f "$INDEX_FILE" ] || { printf '(no secrets in namespace %s)\n' "$NAMESPACE" >&2; return 0; }
  sort "$INDEX_FILE"
}

cmd_rm() {
  local name="${1:-}"
  validate_name "$name"
  security delete-generic-password -a "$USER" -s "$(service_of "$name")" >/dev/null 2>&1 || true
  index_remove "$name"
  printf 'removed %s\n' "$name" >&2
}

cmd_export() {
  [ -f "$INDEX_FILE" ] || return 0
  local name value
  while IFS= read -r name; do
    [ -n "$name" ] || continue
    value="$(security find-generic-password -a "$USER" -s "$(service_of "$name")" -w 2>/dev/null || true)"
    [ -n "$value" ] || continue
    printf 'export %s=%q\n' "$name" "$value"
  done <"$INDEX_FILE"
}

cmd_run() {
  [ "${1:-}" = "--" ] || die "usage: scripts/secrets.sh run -- <command>"
  shift
  [ "$#" -gt 0 ] || die "no command given"
  local exports
  exports="$(cmd_export)"
  # shellcheck disable=SC2086
  eval "$exports"
  exec "$@"
}

cmd_import() {
  local file="${1:-}" remove="${2:-}"
  [ -f "$file" ] || die "file not found: $file"
  local line name value count=0
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      ''|'#'*) continue ;;
    esac
    name="${line%%=*}"
    value="${line#*=}"
    name="$(printf '%s' "$name" | tr -d '[:space:]')"
    case "$name" in
      ''|*[!A-Za-z0-9_]*) continue ;;
    esac
    # strip optional surrounding quotes
    value="${value%\"}"; value="${value#\"}"
    value="${value%\'}"; value="${value#\'}"
    [ -n "$value" ] || continue
    security add-generic-password -a "$USER" -s "$(service_of "$name")" \
      -w "$value" -U >/dev/null
    index_add "$name"
    count=$((count + 1))
  done <"$file"
  printf 'imported %d secret(s) from %s into namespace %s\n' "$count" "$file" "$NAMESPACE" >&2
  if [ "$remove" = "--remove" ]; then
    local backup="${file}.plaintext-backup-$(date +%Y%m%d%H%M%S)"
    mv "$file" "$backup"
    chmod 600 "$backup"
    printf 'plaintext %s moved to %s (delete it after verifying the app starts)\n' \
      "$file" "$backup" >&2
  else
    printf 'plaintext %s left in place; rerun with --remove once verified\n' "$file" >&2
  fi
}

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
}

case "${1:-}" in
  put)    shift; cmd_put "$@" ;;
  get)    shift; cmd_get "$@" ;;
  list)   cmd_list ;;
  rm)     shift; cmd_rm "$@" ;;
  export) cmd_export ;;
  run)    shift; cmd_run "$@" ;;
  import) shift; cmd_import "$@" ;;
  ''|-h|--help|help) usage ;;
  *) die "unknown command '$1' (try --help)" ;;
esac
