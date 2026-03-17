import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { homedir } from 'node:os';
import * as semver from 'semver';
import { colors } from './utils.js';

const CONFIG_DIR = join(homedir(), '.nve');
const CONFIG_FILE = join(CONFIG_DIR, 'update-check.json');

interface UpdateCheckConfig {
  lastCheck: number;
  latestVersion: string;
}

export function readConfig(): UpdateCheckConfig | null {
  try {
    if (existsSync(CONFIG_FILE)) {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as UpdateCheckConfig;
    }
  } catch {
    // ignore read errors
  }
  return null;
}

export function saveConfig(config: UpdateCheckConfig): void {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch {
    // ignore write errors
  }
}

export async function fetchLatestVersion(): Promise<string> {
  try {
    const res = await fetch(`https://esm.nvidia.com/@nvidia-elements/cli@latest/package.json`, {
      signal: AbortSignal.timeout(2000)
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return ((await res.json()) as { version: string }).version;
  } catch {
    throw new Error('Failed to fetch latest version');
  }
}

export function isUpdateAvailable(currentVersion: string, latestVersion: string): boolean {
  try {
    return semver.gt(latestVersion, currentVersion);
  } catch {
    return false;
  }
}

export function shouldCheckForUpdates(config: UpdateCheckConfig | null): boolean {
  return !config || Date.now() - config.lastCheck >= 24 * 60 * 60 * 1000; // 24 hours
}

export async function checkForUpdates(currentVersion: string): Promise<string | null> {
  if (process.env.CI) {
    return null;
  }

  const config = readConfig();

  // Refresh cache in background if stale (fire and forget)
  if (shouldCheckForUpdates(config)) {
    fetchLatestVersion()
      .then(latestVersion => saveConfig({ lastCheck: Date.now(), latestVersion }))
      .catch(() => {});
  }

  // Return cached version if update available
  return config && isUpdateAvailable(currentVersion, config.latestVersion) ? config.latestVersion : null;
}

export const updateCommands = {
  'macos/linux': 'curl -fsSL https://NVIDIA.github.io/elements/install.sh | bash',
  'windows-cmd':
    'curl -fsSL https://NVIDIA.github.io/elements/install.cmd -o install.cmd && install.cmd && del install.cmd',
  nodejs: 'npm install -g @nvidia-elements/cli'
};

export function upgrade(): void {
  const command = process.platform === 'win32' ? updateCommands['windows-cmd'] : updateCommands['macos/linux'];
  console.log(colors.info('Upgrading nve CLI...'));
  execSync(command, { stdio: 'inherit' });
  process.exit(0);
}

async function showUpdateNotification(currentVersion: string, latestVersion: string): Promise<void> {
  const border = '─'.repeat(50);
  console.log(
    [
      '',
      colors.warning(border),
      colors.warning('  Update available: ') +
        colors.error(currentVersion) +
        colors.warning(' → ') +
        colors.complete(latestVersion),
      colors.warning('  Run ') + colors.info(`nve --upgrade`) + colors.warning(' to update'),
      colors.warning(border),
      ''
    ].join('\n')
  );
}

/**
 * Shows update notification if a newer version is available.
 * Call after command execution with the promise from checkForUpdates().
 */
export async function notifyIfUpdateAvailable(
  currentVersion: string,
  checkPromise: Promise<string | null>
): Promise<void> {
  // Skip in non-interactive environments
  if (process.env.CI || !process.stdout.isTTY) {
    return;
  }

  try {
    // Check if background fetch found an update
    const latestVersion = await checkPromise;
    if (latestVersion) {
      await showUpdateNotification(currentVersion, latestVersion);
      return;
    }

    // Fallback to cached config (for later runs within check interval)
    const config = readConfig();
    if (config && isUpdateAvailable(currentVersion, config.latestVersion)) {
      await showUpdateNotification(currentVersion, config.latestVersion);
    }
  } catch {
    // ignore errors - update check should never break CLI
  }
}
