#!/usr/bin/env bash

normalize_dir() {
  local dir="$1"

  if [[ -z "$dir" || ! -d "$dir" ]]; then
    return 1
  fi

  (cd "$dir" 2>/dev/null && pwd -P)
}

looks_like_project_root() {
  local dir="$1"

  [[ -d "$dir/.git" || -f "$dir/.git" || -f "$dir/AGENTS.md" || -f "$dir/pnpm-workspace.yaml" || -d "$dir/.agents" ]]
}

candidate_from_json() {
  local input="$1"

  if [[ -z "$input" ]] || ! command -v jq >/dev/null 2>&1; then
    return 1
  fi

  jq -r '.cwd // .workspace_root // .workspaceRoot // .project_dir // .projectDir // empty' <<<"$input" 2>/dev/null
}

resolve_project_root() {
  local input="${1:-}"
  local hooks_dir="${2:-}"
  local candidate normalized json_candidate

  json_candidate=$(candidate_from_json "$input" || true)

  for candidate in \
    "${AGENTS_PROJECT_DIR:-}" \
    "${CLAUDE_PROJECT_DIR:-}" \
    "${CODEX_PROJECT_DIR:-}" \
    "${CODEX_WORKSPACE_ROOT:-}" \
    "${WORKSPACE_ROOT:-}" \
    "${PROJECT_DIR:-}" \
    "$json_candidate" \
    "${PWD:-}"; do
    normalized=$(normalize_dir "$candidate") || continue
    if looks_like_project_root "$normalized"; then
      printf '%s\n' "$normalized"
      return 0
    fi
  done

  if [[ -n "$hooks_dir" ]]; then
    normalized=$(normalize_dir "$hooks_dir/../..") || true
    if [[ -n "${normalized:-}" ]] && looks_like_project_root "$normalized"; then
      printf '%s\n' "$normalized"
      return 0
    fi
  fi

  candidate=$(git rev-parse --show-toplevel 2>/dev/null || true)
  normalized=$(normalize_dir "$candidate") || true
  if [[ -n "${normalized:-}" ]]; then
    printf '%s\n' "$normalized"
    return 0
  fi

  return 1
}

resolve_hook_path() {
  local project_root="$1"
  local path="$2"

  if [[ -z "$path" ]]; then
    return 1
  fi

  case "$path" in
    /*) printf '%s\n' "$path" ;;
    *) printf '%s/%s\n' "$project_root" "$path" ;;
  esac
}

hook_relative_path() {
  local project_root="$1"
  local path="$2"

  case "$path" in
    "$project_root"/*) printf '%s\n' "${path#"$project_root"/}" ;;
    *) printf '%s\n' "$path" ;;
  esac
}

hook_command_from_input() {
  local input="$1"

  if [[ -z "$input" ]] || ! command -v jq >/dev/null 2>&1; then
    return 1
  fi

  jq -r '.tool_input.command // .command // empty' <<<"$input" 2>/dev/null
}

hook_file_paths_from_input() {
  local input="$1"
  local command

  if [[ -n "$input" ]] && command -v jq >/dev/null 2>&1; then
    jq -r '
      [
        .tool_input.file_path?,
        .tool_input.filePath?,
        .tool_input.path?,
        .file_path?,
        .filePath?,
        .path?
      ]
      | .[]
      | select(type == "string" and length > 0)
    ' <<<"$input" 2>/dev/null || true
  fi

  command=$(hook_command_from_input "$input" || true)
  if [[ -n "$command" ]]; then
    awk '
      /^\*\*\* (Add|Update|Delete) File: / {
        sub(/^\*\*\* (Add|Update|Delete) File: /, "")
        print
      }
      /^\*\*\* Move to: / {
        sub(/^\*\*\* Move to: /, "")
        print
      }
    ' <<<"$command"
  fi
}
