#!/usr/bin/env bash

resolve_hook_mise_bin() {
  if [[ -n "${MISE_BIN:-}" && -x "$MISE_BIN" ]]; then
    printf '%s\n' "$MISE_BIN"
    return 0
  fi

  if command -v mise >/dev/null 2>&1; then
    command -v mise
    return 0
  fi

  if [[ -x "$HOME/.local/bin/mise" ]]; then
    printf '%s\n' "$HOME/.local/bin/mise"
    return 0
  fi

  return 1
}

setup_hook_mise_env() {
  MISE_BIN=$(resolve_hook_mise_bin) || {
    echo "mise not found. Install mise, then run 'mise trust' at the project root." >&2
    return 1
  }

  export MISE_BIN
  export PATH="$(dirname -- "$MISE_BIN"):$PATH"
}

setup_hook_node_env() {
  local project_root

  project_root="$1"
  setup_hook_mise_env || return 1

  (
    cd "$project_root"
    "$MISE_BIN" exec -- node --version >/dev/null
    "$MISE_BIN" exec -- pnpm --version >/dev/null
  ) || {
    echo "mise project tools are unavailable. Run 'mise trust' and 'mise install' at the project root." >&2
    return 1
  }
}

hook_mise_exec() {
  local working_dir="$1"
  shift

  (
    cd "$working_dir"
    "$MISE_BIN" exec -- "$@"
  )
}

hook_mise_run() {
  local working_dir="$1"
  shift

  (
    cd "$working_dir"
    "$MISE_BIN" run "$@"
  )
}
