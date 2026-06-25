#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
HOOK_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$HOOK_DIR/lib/project-root.sh"
PROJECT_ROOT=$(resolve_project_root "$INPUT" "$HOOK_DIR") || exit 0
FILE_PATHS=$(hook_file_paths_from_input "$INPUT")

# Exit early if no file path
if [[ -z "$FILE_PATHS" ]]; then
  exit 0
fi

# Protected slow-layer infrastructure files
PROTECTED_FILES=(
  "pnpm-workspace.yaml"
  "commitlint.config.js"
  "release.config.cjs"
  "package.json"
  "pnpm-lock.yaml"
  ".nvmrc"
  "mise.toml"
  "mise.lock"
  ".husky"
  "config"
)

while IFS= read -r FILE_PATH; do
  if [[ -z "$FILE_PATH" ]]; then
    continue
  fi

  FILE_PATH=$(resolve_hook_path "$PROJECT_ROOT" "$FILE_PATH")

  # Resolve to a path relative to the project directory for consistent matching
  REL_PATH=$(hook_relative_path "$PROJECT_ROOT" "$FILE_PATH")

  # Check if the file is a root-level protected file
  BASENAME=$(basename "$REL_PATH")
  DIRNAME=$(dirname "$REL_PATH")

  for PROTECTED in "${PROTECTED_FILES[@]}"; do
    # Only protect root-level files (dirname is . or matches project dir)
    if [[ "$BASENAME" == "$PROTECTED" && ("$DIRNAME" == "." || "$FILE_PATH" == "$PROJECT_ROOT/$PROTECTED") ]]; then
      echo "BLOCKED: '$PROTECTED' is a critical infrastructure file (slow-layer)." >&2
      echo "These files affect the entire monorepo and should only be modified when the user explicitly requests it." >&2
      echo "If the user has asked for this change, re-run the command to confirm." >&2
      exit 2
    fi

    if [[ -d "$PROJECT_ROOT/$PROTECTED" && "$REL_PATH" == "$PROTECTED"/* ]]; then
      echo "BLOCKED: '$PROTECTED' is a critical infrastructure file (slow-layer)." >&2
      echo "These files affect the entire monorepo and should only be modified when the user explicitly requests it." >&2
      echo "If the user has asked for this change, re-run the command to confirm." >&2
      exit 2
    fi
  done
done <<<"$FILE_PATHS"

exit 0
