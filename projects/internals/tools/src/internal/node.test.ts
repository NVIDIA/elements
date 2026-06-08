// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node:child_process', () => ({
  spawn: vi.fn()
}));

vi.mock('node:fs', () => ({
  accessSync: vi.fn(),
  constants: { X_OK: 1 },
  existsSync: vi.fn(),
  realpathSync: vi.fn(),
  statSync: vi.fn(),
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
      vi.mocked(spawn).mockImplementation(() => createMockChild(0) as ReturnType<typeof spawn>);

      const { isCommandAvailable } = await import('./node.js');
      const result = await isCommandAvailable('pnpm');
      expect(result).toBe(true);
    });

    it('should return false when command exits with non-zero code', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockImplementation(() => createMockChild(1) as ReturnType<typeof spawn>);

      const { isCommandAvailable } = await import('./node.js');
      const result = await isCommandAvailable('missing-tool');
      expect(result).toBe(false);
    });

    it('should return false when spawn errors', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockImplementation(() => createMockChild(0, true) as ReturnType<typeof spawn>);

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

  describe('findExecutablesOnPath', () => {
    it('should find and dedupe executables on PATH by real path', async () => {
      const { existsSync, realpathSync, statSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(statSync).mockReturnValue({ isFile: () => true } as ReturnType<typeof statSync>);
      vi.mocked(realpathSync).mockImplementation(path => {
        return path.toString().startsWith('/b/') ? '/a/nve' : path.toString();
      });

      const { findExecutablesOnPath } = await import('./node.js');
      const result = findExecutablesOnPath('nve', { envPath: '/a:/b' });

      expect(result).toEqual(['/a/nve']);
    });

    it('should ignore PATH entries that do not contain the command', async () => {
      const { existsSync, statSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(statSync).mockReturnValue({ isFile: () => true } as ReturnType<typeof statSync>);

      const { findExecutablesOnPath } = await import('./node.js');
      const result = findExecutablesOnPath('nve', { envPath: '/a:/b' });

      expect(result).toEqual([]);
    });

    it('should ignore files that are not executable on POSIX platforms', async () => {
      const { accessSync, existsSync, statSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(statSync).mockReturnValue({ isFile: () => true } as ReturnType<typeof statSync>);
      vi.mocked(accessSync).mockImplementation(() => {
        throw new Error('not executable');
      });

      const { findExecutablesOnPath } = await import('./node.js');
      const result = findExecutablesOnPath('nve', { envPath: '/a' });

      expect(result).toEqual([]);
    });

    it('should ignore PATH entries that are not regular files', async () => {
      const { existsSync, statSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(statSync).mockReturnValue({ isFile: () => false } as ReturnType<typeof statSync>);

      const { findExecutablesOnPath } = await import('./node.js');
      const result = findExecutablesOnPath('nve', { envPath: '/a' });

      expect(result).toEqual([]);
    });

    it('should expand the command with explicit PATHEXT extensions on win32', async () => {
      const { existsSync, statSync, realpathSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(statSync).mockReturnValue({ isFile: () => true } as ReturnType<typeof statSync>);
      vi.mocked(realpathSync).mockImplementation(path => path.toString());

      const { findExecutablesOnPath } = await import('./node.js');
      const result = findExecutablesOnPath('nve', { envPath: 'C:/bin', platform: 'win32', pathExt: '.EXE;.CMD' });

      expect(result.some(commandPath => commandPath.toLowerCase().endsWith('nve.exe'))).toBe(true);
      expect(result.some(commandPath => commandPath.toLowerCase().endsWith('nve.cmd'))).toBe(true);
    });

    it('should fall back to the PATHEXT environment variable on win32', async () => {
      const { existsSync, statSync, realpathSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(statSync).mockReturnValue({ isFile: () => true } as ReturnType<typeof statSync>);
      vi.mocked(realpathSync).mockImplementation(path => path.toString());
      vi.stubEnv('PATHEXT', '.BAT');

      const { findExecutablesOnPath } = await import('./node.js');
      const result = findExecutablesOnPath('nve', { envPath: 'C:/bin', platform: 'win32' });

      expect(result.some(commandPath => commandPath.toLowerCase().endsWith('nve.bat'))).toBe(true);
      vi.unstubAllEnvs();
    });

    it('should treat any matching file as executable on win32 without an access check', async () => {
      const { accessSync, existsSync, statSync, realpathSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(statSync).mockReturnValue({ isFile: () => true } as ReturnType<typeof statSync>);
      vi.mocked(realpathSync).mockImplementation(path => path.toString());

      const { findExecutablesOnPath } = await import('./node.js');
      const result = findExecutablesOnPath('nve', { envPath: 'C:/bin', platform: 'win32', pathExt: '.EXE' });

      expect(result.length).toBeGreaterThan(0);
      expect(accessSync).not.toHaveBeenCalled();
    });

    it('should default to process PATH and platform when options are omitted', async () => {
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);
      vi.stubEnv('PATH', '/usr/bin:/bin');

      const { findExecutablesOnPath } = await import('./node.js');
      const result = findExecutablesOnPath('definitely-not-a-real-command');

      expect(result).toEqual([]);
      vi.unstubAllEnvs();
    });
  });
});
