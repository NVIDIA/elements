// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import piPackage from '../package.json' with { type: 'json' };
import toolsPackage from '../../internals/tools/package.json' with { type: 'json' };

describe('@nvidia-elements/pi package', () => {
  it('should declare the internal tool runtime dependencies', () => {
    expect(piPackage.dependencies).toEqual(toolsPackage.dependencies);
  });

  it('should not publish internal packages as dependencies', () => {
    expect(Object.keys(piPackage.dependencies).some(name => name.startsWith('@internals/'))).toBe(false);
  });

  it('should expose the built extension and native package resources', async () => {
    await expect(access(resolve('dist/index.js'))).resolves.toBeUndefined();
    await expect(access(resolve('dist/skills/elements/SKILL.md'))).resolves.toBeUndefined();
    const skill = await readFile(resolve('dist/skills/elements/SKILL.md'), 'utf8');
    expect(skill).toContain('name: "elements"');
    expect(skill).toContain('## Native Elements tools in Pi');
    expect(skill).toContain('`elements_api_get`');
    expect(skill).not.toContain('## Elements CLI, MCP & Context');
    await expect(access(resolve('dist/skills/elements/references/artifact.md'))).resolves.toBeUndefined();
    await expect(access(resolve('dist/skills/elements/references/integration.md'))).resolves.toBeUndefined();
    await expect(access(resolve('dist/skills/elements/references/migration.md'))).resolves.toBeUndefined();
    const doctor = await readFile(resolve('dist/skills/elements/references/doctor.md'), 'utf8');
    expect(doctor).toContain('# Elements Pi Doctor / Setup Check');
    expect(doctor).not.toContain('## MCP Checks');
    for (const prompt of ['artifact', 'doctor', 'create-project', 'migrate']) {
      await expect(access(resolve(`dist/prompts/elements-${prompt}.md`))).resolves.toBeUndefined();
    }
    await expect(readFile(resolve('dist/prompts/elements-migrate.md'), 'utf8')).resolves.toContain('elements_api_get');
    expect(piPackage.pi.skills).toEqual(['./dist/skills']);
    expect(piPackage.pi.prompts).toEqual(['./dist/prompts']);
  });

  it('should not eagerly load project archive dependencies', async () => {
    const extension = await readFile(resolve('dist/index.js'), 'utf8');
    expect(extension).not.toMatch(/import\s+(?:[^;]*from\s+)?["']archiver["']/);
  });

  it('should register the Elements tools from the built extension', async () => {
    const { default: elementsExtension } = await import('../dist/index.js');
    const registerTool = vi.fn();
    const pi = {
      getFlag: vi.fn(() => false),
      on: vi.fn(),
      registerCommand: vi.fn(),
      registerFlag: vi.fn(),
      registerTool
    } as unknown as ExtensionAPI;

    elementsExtension(pi);

    expect(registerTool.mock.calls.map(([tool]) => tool.name)).toEqual([
      'elements_api_list',
      'elements_api_get',
      'elements_api_validate',
      'elements_api_imports_get',
      'elements_api_tokens_list',
      'elements_api_icons_list',
      'elements_examples_list',
      'elements_examples_get',
      'elements_project_validate',
      'elements_packages_list',
      'elements_packages_get',
      'elements_packages_changelogs_get'
    ]);
  });
});
