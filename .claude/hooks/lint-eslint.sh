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

# Run ESLint from the project directory
OUTPUT=$(cd "$PROJECT_DIR" && pnpm exec eslint -c ./eslint.config.js --no-warn-ignored --color --cache --cache-location .eslintcache/ "$REL_PATH" 2>&1) || EXIT_CODE=$?

if [[ ${EXIT_CODE:-0} -ne 0 && -n "$OUTPUT" ]]; then
  echo "$OUTPUT" >&2
  exit 2
fi

exit 0
