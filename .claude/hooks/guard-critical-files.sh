#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit early if no file path
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Resolve to a path relative to the project directory for consistent matching
REL_PATH="${FILE_PATH#"$CLAUDE_PROJECT_DIR"/}"

# Protected slow-layer infrastructure files
PROTECTED_FILES=(
  "pnpm-workspace.yaml"
  "commitlint.config.js"
  "release.config.cjs"
  "package.json"
  "pnpm-lock.yaml"
  ".nvmrc"
  ".husky"
  "config"
)

# Check if the file is a root-level protected file
BASENAME=$(basename "$REL_PATH")
DIRNAME=$(dirname "$REL_PATH")

for PROTECTED in "${PROTECTED_FILES[@]}"; do
  # Only protect root-level files (dirname is . or matches project dir)
  if [[ "$BASENAME" == "$PROTECTED" && ("$DIRNAME" == "." || "$FILE_PATH" == "$CLAUDE_PROJECT_DIR/$PROTECTED") ]]; then
    echo "BLOCKED: '$PROTECTED' is a critical infrastructure file (slow-layer)." >&2
    echo "These files affect the entire monorepo and should only be modified when the user explicitly requests it." >&2
    echo "If the user has asked for this change, re-run the command to confirm." >&2
    exit 2
  fi
done

exit 0
