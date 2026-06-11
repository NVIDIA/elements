#!/bin/sh
# Elements CLI Installer - macOS and Linux
# Usage: curl -fsSL https://NVIDIA.github.io/elements/install.sh | bash
set -eu

BASE_URL="${NVE_BASE_URL:-https://NVIDIA.github.io/elements/cli}"
TMP_FILE=""

printf '\033[36mNVIDIA Elements CLI Installer\033[0m\n'

cleanup() {
  if [ -n "${TMP_FILE:-}" ]; then
    rm -f "$TMP_FILE"
  fi
}
trap cleanup EXIT

error() {
  printf "error: %s\n" "$*" >&2
  exit 1
}

download_file() {
  url="$1"
  output="${2:-}"

  if command -v curl >/dev/null 2>&1; then
    if [ -n "$output" ]; then
      curl -fsSL -o "$output" "$url"
    else
      curl -fsSL "$url"
    fi
  elif command -v wget >/dev/null 2>&1; then
    if [ -n "$output" ]; then
      wget -qO "$output" "$url"
    else
      wget -qO- "$url"
    fi
  else
    error "Neither curl nor wget found. Install one and try again."
  fi
}

run_with_spinner() {
  message="$1"
  success_message="$2"
  shift 2

  if [ ! -t 2 ] || [ -n "${CI:-}" ]; then
    printf "%s\n" "$message"
    "$@"
    return $?
  fi

  "$@" &
  pid="$!"
  frame_index=0

  while kill -0 "$pid" 2>/dev/null; do
    case "$frame_index" in
      0) frame="|" ;;
      1) frame="/" ;;
      2) frame="-" ;;
      *) frame="\\" ;;
    esac
    printf "\r%s %s" "$frame" "$message" >&2
    frame_index=$(((frame_index + 1) % 4))
    sleep 0.1
  done

  set +e
  wait "$pid"
  status="$?"
  set -e

  if [ "$status" -eq 0 ]; then
    printf "\r\033[K%s\n" "$success_message" >&2
  else
    printf "\r\033[KFailed. %s\n" "$message" >&2
  fi

  return "$status"
}

get_manifest_field() {
  field="$1"
  compact_manifest="$(printf '%s' "$MANIFEST_JSON" | tr -d '\n\r\t ')"
  printf '%s' "$compact_manifest" | sed -n "s/.*\"$PLATFORM_KEY\"[^{]*{[^}]*\"$field\":\"\([^\"]*\)\".*/\1/p"
}

get_sha256() {
  file="$1"

  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$file" | sed 's/ .*//'
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | sed 's/ .*//'
  else
    error "Neither shasum nor sha256sum found. Install one and try again."
  fi
}

case "$(uname -s)" in
  Darwin) OS="macos" ;;
  Linux) OS="linux" ;;
  *) error "Unsupported operating system: $(uname -s). Use install.ps1 for Windows." ;;
esac

case "$(uname -m)" in
  arm64 | aarch64) ARCH="arm64" ;;
  x86_64 | amd64) ARCH="x64" ;;
  *) error "Unsupported architecture: $(uname -m)." ;;
esac

PLATFORM_KEY="$OS-$ARCH"
MANIFEST_JSON="$(download_file "$BASE_URL/manifest.json")"
BINARY="$(get_manifest_field "filename")"
CHECKSUM="$(get_manifest_field "checksum")"

if [ -z "$BINARY" ] || [ -z "$CHECKSUM" ]; then
  error "Platform $PLATFORM_KEY not found in CLI manifest."
fi

TMP_FILE="$(mktemp "${TMPDIR:-/tmp}/nve.XXXXXX")"
run_with_spinner "Downloading Elements CLI..." "Downloaded Elements CLI." download_file "$BASE_URL/$BINARY" "$TMP_FILE"

ACTUAL_CHECKSUM="$(get_sha256 "$TMP_FILE")"
if [ "$ACTUAL_CHECKSUM" != "$CHECKSUM" ]; then
  error "Checksum verification failed for $BINARY."
fi

chmod +x "$TMP_FILE"
"$TMP_FILE" install "$TMP_FILE"
