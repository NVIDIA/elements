#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit early if no file path
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Only lint .md and .ts files
case "$FILE_PATH" in
  *.md|*.ts) ;;
  *) exit 0 ;;
esac

# Skip test files and excluded paths (matches vale --glob exclusions)
case "$FILE_PATH" in
  *.test.*|*/starters/*|*/404/*|*/vendor/*|*/changelog/*|*/icons/*|*/generated/*|*/dist/*|*/LICENSE*|*/CHANGELOG*) exit 0 ;;
esac

# Skip Claude plan and memory files
case "$FILE_PATH" in
  */.claude/plans/*|*/.claude/projects/*) exit 0 ;;
esac

# Run Vale on the specific file
OUTPUT=$(cd "$CLAUDE_PROJECT_DIR" && config/vale/bin/vale --config .vale.ini "$FILE_PATH" 2>&1) || EXIT_CODE=$?

if [[ ${EXIT_CODE:-0} -ne 0 && -n "$OUTPUT" ]]; then
  echo "$OUTPUT" >&2
  exit 2
fi

exit 0
