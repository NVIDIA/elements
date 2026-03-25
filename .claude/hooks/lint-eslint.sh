#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit early if no file path
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Only lint .ts, .js, and .css files
case "$FILE_PATH" in
  *.ts|*.js|*.css) ;;
  *) exit 0 ;;
esac

# Skip directories that should not be linted
case "$FILE_PATH" in
  */dist/*|*/node_modules/*|*/__screenshots__/*|*/generated/*) exit 0 ;;
esac

# Resolve the project directory by walking up from the file looking for eslint.config.js
DIR=$(dirname "$FILE_PATH")
PROJECT_DIR=""
while [[ "$DIR" != "/" && "$DIR" != "." ]]; do
  if [[ -f "$DIR/eslint.config.js" ]]; then
    PROJECT_DIR="$DIR"
    break
  fi
  DIR=$(dirname "$DIR")
done

# Exit if no eslint config found (e.g., root-level files)
if [[ -z "$PROJECT_DIR" ]]; then
  exit 0
fi

# Compute the file path relative to the project directory
REL_PATH=$(realpath --relative-to="$PROJECT_DIR" "$FILE_PATH" 2>/dev/null) || REL_PATH="${FILE_PATH#"$PROJECT_DIR"/}"

# Rules that should warn but not block (transient during refactoring)
SOFT_RULES="no-unused-vars|@typescript-eslint/no-unused-vars"

# Run ESLint with JSON output to classify errors
JSON_OUTPUT=$(cd "$PROJECT_DIR" && pnpm exec eslint -c ./eslint.config.js --no-warn-ignored --cache --cache-location .eslintcache/ --format json "$REL_PATH" 2>/dev/null) || true

# Check if there are any hard errors (not in the soft rules list)
HARD_ERRORS=$(echo "$JSON_OUTPUT" | jq -r --arg soft "$SOFT_RULES" '
  [.[].messages[] | select(.severity == 2) | select(.ruleId | test($soft) | not)] | length
') 2>/dev/null || HARD_ERRORS="0"

TOTAL_ERRORS=$(echo "$JSON_OUTPUT" | jq -r '
  [.[].messages[] | select(.severity == 2)] | length
') 2>/dev/null || TOTAL_ERRORS="0"

# No errors at all — pass silently
if [[ "$TOTAL_ERRORS" == "0" ]]; then
  exit 0
fi

# Get human-readable output for display
READABLE=$(cd "$PROJECT_DIR" && pnpm exec eslint -c ./eslint.config.js --no-warn-ignored --color --cache --cache-location .eslintcache/ "$REL_PATH" 2>&1) || true

if [[ "$HARD_ERRORS" != "0" ]]; then
  # Hard errors present — block
  echo "$READABLE" >&2
  exit 2
else
  # Only soft errors (unused vars/imports) — warn but don't block
  echo "$READABLE" >&2
  exit 0
fi
