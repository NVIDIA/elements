import { readNveConfig, saveNveConfig, type NveConfig } from '@internals/tools';
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

export async function isUpdateAvailable(currentSha: string): Promise<boolean> {
  if (process.env.CI || !process.stdout.isTTY) {
    return false;
  }

  try {
    const config: NveConfig = readNveConfig();
    let latestSha = '';

    const shouldCheckForUpdate =
      config.update.lastCheck === 0 || Date.now() - config.update.lastCheck >= 24 * 60 * 60 * 1000; // 24 hours
    if (shouldCheckForUpdate) {
      latestSha = await fetchLatestSha();
      saveNveConfig({ ...config, update: { lastCheck: Date.now(), latestSha } });
    }

    return latestSha !== '' && currentSha !== latestSha;
  } catch {
    return false;
  }
}

/**
 * Shows update notification if a newer build is available.
 * Call after command execution with the promise from checkForUpdates().
 */
export async function notifyIfUpdateAvailable(buildSha: string): Promise<void> {
  if (process.env.CI || !process.stdout.isTTY) {
    return;
  }

  try {
    const updateAvailable = await isUpdateAvailable(buildSha);
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
