import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { colors } from './utils.js';

const CONFIG_DIR = join(homedir(), '.nve');
const CONFIG_FILE = join(CONFIG_DIR, 'update-check.json');
const MANIFEST_URL = 'https://NVIDIA.github.io/elements/cli/manifest.json';

interface UpdateCheckConfig {
  lastCheck: number;
  latestSha: string;
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

export function clearConfig(): void {
  saveConfig({ lastCheck: 0, latestSha: '' });
}

export async function fetchLatestSha(): Promise<string> {
  try {
    const res = await fetch(MANIFEST_URL, {
      signal: AbortSignal.timeout(2000)
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return ((await res.json()) as { sha: string }).sha;
  } catch {
    throw new Error('Failed to fetch latest build info');
  }
}

export function isUpdateAvailable(currentSha: string, latestSha: string): boolean {
  return latestSha !== '' && currentSha !== latestSha;
}

export function shouldCheckForUpdates(config: UpdateCheckConfig | null): boolean {
  return !config || Date.now() - config.lastCheck >= 24 * 60 * 60 * 1000; // 24 hours
}

export async function checkForUpdates(currentSha: string): Promise<boolean> {
  if (process.env.CI) {
    return false;
  }

  const config = readConfig();

  if (shouldCheckForUpdates(config)) {
    fetchLatestSha()
      .then(latestSha => saveConfig({ lastCheck: Date.now(), latestSha }))
      .catch(() => {});
  }

  return config ? isUpdateAvailable(currentSha, config.latestSha) : false;
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
  clearConfig();
  process.exit(0);
}

function showUpdateNotification(): void {
  const border = '─'.repeat(50);
  console.log(
    [
      '',
      colors.warning(border),
      colors.warning('  Update available! Run ') + colors.info(`nve --upgrade`) + colors.warning(' to update.'),
      colors.warning(border),
      ''
    ].join('\n')
  );
}

/**
 * Shows update notification if a newer build is available.
 * Call after command execution with the promise from checkForUpdates().
 */
export async function notifyIfUpdateAvailable(checkPromise: Promise<boolean>): Promise<void> {
  if (process.env.CI || !process.stdout.isTTY) {
    return;
  }

  try {
    const updateAvailable = await checkPromise;
    if (updateAvailable) {
      showUpdateNotification();
    }
  } catch {
    // ignore errors - update check should never break CLI
  }
}
