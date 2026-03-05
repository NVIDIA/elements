#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit early if no file path
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Only lint .css files
case "$FILE_PATH" in
  *.css) ;;
  *) exit 0 ;;
esac

# Skip directories that should not be linted
case "$FILE_PATH" in
  */dist/*|*/node_modules/*|*/vendor/*) exit 0 ;;
esac

# Resolve the repo root (location of stylelint.config.mjs)
REPO_ROOT="$CLAUDE_PROJECT_DIR"

# Walk up from the file to find the nearest package.json with a lint:style wireit task
DIR=$(dirname "$FILE_PATH")
PROJECT_DIR=""
while [[ "$DIR" != "/" && "$DIR" != "." ]]; do
  if [[ -f "$DIR/package.json" ]] && jq -e '.wireit["lint:style"]' "$DIR/package.json" >/dev/null 2>&1; then
    PROJECT_DIR="$DIR"
    break
  fi
  DIR=$(dirname "$DIR")
done

# Exit if no matching project found (file is in a project without stylelint)
if [[ -z "$PROJECT_DIR" ]]; then
  exit 0
fi

# Compute the file path relative to the project directory
REL_PATH=$(realpath --relative-to="$PROJECT_DIR" "$FILE_PATH" 2>/dev/null) || REL_PATH="${FILE_PATH#"$PROJECT_DIR"/}"

# Run Stylelint from the project directory
OUTPUT=$(cd "$PROJECT_DIR" && pnpm exec stylelint --config="$REPO_ROOT/stylelint.config.mjs" --color "$REL_PATH" 2>&1) || EXIT_CODE=$?

if [[ ${EXIT_CODE:-0} -ne 0 && -n "$OUTPUT" ]]; then
  echo "$OUTPUT" >&2
  exit 2
fi

exit 0
