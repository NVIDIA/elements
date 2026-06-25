resolve_mise_bin() {
  if [ -n "${MISE_BIN:-}" ] && [ -x "$MISE_BIN" ]; then
    printf '%s\n' "$MISE_BIN"
    return 0
  fi

  if command -v mise >/dev/null 2>&1; then
    command -v mise
    return 0
  fi

  if [ -x "$HOME/.local/bin/mise" ]; then
    printf '%s\n' "$HOME/.local/bin/mise"
    return 0
  fi

  return 1
}

run_mise() {
  MISE_BIN=$(resolve_mise_bin) || {
    echo "mise not found. Install mise, then run mise trust at the project root." >&2
    return 1
  }

  export MISE_BIN
  PATH="$(dirname "$MISE_BIN"):$PATH"
  export PATH

  "$MISE_BIN" exec -- "$@"
}
