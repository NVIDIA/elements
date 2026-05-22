#!/usr/bin/env bash
set -euo pipefail
INPUT=$(cat)
HOOK_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$HOOK_DIR/lib/project-root.sh"
source "$HOOK_DIR/lib/node-env.sh"
PROJECT_ROOT=$(resolve_project_root "$INPUT" "$HOOK_DIR") || {
  echo "Could not resolve project root." >&2
  exit 1
}
IS_CODEX_STOP=$(jq -r 'if (.hook_event_name == "Stop" and (has("turn_id") or has("stop_hook_active") or has("last_assistant_message"))) then "1" else "0" end' <<<"$INPUT" 2>/dev/null || echo "0")

emit_success() {
  if [[ "$IS_CODEX_STOP" != "1" ]]; then
    echo "$1"
  fi
}

cd "$PROJECT_ROOT"

CHANGED=$(git diff --name-only HEAD 2>/dev/null || true)
if [[ -z "$CHANGED" ]]; then
  emit_success "No changed files. Skipping tests."
  exit 0
fi

setup_hook_node_env "$PROJECT_ROOT"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found after loading the project Node environment." >&2
  exit 2
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
  emit_success "All checks passed."
fi
