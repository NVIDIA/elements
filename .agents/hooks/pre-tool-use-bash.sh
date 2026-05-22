#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
HOOK_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$HOOK_DIR/lib/project-root.sh"
COMMAND=$(hook_command_from_input "$INPUT" || true)
GIT_PREFIX='(^|[;&|][[:space:]]*)git([[:space:]]+(-C[[:space:]]+[^[:space:];&|]+|--no-pager|-c[[:space:]]+[^[:space:];&|]+|--work-tree(=|[[:space:]]+)[^[:space:];&|]+))*[[:space:]]+'

# Exit early if not a git command
if [[ -z "$COMMAND" ]] || ! echo "$COMMAND" | grep -qE '(^|[;&|][[:space:]]*)git([[:space:]]|$)'; then
  exit 0
fi

block() {
  echo "BLOCKED: Destructive git operation detected." >&2
  echo "  Command: $COMMAND" >&2
  echo "  Reason: $1." >&2
  echo "" >&2
  echo "Per AGENTS.md policy, destructive git operations require explicit user confirmation." >&2
  echo "If the user has explicitly requested this operation, ask them to run it manually." >&2
  exit 2
}

echo "$COMMAND" | grep -qF "reset --hard"   && block "git reset --hard discards all uncommitted changes irreversibly"
echo "$COMMAND" | grep -qF "push --force"    && block "git push --force can overwrite remote history and destroy teammates' work"
echo "$COMMAND" | grep -qF "push -f"         && block "git push -f can overwrite remote history and destroy teammates' work"
echo "$COMMAND" | grep -qF "clean -f"        && block "git clean -f permanently deletes untracked files"
echo "$COMMAND" | grep -qF "checkout -- ."   && block "git checkout -- . discards all unstaged changes irreversibly"
echo "$COMMAND" | grep -qF "branch -D"       && block "git branch -D force-deletes a branch without merge checks"

echo "$COMMAND" | grep -qE "${GIT_PREFIX}(add|stage)([[:space:]]|$)" && block "git add/stage modifies the index"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}restore([[:space:]][^;&|]*)?[[:space:]]--staged([[:space:]]|$)" && block "git restore --staged removes files from the index"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}reset([[:space:]]|$)" && block "git reset modifies the index or moves HEAD"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}rm([[:space:]][^;&|]*)?[[:space:]]--cached([[:space:]]|$)" && block "git rm --cached removes files from the index"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}rm([[:space:]]|$)" && block "git rm stages file removals"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}mv([[:space:]]|$)" && block "git mv stages file renames"
echo "$COMMAND" | grep -qE "${GIT_PREFIX}update-index([[:space:]]|$)" && block "git update-index modifies the index"

exit 0
