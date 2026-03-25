import { readNveConfig, saveNveConfig, type UpdateConfig } from '@internals/tools';
import { colors } from './utils.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

const MANIFEST_URL = `${__ELEMENTS_PAGES_BASE_URL__}/cli/manifest.json`;

export function clearUpdateConfig(): void {
  const config = readNveConfig();
  saveNveConfig({ ...config, update: { lastCheck: 0, latestSha: '' } });
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

export function shouldCheckForUpdates(update: UpdateConfig): boolean {
  return update.lastCheck === 0 || Date.now() - update.lastCheck >= 24 * 60 * 60 * 1000; // 24 hours
}

export async function checkForUpdates(currentSha: string): Promise<boolean> {
  if (process.env.CI) {
    return false;
  }

  const config = readNveConfig();
  const { update } = config;

  if (shouldCheckForUpdates(update)) {
    fetchLatestSha()
      .then(latestSha => saveNveConfig({ ...config, update: { lastCheck: Date.now(), latestSha } }))
      .catch(() => {});
  }

  return isUpdateAvailable(currentSha, update.latestSha);
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
  } catch {
    // ignore errors - update check should never break CLI
  }
}
