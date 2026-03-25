#!/bin/sh
# Elements CLI Installer — macOS & Linux
# Usage: curl -fsSL https://NVIDIA.github.io/elements/install.sh | bash
set -eu

BASE_URL="https://NVIDIA.github.io/elements/cli"
INSTALL_DIR="$HOME/.local/bin"
BIN_NAME="nve"

# --- Colors ---
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  RESET='\033[0m'
else
  RED='' GREEN='' YELLOW='' CYAN='' BOLD='' RESET=''
fi

info()  { printf "${CYAN}%s${RESET}\n" "$*"; }
warn()  { printf "${YELLOW}%s${RESET}\n" "$*"; }
error() { printf "${RED}error: %s${RESET}\n" "$*" >&2; exit 1; }
ok()    { printf "${GREEN}%s${RESET}\n" "$*"; }

# --- OS / Arch detection ---
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin)
    case "$ARCH" in
      arm64)  BINARY="nve-macos-arm64" ;;
      x86_64) BINARY="nve-macos-x64" ;;
      *)      error "Unsupported macOS architecture: $ARCH. Supported: arm64, x86_64." ;;
    esac
    ;;
  Linux)
    case "$ARCH" in
      x86_64)  BINARY="nve-linux-x64" ;;
      aarch64) BINARY="nve-linux-arm64" ;;
      *)       error "Unsupported Linux architecture: $ARCH. Supported: x86_64, aarch64." ;;
    esac
    ;;
  *)
    error "Unsupported operating system: $OS. Use install.cmd for Windows."
    ;;
esac

DOWNLOAD_URL="$BASE_URL/$BINARY"

# --- Download helper ---
download() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$1"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- "$1"
  else
    error "Neither curl nor wget found. Please install one and try again."
  fi
}

# --- Install ---
info "Installing Elements CLI ($BINARY)..."

mkdir -p "$INSTALL_DIR"

info "Downloading $DOWNLOAD_URL"
download "$DOWNLOAD_URL" > "$INSTALL_DIR/$BIN_NAME"
chmod +x "$INSTALL_DIR/$BIN_NAME"

# macOS requires ad-hoc code signature for binaries to execute
if [ "$OS" = "Darwin" ] && command -v codesign >/dev/null 2>&1; then
  codesign --sign - --force "$INSTALL_DIR/$BIN_NAME" 2>/dev/null || warn "Ad-hoc code signing failed — binary may not run."
fi

ok "Binary installed to $INSTALL_DIR/$BIN_NAME"

# --- PATH setup ---
add_to_path() {
  EXPORT_LINE="export PATH=\"$INSTALL_DIR:\$PATH\""

  case "$1" in
    */fish/config.fish)
      EXPORT_LINE="fish_add_path $INSTALL_DIR"
      ;;
  esac

  if [ -f "$1" ] && grep -qF "$INSTALL_DIR" "$1" 2>/dev/null; then
    return 0
  fi

  printf '\n# Elements CLI\n%s\n' "$EXPORT_LINE" >> "$1"
  info "Added $INSTALL_DIR to PATH in $1"
}

IN_PATH=0
case ":${PATH}:" in
  *":$INSTALL_DIR:"*) IN_PATH=1 ;;
esac

if [ "$IN_PATH" -eq 0 ]; then
  SHELL_NAME="$(basename "$SHELL" 2>/dev/null || echo "sh")"
  case "$SHELL_NAME" in
    bash)
      if [ -f "$HOME/.bashrc" ]; then
        add_to_path "$HOME/.bashrc"
      elif [ -f "$HOME/.bash_profile" ]; then
        add_to_path "$HOME/.bash_profile"
      else
        add_to_path "$HOME/.bashrc"
      fi
      ;;
    zsh)
      add_to_path "$HOME/.zshrc"
      ;;
    fish)
      mkdir -p "$HOME/.config/fish"
      add_to_path "$HOME/.config/fish/config.fish"
      ;;
    *)
      warn "Could not detect shell. Add $INSTALL_DIR to your PATH manually."
      ;;
  esac
  export PATH="$INSTALL_DIR:$PATH"
fi

# --- npm registry check ---
REGISTRY_URL="https://registry.npmjs.org"

if command -v npm >/dev/null 2>&1; then
  CURRENT_REGISTRY="$(npm config get registry 2>/dev/null || echo "")"
  if [ "$CURRENT_REGISTRY" != "$REGISTRY_URL" ]; then
    info "Configuring npm registry for NVIDIA Artifactory..."
    npm config set registry "$REGISTRY_URL"
    ok "npm registry set to $REGISTRY_URL"
    warn "Run 'npm login --auth-type=legacy' to authenticate if you haven't already."
  fi
else
  warn "npm not found. After installing Node.js, run:"
  warn "  npm config set registry $REGISTRY_URL"
  warn "  npm login --auth-type=legacy"
fi

# --- Verify ---
printf "\n${GREEN}${BOLD}Elements CLI installed successfully!${RESET}\n"

printf "\n  Run ${CYAN}nve${RESET} to get started.\n"

if [ "$IN_PATH" -eq 0 ]; then
  SHELL_RC=".bashrc"
  case "$(basename "$SHELL" 2>/dev/null)" in
    zsh)  SHELL_RC=".zshrc" ;;
    fish) SHELL_RC=".config/fish/config.fish" ;;
  esac
  printf "  Restart your shell or run ${CYAN}source ~/%s${RESET} to update PATH.\n" "$SHELL_RC"
fi
printf "\n"
