// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventEmitter } from 'node:events';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performUpgrade, upgradeCommands } from './utils.js';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
  execSync: vi.fn()
}));

function createMockChild(stdout = '', stderr = '', exitCode = 0) {
  const child = new EventEmitter() as EventEmitter & {
    stdout: EventEmitter;
    stderr: EventEmitter;
  };
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();

  process.nextTick(() => {
    if (stdout) {
      child.stdout.emit('data', Buffer.from(stdout));
    }
    if (stderr) {
      child.stderr.emit('data', Buffer.from(stderr));
    }
    child.emit('close', exitCode);
  });

  return child;
}

describe('cli/utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('performUpgrade (sync path, no onProgress)', () => {
    it('should return success report when upgrade succeeds', async () => {
      const { execSync } = await import('node:child_process');
      vi.mocked(execSync).mockReturnValue('');

      const result = await performUpgrade();

      expect(result.upgrade?.status).toBe('success');
      expect(result.upgrade?.message).toBe('CLI upgraded successfully.');
    });

    it('should use stdio inherit for TTY colors', async () => {
      const { execSync } = await import('node:child_process');
      vi.mocked(execSync).mockReturnValue('');

      await performUpgrade();

      expect(execSync).toHaveBeenCalledWith(expect.any(String), { stdio: 'inherit' });
    });

    it('should return danger report when upgrade fails', async () => {
      const { execSync } = await import('node:child_process');
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Command failed');
      });

      const result = await performUpgrade();

      expect(result.upgrade?.status).toBe('danger');
      expect(result.upgrade?.message).toBe('Command failed');
    });

    it('should use macos/linux command on darwin', async () => {
      const { execSync } = await import('node:child_process');
      vi.mocked(execSync).mockReturnValue('');
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

      await performUpgrade();

      expect(execSync).toHaveBeenCalledWith(upgradeCommands['macos/linux'], { stdio: 'inherit' });
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    });

    it('should use windows command on win32', async () => {
      const { execSync } = await import('node:child_process');
      vi.mocked(execSync).mockReturnValue('');
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });

      await performUpgrade();

      expect(execSync).toHaveBeenCalledWith(upgradeCommands['windows-cmd'], { stdio: 'inherit' });
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    });
  });

  describe('performUpgrade (async path, with onProgress)', () => {
    it('should return success report when upgrade succeeds', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockReturnValue(createMockChild('Installed successfully\n') as ReturnType<typeof spawn>);

      const result = await performUpgrade(vi.fn());

      expect(result.upgrade?.status).toBe('success');
      expect(result.upgrade?.message).toBe('Installed successfully\n');
    });

    it('should return success with default message when output is empty', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockReturnValue(createMockChild('') as ReturnType<typeof spawn>);

      const result = await performUpgrade(vi.fn());

      expect(result.upgrade?.status).toBe('success');
      expect(result.upgrade?.message).toBe('CLI upgraded successfully.');
    });

    it('should return danger report when process exits with non-zero code', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockReturnValue(createMockChild('', 'install failed', 1) as ReturnType<typeof spawn>);

      const result = await performUpgrade(vi.fn());

      expect(result.upgrade?.status).toBe('danger');
      expect(result.upgrade?.message).toBe('install failed');
    });

    it('should use exit code in error when stderr is empty', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockReturnValue(createMockChild('', '', 1) as ReturnType<typeof spawn>);

      const result = await performUpgrade(vi.fn());

      expect(result.upgrade?.status).toBe('danger');
      expect(result.upgrade?.message).toBe('Process exited with code 1');
    });

    it('should return danger report on spawn error', async () => {
      const { spawn } = await import('node:child_process');
      const child = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter;
        stderr: EventEmitter;
      };
      child.stdout = new EventEmitter();
      child.stderr = new EventEmitter();
      process.nextTick(() => child.emit('error', new Error('spawn failed')));
      vi.mocked(spawn).mockReturnValue(child as ReturnType<typeof spawn>);

      const result = await performUpgrade(vi.fn());

      expect(result.upgrade?.status).toBe('danger');
      expect(result.upgrade?.message).toBe('spawn failed');
    });

    it('should call onProgress with stdout chunks', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockReturnValue(createMockChild('downloading...') as ReturnType<typeof spawn>);
      const onProgress = vi.fn();

      await performUpgrade(onProgress);

      expect(onProgress).toHaveBeenCalledWith('downloading...');
    });

    it('should use bash with -c on darwin', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockReturnValue(createMockChild('') as ReturnType<typeof spawn>);
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

      await performUpgrade(vi.fn());

      expect(spawn).toHaveBeenCalledWith('bash', ['-c', upgradeCommands['macos/linux']], { stdio: 'pipe' });
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    });

    it('should use cmd with /c on win32', async () => {
      const { spawn } = await import('node:child_process');
      vi.mocked(spawn).mockReturnValue(createMockChild('') as ReturnType<typeof spawn>);
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });

      await performUpgrade(vi.fn());

      expect(spawn).toHaveBeenCalledWith('cmd', ['/c', upgradeCommands['windows-cmd']], { stdio: 'pipe' });
      Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    });
  });

  it('should not call process.exit', async () => {
    const { execSync } = await import('node:child_process');
    vi.mocked(execSync).mockReturnValue('');
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await performUpgrade();

    expect(exitSpy).not.toHaveBeenCalled();
  });
});
