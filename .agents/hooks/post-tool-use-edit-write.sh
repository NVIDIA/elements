#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
HOOK_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "$HOOK_DIR/lib/project-root.sh"
source "$HOOK_DIR/lib/node-env.sh"
PROJECT_ROOT=$(resolve_project_root "$INPUT" "$HOOK_DIR") || exit 0
FILE_PATHS=$(hook_file_paths_from_input "$INPUT")

if [[ -z "$FILE_PATHS" ]]; then
  exit 0
fi

FAILED=0

setup_hook_node_env "$PROJECT_ROOT" || exit 2

mark_failed() {
  FAILED=1
}

run_prettier() {
  local output exit_code

  output=$(hook_mise_exec "$PROJECT_ROOT" pnpm exec prettier --write --ignore-unknown --no-error-on-unmatched-pattern "$FILE_PATH" 2>&1) || exit_code=$?

  if [[ ${exit_code:-0} -ne 0 && -n "$output" ]]; then
    echo "$output" >&2
    mark_failed
  fi
}

run_eslint() {
  case "$FILE_PATH" in
    *.ts|*.js|*.css) ;;
    *) return 0 ;;
  esac

  case "$FILE_PATH" in
    */dist/*|*/node_modules/*|*/__screenshots__/*|*/generated/*) return 0 ;;
  esac

  local dir project_dir rel_path json_output hard_errors total_errors readable

  dir=$(dirname "$FILE_PATH")
  project_dir=""
  while [[ "$dir" != "/" && "$dir" != "." ]]; do
    if [[ -f "$dir/eslint.config.js" ]]; then
      project_dir="$dir"
      break
    fi
    dir=$(dirname "$dir")
  done

  if [[ -z "$project_dir" ]]; then
    return 0
  fi

  rel_path=$(hook_relative_path "$project_dir" "$FILE_PATH")

  local soft_rules="no-unused-vars|@typescript-eslint/no-unused-vars"

  json_output=$(hook_mise_exec "$project_dir" pnpm exec eslint -c ./eslint.config.js --no-warn-ignored --cache --cache-location .eslintcache/ --format json "$rel_path" 2>/dev/null) || true

  hard_errors=$(echo "$json_output" | jq -r --arg soft "$soft_rules" '
    [.[].messages[] | select(.severity == 2) | select(.ruleId | test($soft) | not)] | length
  ') 2>/dev/null || hard_errors="0"

  total_errors=$(echo "$json_output" | jq -r '
    [.[].messages[] | select(.severity == 2)] | length
  ') 2>/dev/null || total_errors="0"

  if [[ "$total_errors" == "0" ]]; then
    return 0
  fi

  readable=$(hook_mise_exec "$project_dir" pnpm exec eslint -c ./eslint.config.js --no-warn-ignored --color --cache --cache-location .eslintcache/ "$rel_path" 2>&1) || true

  if [[ "$hard_errors" != "0" ]]; then
    echo "$readable" >&2
    mark_failed
  else
    echo "$readable" >&2
  fi
}

run_vale() {
  case "$FILE_PATH" in
    *.md|*.ts) ;;
    *) return 0 ;;
  esac

  case "$FILE_PATH" in
    *.test.*|*/starters/*|*/404/*|*/vendor/*|*/changelog/*|*/icons/*|*/generated/*|*/dist/*|*/LICENSE*|*/CHANGELOG*|*/NOTICE*) return 0 ;;
  esac

  case "$FILE_PATH" in
    */.claude/plans/*|*/.claude/projects/*) return 0 ;;
  esac

  local output exit_code

  output=$(hook_mise_exec "$PROJECT_ROOT" vale --config .vale.ini "$FILE_PATH" 2>&1) || exit_code=$?

  if [[ ${exit_code:-0} -ne 0 && -n "$output" ]]; then
    echo "$output" >&2
    mark_failed
  fi
}

run_stylelint() {
  case "$FILE_PATH" in
    *.css) ;;
    *) return 0 ;;
  esac

  case "$FILE_PATH" in
    */dist/*|*/node_modules/*|*/vendor/*) return 0 ;;
  esac

  local repo_root dir project_dir rel_path output exit_code

  repo_root="$PROJECT_ROOT"
  dir=$(dirname "$FILE_PATH")
  project_dir=""
  while [[ "$dir" != "/" && "$dir" != "." ]]; do
    if [[ -f "$dir/package.json" ]] && jq -e '.wireit["lint:style"]' "$dir/package.json" >/dev/null 2>&1; then
      project_dir="$dir"
      break
    fi
    dir=$(dirname "$dir")
  done

  if [[ -z "$project_dir" ]]; then
    return 0
  fi

  rel_path=$(hook_relative_path "$project_dir" "$FILE_PATH")

  output=$(hook_mise_exec "$project_dir" pnpm exec stylelint --config="$repo_root/stylelint.config.mjs" --color "$rel_path" 2>&1) || exit_code=$?

  if [[ ${exit_code:-0} -ne 0 && -n "$output" ]]; then
    echo "$output" >&2
    mark_failed
  fi
}

while IFS= read -r FILE_PATH; do
  if [[ -z "$FILE_PATH" ]]; then
    continue
  fi

  FILE_PATH=$(resolve_hook_path "$PROJECT_ROOT" "$FILE_PATH")

  if [[ ! -e "$FILE_PATH" || -d "$FILE_PATH" ]]; then
    continue
  fi

  run_prettier
  run_eslint
  run_vale
  run_stylelint
done <<<"$FILE_PATHS"

if [[ "$FAILED" -ne 0 ]]; then
  exit 2
fi

exit 0
