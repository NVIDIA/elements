import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  clearUpdateConfig,
  fetchLatestSha,
  isUpdateAvailable,
  shouldCheckForUpdates,
  checkForUpdates,
  notifyIfUpdateAvailable
} from './update.js';

const defaultConfig = {
  update: { lastCheck: 0, latestSha: '' }
};

vi.mock('@internals/tools', () => ({
  readNveConfig: vi.fn(() => ({ ...defaultConfig })),
  saveNveConfig: vi.fn()
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
        expect.stringContaining('/cli/manifest.json'),
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
    it('should return true when lastCheck is 0', () => {
      expect(shouldCheckForUpdates({ lastCheck: 0, latestSha: '' })).toBe(true);
    });

    it('should return true when last check was more than 24 hours ago', () => {
      const oldCheck = Date.now() - 25 * 60 * 60 * 1000;
      expect(shouldCheckForUpdates({ lastCheck: oldCheck, latestSha: 'abc123' })).toBe(true);
    });

    it('should return false when last check was less than 24 hours ago', () => {
      const recentCheck = Date.now() - 12 * 60 * 60 * 1000;
      expect(shouldCheckForUpdates({ lastCheck: recentCheck, latestSha: 'abc123' })).toBe(false);
    });

    it('should return true when last check was exactly 24 hours ago', () => {
      const exactlyOneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      expect(shouldCheckForUpdates({ lastCheck: exactlyOneDayAgo, latestSha: 'abc123' })).toBe(true);
    });
  });

  describe('checkForUpdates', () => {
    it('should return false in CI environment', async () => {
      process.env.CI = 'true';
      const result = await checkForUpdates('abc123');
      expect(result).toBe(false);
    });

    it('should return true if cached sha differs from current', async () => {
      const { readNveConfig } = await import('@internals/tools');
      vi.mocked(readNveConfig).mockReturnValue({
        ...defaultConfig,
        update: { lastCheck: Date.now() - 1 * 60 * 60 * 1000, latestSha: 'def456' }
      });

      const result = await checkForUpdates('abc123');
      expect(result).toBe(true);
    });

    it('should return false if cached sha matches current', async () => {
      const { readNveConfig } = await import('@internals/tools');
      vi.mocked(readNveConfig).mockReturnValue({
        ...defaultConfig,
        update: { lastCheck: Date.now() - 1 * 60 * 60 * 1000, latestSha: 'abc123' }
      });

      const result = await checkForUpdates('abc123');
      expect(result).toBe(false);
    });

    it('should return false when no cached update exists', async () => {
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

    it('should save config when fetch succeeds and check is stale', async () => {
      const { readNveConfig, saveNveConfig } = await import('@internals/tools');
      vi.mocked(readNveConfig).mockReturnValue({
        ...defaultConfig,
        update: { lastCheck: 0, latestSha: '' }
      });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ sha: 'new-sha' })
        })
      );

      await checkForUpdates('abc123');
      // wait for fire-and-forget .then() to resolve
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(saveNveConfig).toHaveBeenCalledWith(
        expect.objectContaining({ update: expect.objectContaining({ latestSha: 'new-sha' }) })
      );
    });

    it('should not throw when fetch fails during background check', async () => {
      const { readNveConfig } = await import('@internals/tools');
      vi.mocked(readNveConfig).mockReturnValue({
        ...defaultConfig,
        update: { lastCheck: 0, latestSha: '' }
      });
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

      const result = await checkForUpdates('abc123');
      // wait for fire-and-forget .catch() to resolve
      await new Promise(resolve => setTimeout(resolve, 10));

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

  describe('clearUpdateConfig', () => {
    it('should reset update section to empty state', async () => {
      const { readNveConfig, saveNveConfig } = await import('@internals/tools');
      vi.mocked(readNveConfig).mockReturnValue({
        update: { lastCheck: 100, latestSha: 'abc' }
      });

      clearUpdateConfig();

      expect(saveNveConfig).toHaveBeenCalledWith({
        update: { lastCheck: 0, latestSha: '' }
      });
    });
  });
});
