import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node:child_process', () => ({
  spawn: vi.fn()
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}));

function createMockChild(exitCode = 0, shouldError = false) {
  const child = new EventEmitter();
  process.nextTick(() => {
    if (shouldError) {
      child.emit('error', new Error('spawn failed'));
    } else {
      child.emit('close', exitCode);
    }
  });
  return child;
}

describe('internal/node', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isCommandAvailable', () => {
    it('should return true when command exits with code 0', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockReturnValue(createMockChild(0) as ReturnType<typeof spawn>);

      const { isCommandAvailable } = await import('./node.js');
      const result = await isCommandAvailable('pnpm');
      expect(result).toBe(true);
    });

    it('should return false when command exits with non-zero code', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockReturnValue(createMockChild(1) as ReturnType<typeof spawn>);

      const { isCommandAvailable } = await import('./node.js');
      const result = await isCommandAvailable('missing-tool');
      expect(result).toBe(false);
    });

    it('should return false when spawn errors', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockReturnValue(createMockChild(0, true) as ReturnType<typeof spawn>);

      const { isCommandAvailable } = await import('./node.js');
      const result = await isCommandAvailable('not-found');
      expect(result).toBe(false);
    });
  });

  describe('getNPMClient', () => {
    it('should return pnpm when both pnpm and npm are available', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockImplementation(() => createMockChild(0) as ReturnType<typeof spawn>);

      const { getNPMClient } = await import('./node.js');
      const result = await getNPMClient();
      expect(result).toBe('pnpm');
    });

    it('should return npm when pnpm is not available', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockImplementation((cmd: string) => {
        // getNPMClient calls isCommandAvailable('npm') then isCommandAvailable('pnpm')
        if (cmd === 'pnpm') {
          return createMockChild(0, true) as ReturnType<typeof spawn>;
        }
        return createMockChild(0) as ReturnType<typeof spawn>;
      });

      const { getNPMClient } = await import('./node.js');
      const result = await getNPMClient();
      expect(result).toBe('npm');
    });

    it('should return null when neither npm nor pnpm is available', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockImplementation(() => createMockChild(0, true) as ReturnType<typeof spawn>);

      const { getNPMClient } = await import('./node.js');
      const result = await getNPMClient();
      expect(result).toBeNull();
    });
  });

  describe('getPackageJson', () => {
    it('should throw when package.json does not exist', async () => {
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const { getPackageJson } = await import('./node.js');
      expect(() => getPackageJson('/fake')).toThrow('No package.json found in the project.');
    });

    it('should return parsed package.json when it exists', async () => {
      const { existsSync, readFileSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ name: 'test-pkg', version: '1.0.0' }));

      const { getPackageJson } = await import('./node.js');
      const result = getPackageJson('/test');
      expect(result.name).toBe('test-pkg');
      expect(result.version).toBe('1.0.0');
    });
  });
});
