#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Exit early if not a git command
if [[ -z "$COMMAND" ]] || ! echo "$COMMAND" | grep -qE '^\s*git\s'; then
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

exit 0
