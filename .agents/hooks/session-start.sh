#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
HOOK_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$HOOK_DIR/lib/project-root.sh"
source "$HOOK_DIR/lib/node-env.sh"
PROJECT_ROOT=$(resolve_project_root "$INPUT" "$HOOK_DIR") || {
  echo "Could not resolve project root." >&2
  exit 0
}

cd "$PROJECT_ROOT"

setup_hook_mise_env || exit 0

INSTALL_OUTPUT=$(hook_mise_run "$PROJECT_ROOT" install 2>&1) || {
  echo "mise install task failed:" >&2
  echo "$INSTALL_OUTPUT" >&2
  exit 0
}

NODE_V=$(hook_mise_exec "$PROJECT_ROOT" node --version)
PNPM_V=$(hook_mise_exec "$PROJECT_ROOT" pnpm --version)
VALE_V=$(hook_mise_exec "$PROJECT_ROOT" vale --version)
VALE_V=${VALE_V%%$'\n'*}
echo "Environment ready: node $NODE_V, pnpm $PNPM_V, $VALE_V. Dependencies installed."
