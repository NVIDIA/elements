#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Exit early if empty or not an npm/yarn command
if [[ -z "$COMMAND" ]]; then
  exit 0
fi

block() {
  echo "BLOCKED: Wrong package manager detected." >&2
  echo "  Command: $COMMAND" >&2
  echo "  Reason: $1." >&2
  echo "" >&2
  echo "This project uses pnpm exclusively. Replace '$2' with '$3' and try again." >&2
  exit 2
}

# Block npm and npx
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)npm(\s|$)'; then
  block "npm is not the package manager for this monorepo" "npm" "pnpm"
fi

if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)npx(\s|$)'; then
  block "Use 'pnpm dlx' instead of 'npx' in this monorepo" "npx" "pnpm dlx"
fi

# Block yarn
if echo "$COMMAND" | grep -qE '(^|\s|&&|\|\||;)yarn(\s|$)'; then
  block "yarn is not the package manager for this monorepo" "yarn" "pnpm"
fi

exit 0
