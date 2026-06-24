#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
HOOK_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$HOOK_DIR/lib/project-root.sh"
COMMAND=$(hook_command_from_input "$INPUT" || true)
GIT_PREFIX='(^|[;&|][[:space:]]*)git([[:space:]]+(-C[[:space:]]+[^[:space:];&|]+|--no-pager|-c[[:space:]]+[^[:space:];&|]+|--work-tree(=|[[:space:]]+)[^[:space:];&|]+))*[[:space:]]+'

if [[ -z "${NVE_AGENT:-}" && -n "${CURSOR_AGENT+x}" && -z "${CURSOR_SANDBOX+x}" ]]; then
  export NVE_AGENT="cursor-cloud-agent"
fi

# Exit early if not a git command
if [[ -z "$COMMAND" ]] || ! echo "$COMMAND" | grep -qE '(^|[;&|][[:space:]]*)git([[:space:]]|$)'; then
  exit 0
fi

warn() {
  echo "WARNING: Destructive git operation detected." >&2
  echo "  Command: $COMMAND" >&2
  echo "  Reason: $1." >&2
  echo "" >&2
  echo "Per AGENTS.md policy, destructive git operations require explicit user confirmation on user machines." >&2
  echo "In isolated VM environments, this hook is warning instead of blocking." >&2
  exit 0
}

block() {
  echo "BLOCKED: Destructive git operation detected." >&2
  echo "  Command: $COMMAND" >&2
  echo "  Reason: $1." >&2
  echo "" >&2
  echo "Per AGENTS.md policy, destructive git operations require explicit user confirmation." >&2
  echo "If the user has explicitly requested this operation, ask them to run it manually." >&2
  exit 2
}

handle_blocked_operation() {
  if [[ "${NVE_AGENT:-}" == *cloud* ]]; then
    warn "$1"
  fi

  block "$1"
}

echo "$COMMAND" | grep -qF "reset --hard"   && handle_blocked_operation "git reset --hard discards all uncommitted changes irreversibly"
echo "$COMMAND" | grep -qF "push --force"    && handle_blocked_operation "git push --force can overwrite remote history and destroy teammates' work"
echo "$COMMAND" | grep -qF "push -f"         && handle_blocked_operation "git push -f can overwrite remote history and destroy teammates' work"
echo "$COMMAND" | grep -qF "clean -f"        && handle_blocked_operation "git clean -f permanently deletes untracked files"
echo "$COMMAND" | grep -qF "checkout -- ."   && handle_blocked_operation "git checkout -- . discards all unstaged changes irreversibly"
echo "$COMMAND" | grep -qF "branch -D"       && handle_blocked_operation "git branch -D force-deletes a branch without merge checks"

echo "$COMMAND" | grep -qE "${GIT_PREFIX}(add|stage)([[:space:]]|$)" && handle_blocked_operation "git add/stage modifies the index"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}restore([[:space:]][^;&|]*)?[[:space:]]--staged([[:space:]]|$)" && handle_blocked_operation "git restore --staged removes files from the index"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}reset([[:space:]]|$)" && handle_blocked_operation "git reset modifies the index or moves HEAD"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}rm([[:space:]][^;&|]*)?[[:space:]]--cached([[:space:]]|$)" && handle_blocked_operation "git rm --cached removes files from the index"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}rm([[:space:]]|$)" && handle_blocked_operation "git rm stages file removals"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}mv([[:space:]]|$)" && handle_blocked_operation "git mv stages file renames"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}update-index([[:space:]]|$)" && handle_blocked_operation "git update-index modifies the index"

exit 0
