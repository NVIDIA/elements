#!/usr/bin/env bash
set -euo pipefail

# WorktreeCreate hook — receives JSON on stdin with a "name" field.
# Must print only the absolute worktree path to stdout.

# Read all of stdin first so jq doesn't block waiting for EOF
INPUT=$(cat)
NAME=$(printf '%s' "$INPUT" | jq -r '.name')
NAME="${NAME#topic-}"
NAME="${NAME#topic/}"

DIR_NAME="topic-${NAME}"
BRANCH_NAME="topic/${NAME}"

# Resolve the parent directory by finding the worktree whose directory is named "main".
# This ensures new worktrees are always siblings of the main worktree.
MAIN_WORKTREE_PATH=$(git worktree list --porcelain | grep '^worktree ' | sed 's/^worktree //' | grep '/main$' | head -1)
if [[ -z "$MAIN_WORKTREE_PATH" ]]; then
  echo "Error: could not find a worktree directory named 'main'" >&2
  exit 1
fi
PARENT_DIR=$(dirname "$MAIN_WORKTREE_PATH")
WORKTREE_PATH="${PARENT_DIR}/${DIR_NAME}"

if [[ -d "$WORKTREE_PATH" ]]; then
  echo "Error: directory already exists: ${WORKTREE_PATH}" >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}"; then
  echo "Error: branch already exists: ${BRANCH_NAME}" >&2
  exit 1
fi

git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" origin/main >&2

# Install dependencies in the new worktree (setup-env.sh uses CLAUDE_PROJECT_DIR
# which points to the main worktree, so we must install here)
(cd "$WORKTREE_PATH") >&2

# Update VS Code workspace file if one exists in the parent directory
WORKSPACE_FILE=$(find "$PARENT_DIR" -maxdepth 1 -name "*.code-workspace" -type f | head -1)
if [[ -n "$WORKSPACE_FILE" ]]; then
  node -e "
    const fs = require('fs');
    const path = '${WORKSPACE_FILE}';
    const ws = JSON.parse(fs.readFileSync(path, 'utf8'));
    const dirName = '${DIR_NAME}';
    const exists = ws.folders.some(f => f.path === dirName || f.name === dirName);
    if (!exists) {
      ws.folders.push({ path: dirName });
      fs.writeFileSync(path, JSON.stringify(ws, null, 2) + '\n');
    }
  " >&2
fi

# Print the worktree path to stdout (required by the hook contract)
echo "$WORKTREE_PATH"
