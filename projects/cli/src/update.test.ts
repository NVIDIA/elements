// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clearUpdateConfig, fetchLatestSha, isUpdateAvailable, notifyIfUpdateAvailable } from './update.js';

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
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    });

    it('should return false in CI environment', async () => {
      process.env.CI = 'true';
      const result = await isUpdateAvailable('abc123');
      expect(result).toBe(false);
    });

    it('should return false when not TTY', async () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
      const result = await isUpdateAvailable('abc123');
      expect(result).toBe(false);
    });

    it('should return true when fetched sha differs from current', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ sha: 'def456' })
        })
      );

      const result = await isUpdateAvailable('abc123');
      expect(result).toBe(true);
    });

    it('should return false when fetched sha matches current', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ sha: 'abc123' })
        })
      );

      const result = await isUpdateAvailable('abc123');
      expect(result).toBe(false);
    });

    it('should not fetch when last check was less than 24 hours ago', async () => {
      const { readNveConfig } = await import('@internals/tools');
      vi.mocked(readNveConfig).mockReturnValue({
        ...defaultConfig,
        update: { lastCheck: Date.now() - 1 * 60 * 60 * 1000, latestSha: 'def456' }
      });
      vi.stubGlobal('fetch', vi.fn());

      const result = await isUpdateAvailable('abc123');
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should fetch when lastCheck is 0', async () => {
      const { readNveConfig } = await import('@internals/tools');
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

      const result = await isUpdateAvailable('abc123');
      expect(fetch).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should fetch when last check was more than 24 hours ago', async () => {
      const { readNveConfig } = await import('@internals/tools');
      vi.mocked(readNveConfig).mockReturnValue({
        ...defaultConfig,
        update: { lastCheck: Date.now() - 25 * 60 * 60 * 1000, latestSha: 'old-sha' }
      });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ sha: 'new-sha' })
        })
      );

      const result = await isUpdateAvailable('abc123');
      expect(fetch).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should save config when fetch succeeds', async () => {
      const { saveNveConfig } = await import('@internals/tools');
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ sha: 'new-sha' })
        })
      );

      await isUpdateAvailable('abc123');

      expect(saveNveConfig).toHaveBeenCalledWith(
        expect.objectContaining({ update: expect.objectContaining({ latestSha: 'new-sha' }) })
      );
    });

    it('should return false when fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

      const result = await isUpdateAvailable('abc123');
      expect(result).toBe(false);
    });
  });

  describe('notifyIfUpdateAvailable', () => {
    beforeEach(() => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    });

    it('should skip notification in CI environment', async () => {
      process.env.CI = 'true';
      await notifyIfUpdateAvailable('abc123');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should skip notification when not TTY', async () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
      await notifyIfUpdateAvailable('abc123');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should show notification when update is available', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ sha: 'def456' })
        })
      );

      await notifyIfUpdateAvailable('abc123');

      expect(console.log).toHaveBeenCalled();
      const logCall = vi.mocked(console.log).mock.calls[0][0];
      expect(logCall).toContain('Update available');
      expect(logCall).toContain('nve --upgrade');
    });

    it('should not show notification when no update available', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ sha: 'abc123' })
        })
      );

      await notifyIfUpdateAvailable('abc123');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should silently handle errors', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('test')));
      await notifyIfUpdateAvailable('abc123');
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
