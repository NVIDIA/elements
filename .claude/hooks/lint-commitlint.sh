#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Exit early if not a git commit command
if [[ -z "$COMMAND" ]] || ! echo "$COMMAND" | grep -qE '^\s*git\s+commit\b'; then
  exit 0
fi

# Extract commit message header (first line) from -m flag
# Supports: -m "msg", -m 'msg', -m "$(cat <<'EOF'\n...\nEOF\n)"
MSG=""
if echo "$COMMAND" | grep -qE '\$\(cat\s+<<'; then
  # HEREDOC pattern: jq decodes JSON \n to real newlines, so the command is multi-line.
  # Extract the first non-blank content line after the <<...EOF marker line.
  MSG=$(echo "$COMMAND" | awk '
    /<<.*EOF/ { found=1; next }
    found && /^[[:space:]]*$/ { next }
    found && /^[[:space:]]*EOF[[:space:]]*$/ { exit }
    found { sub(/^[[:space:]]+/, ""); print; exit }
  ')
elif echo "$COMMAND" | grep -qE "\-m\s+'"; then
  # Single-quoted message
  MSG=$(echo "$COMMAND" | sed -n "s/.*-m[[:space:]]*'\\([^']*\\)'.*/\\1/p" | head -1)
elif echo "$COMMAND" | grep -qE '\-m\s+"'; then
  # Double-quoted message
  MSG=$(echo "$COMMAND" | sed -n 's/.*-m[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
fi

# If we couldn't extract a message, let git handle validation
if [[ -z "$MSG" ]]; then
  exit 0
fi

# Run commitlint on the extracted message
echo "$MSG" | pnpm exec commitlint 2>&1
