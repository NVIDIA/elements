import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  readConfig,
  saveConfig,
  clearConfig,
  fetchLatestSha,
  isUpdateAvailable,
  shouldCheckForUpdates,
  checkForUpdates,
  notifyIfUpdateAvailable,
  upgrade,
  updateCommands
} from './update.js';

// Mock node:fs
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn()
}));

// Mock node:child_process
vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

// Mock node:os
vi.mock('node:os', () => ({
  homedir: vi.fn(() => '/mock/home')
}));

describe('update-check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CI;
  });

  describe('readConfig', () => {
    it('should return null when config file does not exist', async () => {
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = readConfig();
      expect(result).toBeNull();
    });

    it('should return parsed config when file exists', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      const mockConfig = { lastCheck: 1234567890, latestSha: 'abc123def456' };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      const result = readConfig();
      expect(result).toEqual(mockConfig);
    });

    it('should return null on read error', async () => {
      const { existsSync, readFileSync } = await import('node:fs');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      const result = readConfig();
      expect(result).toBeNull();
    });

    it('should return null on JSON parse error', async () => {
      const { existsSync, readFileSync } = await import('node:fs');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('invalid json');

      const result = readConfig();
      expect(result).toBeNull();
    });
  });

  describe('saveConfig', () => {
    it('should create directory and write config file', async () => {
      const { existsSync, mkdirSync, writeFileSync } = await import('node:fs');
      const config = { lastCheck: Date.now(), latestSha: 'abc123def456' };

      vi.mocked(existsSync).mockReturnValue(false);

      saveConfig(config);

      expect(mkdirSync).toHaveBeenCalledWith('/mock/home/.nve', { recursive: true });
      expect(writeFileSync).toHaveBeenCalledWith('/mock/home/.nve/update-check.json', JSON.stringify(config, null, 2));
    });

    it('should always create directory with recursive flag (safe if exists)', async () => {
      const { mkdirSync, writeFileSync } = await import('node:fs');
      const config = { lastCheck: Date.now(), latestSha: 'abc123def456' };

      saveConfig(config);

      expect(mkdirSync).toHaveBeenCalledWith('/mock/home/.nve', { recursive: true });
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should silently handle write errors', async () => {
      const { existsSync, writeFileSync } = await import('node:fs');
      const config = { lastCheck: Date.now(), latestSha: 'abc123def456' };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(writeFileSync).mockImplementation(() => {
        throw new Error('Write error');
      });

      expect(() => saveConfig(config)).not.toThrow();
    });
  });

  describe('fetchLatestSha', () => {
    it('should fetch and return latest sha from manifest', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ sha: 'abc123def456' })
        })
      );

      const result = await fetchLatestSha();
      expect(result).toBe('abc123def456');
      expect(fetch).toHaveBeenCalledWith(
        'https://NVIDIA.github.io/elements/cli/manifest.json',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it('should throw error on HTTP error response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404
        })
      );

      await expect(fetchLatestSha()).rejects.toThrow('Failed to fetch latest build info');
    });

    it('should throw error on network failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      await expect(fetchLatestSha()).rejects.toThrow('Failed to fetch latest build info');
    });
  });

  describe('isUpdateAvailable', () => {
    it('should return true when shas differ', () => {
      expect(isUpdateAvailable('abc123', 'def456')).toBe(true);
    });

    it('should return false when shas match', () => {
      expect(isUpdateAvailable('abc123', 'abc123')).toBe(false);
    });

    it('should return false when latest sha is empty', () => {
      expect(isUpdateAvailable('abc123', '')).toBe(false);
    });
  });

  describe('shouldCheckForUpdates', () => {
    it('should return true when config is null', () => {
      expect(shouldCheckForUpdates(null)).toBe(true);
    });

    it('should return true when last check was more than 24 hours ago', () => {
      const oldCheck = Date.now() - 25 * 60 * 60 * 1000;
      const config = { lastCheck: oldCheck, latestSha: 'abc123' };
      expect(shouldCheckForUpdates(config)).toBe(true);
    });

    it('should return false when last check was less than 24 hours ago', () => {
      const recentCheck = Date.now() - 12 * 60 * 60 * 1000;
      const config = { lastCheck: recentCheck, latestSha: 'abc123' };
      expect(shouldCheckForUpdates(config)).toBe(false);
    });

    it('should return true when last check was exactly 24 hours ago', () => {
      const exactlyOneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const config = { lastCheck: exactlyOneDayAgo, latestSha: 'abc123' };
      expect(shouldCheckForUpdates(config)).toBe(true);
    });
  });

  describe('checkForUpdates', () => {
    it('should return false in CI environment', async () => {
      process.env.CI = 'true';
      const result = await checkForUpdates('abc123');
      expect(result).toBe(false);
    });

    it('should return true if cached sha differs from current', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      const recentCheck = Date.now() - 1 * 60 * 60 * 1000;
      const mockConfig = { lastCheck: recentCheck, latestSha: 'def456' };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      const result = await checkForUpdates('abc123');
      expect(result).toBe(true);
    });

    it('should return false if cached sha matches current', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      const recentCheck = Date.now() - 1 * 60 * 60 * 1000;
      const mockConfig = { lastCheck: recentCheck, latestSha: 'abc123' };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      const result = await checkForUpdates('abc123');
      expect(result).toBe(false);
    });

    it('should return false when no cached config exists', async () => {
      const { existsSync } = await import('node:fs');

      vi.mocked(existsSync).mockReturnValue(false);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ sha: 'def456' })
        })
      );

      const result = await checkForUpdates('abc123');
      expect(result).toBe(false);
    });
  });

  describe('notifyIfUpdateAvailable', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    });

    it('should skip notification in CI environment', async () => {
      process.env.CI = 'true';
      await notifyIfUpdateAvailable(Promise.resolve(true));
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should skip notification when not TTY', async () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
      await notifyIfUpdateAvailable(Promise.resolve(true));
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should show notification when update is available', async () => {
      await notifyIfUpdateAvailable(Promise.resolve(true));

      expect(console.log).toHaveBeenCalled();
      const logCall = vi.mocked(console.log).mock.calls[0][0];
      expect(logCall).toContain('Update available');
      expect(logCall).toContain('nve --upgrade');
    });

    it('should not show notification when no update available', async () => {
      await notifyIfUpdateAvailable(Promise.resolve(false));
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should silently handle errors', async () => {
      await notifyIfUpdateAvailable(Promise.reject(new Error('test')));
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('upgrade', () => {
    let exitSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(async () => {
      exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    });

    it('should run macos/linux install command when not on windows', async () => {
      const { execSync } = await import('node:child_process');
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

      upgrade();

      expect(execSync).toHaveBeenCalledWith(updateCommands['macos/linux'], { stdio: 'inherit' });
      expect(exitSpy).toHaveBeenCalledWith(0);
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    });

    it('should run windows install command on win32', async () => {
      const { execSync } = await import('node:child_process');
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });

      upgrade();

      expect(execSync).toHaveBeenCalledWith(updateCommands['windows-cmd'], { stdio: 'inherit' });
      expect(exitSpy).toHaveBeenCalledWith(0);
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    });

    it('should clear update-check config after upgrade', async () => {
      const { writeFileSync } = await import('node:fs');

      upgrade();

      expect(writeFileSync).toHaveBeenCalledWith(
        '/mock/home/.nve/update-check.json',
        JSON.stringify({ lastCheck: 0, latestSha: '' }, null, 2)
      );
    });
  });

  describe('clearConfig', () => {
    it('should reset config to empty state', async () => {
      const { writeFileSync } = await import('node:fs');

      clearConfig();

      expect(writeFileSync).toHaveBeenCalledWith(
        '/mock/home/.nve/update-check.json',
        JSON.stringify({ lastCheck: 0, latestSha: '' }, null, 2)
      );
    });
  });
});
