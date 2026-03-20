#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)

NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  echo "nvm not found at $NVM_DIR/nvm.sh" >&2
  exit 0
fi

source "$NVM_DIR/nvm.sh"

cd "$CLAUDE_PROJECT_DIR"

nvm install 2>&1 >/dev/null
corepack enable 2>&1 >/dev/null
corepack prepare --activate 2>&1 >/dev/null

INSTALL_OUTPUT=$(pnpm i --frozen-lockfile --prefer-offline 2>&1) || {
  echo "pnpm install failed:" >&2
  echo "$INSTALL_OUTPUT" >&2
  exit 0
}

NODE_V=$(node --version)
PNPM_V=$(pnpm --version)
echo "Environment ready: node $NODE_V, pnpm $PNPM_V. Dependencies installed."
