import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  readConfig,
  saveConfig,
  fetchLatestVersion,
  isUpdateAvailable,
  shouldCheckForUpdates,
  checkForUpdates,
  notifyIfUpdateAvailable
} from './update.js';

// Mock node:fs
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn()
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
      const mockConfig = { lastCheck: 1234567890, latestVersion: '1.0.0' };

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
      const config = { lastCheck: Date.now(), latestVersion: '1.0.0' };

      vi.mocked(existsSync).mockReturnValue(false);

      saveConfig(config);

      expect(mkdirSync).toHaveBeenCalledWith('/mock/home/.nve', { recursive: true });
      expect(writeFileSync).toHaveBeenCalledWith('/mock/home/.nve/update-check.json', JSON.stringify(config, null, 2));
    });

    it('should always create directory with recursive flag (safe if exists)', async () => {
      const { mkdirSync, writeFileSync } = await import('node:fs');
      const config = { lastCheck: Date.now(), latestVersion: '1.0.0' };

      saveConfig(config);

      expect(mkdirSync).toHaveBeenCalledWith('/mock/home/.nve', { recursive: true });
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should silently handle write errors', async () => {
      const { existsSync, writeFileSync } = await import('node:fs');
      const config = { lastCheck: Date.now(), latestVersion: '1.0.0' };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(writeFileSync).mockImplementation(() => {
        throw new Error('Write error');
      });

      // Should not throw
      expect(() => saveConfig(config)).not.toThrow();
    });
  });

  describe('fetchLatestVersion', () => {
    it('should fetch and return latest version from registry', async () => {
      const mockResponse = { version: '2.0.0' };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
      );

      const result = await fetchLatestVersion();
      expect(result).toBe('2.0.0');
      expect(fetch).toHaveBeenCalledWith(
        'https://esm.nvidia.com/@nvidia-elements/cli@latest/package.json',
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

      await expect(fetchLatestVersion()).rejects.toThrow('Failed to fetch latest version');
    });

    it('should throw error on network failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      await expect(fetchLatestVersion()).rejects.toThrow('Failed to fetch latest version');
    });
  });

  describe('isUpdateAvailable', () => {
    it('should return true when latest version is greater', () => {
      expect(isUpdateAvailable('1.0.0', '2.0.0')).toBe(true);
      expect(isUpdateAvailable('1.0.0', '1.1.0')).toBe(true);
      expect(isUpdateAvailable('1.0.0', '1.0.1')).toBe(true);
    });

    it('should return false when versions are equal', () => {
      expect(isUpdateAvailable('1.0.0', '1.0.0')).toBe(false);
    });

    it('should return false when current is greater', () => {
      expect(isUpdateAvailable('2.0.0', '1.0.0')).toBe(false);
    });

    it('should return false for invalid versions', () => {
      expect(isUpdateAvailable('invalid', '2.0.0')).toBe(false);
      expect(isUpdateAvailable('1.0.0', 'invalid')).toBe(false);
    });
  });

  describe('shouldCheckForUpdates', () => {
    it('should return true when config is null', () => {
      expect(shouldCheckForUpdates(null)).toBe(true);
    });

    it('should return true when last check was more than 24 hours ago', () => {
      const oldCheck = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      const config = { lastCheck: oldCheck, latestVersion: '1.0.0' };
      expect(shouldCheckForUpdates(config)).toBe(true);
    });

    it('should return false when last check was less than 24 hours ago', () => {
      const recentCheck = Date.now() - 12 * 60 * 60 * 1000; // 12 hours ago
      const config = { lastCheck: recentCheck, latestVersion: '1.0.0' };
      expect(shouldCheckForUpdates(config)).toBe(false);
    });

    it('should return true when last check was exactly 24 hours ago', () => {
      const exactlyOneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const config = { lastCheck: exactlyOneDayAgo, latestVersion: '1.0.0' };
      expect(shouldCheckForUpdates(config)).toBe(true);
    });
  });

  describe('checkForUpdates', () => {
    it('should return null in CI environment', async () => {
      process.env.CI = 'true';
      const result = await checkForUpdates('1.0.0');
      expect(result).toBeNull();
    });

    it('should return cached version if update is available', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      const recentCheck = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago
      const mockConfig = { lastCheck: recentCheck, latestVersion: '2.0.0' };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      const result = await checkForUpdates('1.0.0');
      expect(result).toBe('2.0.0');
    });

    it('should return null if no update is available', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      const recentCheck = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago
      const mockConfig = { lastCheck: recentCheck, latestVersion: '1.0.0' };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      const result = await checkForUpdates('1.0.0');
      expect(result).toBeNull();
    });

    it('should return null when no cached config exists', async () => {
      const { existsSync } = await import('node:fs');

      vi.mocked(existsSync).mockReturnValue(false);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ version: '2.0.0' })
        })
      );

      const result = await checkForUpdates('1.0.0');
      expect(result).toBeNull();
    });
  });

  describe('notifyIfUpdateAvailable', () => {
    beforeEach(() => {
      // Mock TTY by default
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    });

    it('should skip notification in CI environment', async () => {
      process.env.CI = 'true';
      await notifyIfUpdateAvailable('1.0.0', Promise.resolve('2.0.0'));
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should skip notification when not TTY', async () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
      await notifyIfUpdateAvailable('1.0.0', Promise.resolve('2.0.0'));
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should show notification when update is available from promise', async () => {
      await notifyIfUpdateAvailable('1.0.0', Promise.resolve('2.0.0'));

      expect(console.log).toHaveBeenCalled();
      const logCall = vi.mocked(console.log).mock.calls[0][0];
      expect(logCall).toContain('Update available');
      expect(logCall).toContain('1.0.0');
      expect(logCall).toContain('2.0.0');
    });

    it('should show notification from cached config when promise returns null', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      const mockConfig = { lastCheck: Date.now(), latestVersion: '2.0.0' };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      await notifyIfUpdateAvailable('1.0.0', Promise.resolve(null));

      expect(console.log).toHaveBeenCalled();
      const logCall = vi.mocked(console.log).mock.calls[0][0];
      expect(logCall).toContain('2.0.0');
    });

    it('should not show notification when no update available', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      const mockConfig = { lastCheck: Date.now(), latestVersion: '1.0.0' };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      await notifyIfUpdateAvailable('1.0.0', Promise.resolve(null));
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should silently handle errors', async () => {
      await notifyIfUpdateAvailable('1.0.0', Promise.reject(new Error('test')));
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
