#!/usr/bin/env bash

get_hook_pnpm_spec() {
  local project_root package_manager

  project_root="$1"
  package_manager=""

  if [[ -f "$project_root/package.json" ]] && command -v node >/dev/null 2>&1; then
    package_manager=$(node -e "const { readFileSync } = require('node:fs'); const { packageManager } = JSON.parse(readFileSync(process.argv[1], 'utf8')); if (typeof packageManager === 'string' && packageManager.startsWith('pnpm@')) process.stdout.write(packageManager);" "$project_root/package.json")
  fi

  printf '%s\n' "${package_manager:-pnpm@latest}"
}

setup_hook_node_env() {
  local project_root node_version nvm_dir pnpm_spec

  project_root="$1"
  nvm_dir="${NVM_DIR:-$HOME/.nvm}"

  if [[ -s "$nvm_dir/nvm.sh" ]]; then
    source "$nvm_dir/nvm.sh"

    if [[ -f "$project_root/.nvmrc" ]]; then
      node_version=$(<"$project_root/.nvmrc")
      nvm use --silent "$node_version" >/dev/null 2>&1 || true
    else
      nvm use --silent >/dev/null 2>&1 || true
    fi
  fi

  if ! command -v pnpm >/dev/null 2>&1 && command -v corepack >/dev/null 2>&1; then
    pnpm_spec=$(get_hook_pnpm_spec "$project_root")
    (
      cd "$project_root"
      corepack enable
      corepack prepare "$pnpm_spec" --activate
    )
  fi
}
