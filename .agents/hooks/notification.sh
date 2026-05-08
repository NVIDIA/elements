#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" == "Darwin" ]] && command -v osascript >/dev/null 2>&1; then
  osascript -e 'display notification "Agent needs your attention" with title "Agent"'
fi
