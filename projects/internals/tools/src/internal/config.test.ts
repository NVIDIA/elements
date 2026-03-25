import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readNveConfig, saveNveConfig } from './config.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn()
}));

vi.mock('node:os', () => ({
  homedir: vi.fn(() => '/mock/home')
}));

describe('config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('readNveConfig', () => {
    it('should return defaults when no config file exists', async () => {
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const config = readNveConfig();

      expect(config.update).toEqual({ lastCheck: 0, latestSha: '' });
    });

    it('should read and parse existing config', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ update: { lastCheck: 100, latestSha: 'abc' } }));

      const config = readNveConfig();

      expect(config.update).toEqual({ lastCheck: 100, latestSha: 'abc' });
    });

    it('should merge with defaults for partial config', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({}));

      const config = readNveConfig();

      expect(config.update).toEqual({ lastCheck: 0, latestSha: '' });
    });

    it('should return defaults on corrupt JSON', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('not json');

      const config = readNveConfig();

      expect(config.update).toEqual({ lastCheck: 0, latestSha: '' });
    });

    it('should return defaults on read error', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('read error');
      });

      const config = readNveConfig();

      expect(config.update).toEqual({ lastCheck: 0, latestSha: '' });
    });
  });

  describe('saveNveConfig', () => {
    it('should create directory and write config', async () => {
      const { mkdirSync, writeFileSync } = await import('node:fs');

      saveNveConfig({ update: { lastCheck: 100, latestSha: 'abc' } });

      expect(mkdirSync).toHaveBeenCalledWith('/mock/home/.nve', { recursive: true });
      expect(writeFileSync).toHaveBeenCalledWith('/mock/home/.nve/config.json', expect.any(String));
    });

    it('should silently handle write errors', async () => {
      const { writeFileSync } = await import('node:fs');
      vi.mocked(writeFileSync).mockImplementation(() => {
        throw new Error('write error');
      });

      expect(() => saveNveConfig({ update: { lastCheck: 0, latestSha: '' } })).not.toThrow();
    });
  });
});
