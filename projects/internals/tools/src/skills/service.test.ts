// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { promises as fsp } from 'node:fs';
import { tmpdir } from 'node:os';
import nodePath from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { ToolSupport } from '../internal/tools.js';
import { getSkillInstallDirectories, SkillsService } from './service.js';

const temporaryDirectories: string[] = [];

async function createTemporaryDirectory() {
  const directory = await fsp.mkdtemp(nodePath.join(tmpdir(), 'elements-skill-install-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(directory => fsp.rm(directory, { recursive: true, force: true }))
  );
});

describe('getSkillInstallDirectories', () => {
  it('should target shared and Claude skill directories in the current project', () => {
    expect(getSkillInstallDirectories({ cwd: '/project' })).toEqual([
      nodePath.resolve('/project/.agents/skills/elements'),
      nodePath.resolve('/project/.claude/skills/elements')
    ]);
  });

  it('should target the global shared skill directory', () => {
    expect(getSkillInstallDirectories({ global: true, env: { HOME: '/home/ada' }, platform: 'linux' })).toEqual([
      '/home/ada/.agents/skills/elements'
    ]);
  });

  it('should resolve the Windows global skill directory', () => {
    expect(
      getSkillInstallDirectories({ global: true, env: { USERPROFILE: 'C:\\Users\\Ada' }, platform: 'win32' })
    ).toEqual(['C:\\Users\\Ada\\.agents\\skills\\elements']);
  });

  it('should reject a global install without a home directory', () => {
    expect(() => getSkillInstallDirectories({ global: true, env: {}, platform: 'linux' })).toThrow('HOME is not set');
  });
});

describe('SkillsService', () => {
  it('should expose a CLI-only install tool', () => {
    const metadata = (SkillsService.install as ToolMethod<unknown>).metadata!;
    expect(metadata.command).toBe('install');
    expect(metadata.support).toBe(ToolSupport.CLI);
    expect(metadata.inputSchema?.properties?.global?.type).toBe('boolean');
  });

  it('should install the complete skill in the current project', async () => {
    const root = await createTemporaryDirectory();
    const originalCwd = process.cwd();
    process.chdir(root);
    try {
      const result = await SkillsService.install();
      expect(result).toContain(nodePath.join(root, '.agents', 'skills', 'elements'));
      expect(result).toContain(nodePath.join(root, '.claude', 'skills', 'elements'));
      await expect(
        fsp.readFile(nodePath.join(root, '.agents', 'skills', 'elements', 'references', 'artifact.md'), 'utf8')
      ).resolves.toContain('Creating an Artifact');
      await expect(
        fsp.readFile(nodePath.join(root, '.claude', 'skills', 'elements', 'references', 'migration.md'), 'utf8')
      ).resolves.toContain('Elements Migration Guide');
    } finally {
      process.chdir(originalCwd);
    }
  });
});
