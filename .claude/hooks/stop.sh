#!/usr/bin/env bash
set -euo pipefail
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(git rev-parse --show-toplevel)" 2>/dev/null || exit 0

CHANGED=$(git diff --name-only HEAD 2>/dev/null || true)
if [[ -z "$CHANGED" ]]; then
  echo "No changed files. Skipping tests."
  exit 0
fi

PROJECTS=(code cli core forms lint markdown media monaco)
FAILED=()

for proj in "${PROJECTS[@]}"; do
  if ! echo "$CHANGED" | grep -q "^projects/$proj/"; then
    continue
  fi

  TASKS=(build test)
  for task in "${TASKS[@]}"; do
    if ! node -e "process.exit(JSON.parse(require('fs').readFileSync('projects/$proj/package.json','utf8')).scripts?.['$task'] ? 0 : 1)" 2>/dev/null; then
      continue
    fi

    OUTPUT=$(cd "projects/$proj" && pnpm run "$task" 2>&1) || {
      echo "$OUTPUT" >&2
      FAILED+=("projects/$proj:$task")
    }
  done
done

if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo "Tests failed in: ${FAILED[*]}" >&2
  exit 2
else
  echo "All checks passed."
fi
