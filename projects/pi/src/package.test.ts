// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import piPackage from '../package.json' with { type: 'json' };
import toolsPackage from '../../internals/tools/package.json' with { type: 'json' };
import lintPackage from '../../lint/package.json' with { type: 'json' };

describe('@nvidia-elements/pi package', () => {
  it('should declare runtime dependencies and host-provided peers', async () => {
    expect(piPackage.dependencies).toMatchObject(toolsPackage.dependencies);
    const extension = await readFile(resolve('dist/index.js'), 'utf8');
    for (const name of ['@earendil-works/pi-coding-agent', '@earendil-works/pi-tui', 'typebox']) {
      expect(extension).toContain(`from "${name}"`);
      expect(piPackage.peerDependencies).toHaveProperty(name, '*');
      expect(piPackage.dependencies).not.toHaveProperty(name);
    }
    for (const name of Object.keys(lintPackage.peerDependencies)) {
      expect(piPackage.dependencies).toHaveProperty(name);
    }
  });

  it('should not publish internal packages as dependencies', () => {
    expect(Object.keys(piPackage.dependencies).some(name => name.startsWith('@internals/'))).toBe(false);
  });

  it('should expose the built extension and native package resources', async () => {
    await expect(access(resolve('dist/index.js'))).resolves.toBeUndefined();
    await expect(access(resolve('dist/skills/elements-pi/SKILL.md'))).resolves.toBeUndefined();
    await expect(access(resolve('dist/skills/elements/SKILL.md'))).rejects.toThrow();
    const skill = await readFile(resolve('dist/skills/elements-pi/SKILL.md'), 'utf8');
    expect(skill).toContain('name: "elements-pi"');
    expect(skill).toContain('## Native Elements tools in Pi');
    expect(skill).toContain('When a project or global `elements` skill is also available');
    expect(skill).toContain('`nvidia_elements_api_get`');
    expect(skill).not.toContain('## Elements CLI, MCP & Context');
    await expect(access(resolve('dist/skills/elements-pi/references/artifact.md'))).resolves.toBeUndefined();
    await expect(access(resolve('dist/skills/elements-pi/references/integration.md'))).resolves.toBeUndefined();
    await expect(access(resolve('dist/skills/elements-pi/references/migration.md'))).resolves.toBeUndefined();
    const doctor = await readFile(resolve('dist/skills/elements-pi/references/doctor.md'), 'utf8');
    expect(doctor).toContain('# Elements Pi Doctor / Setup Check');
    expect(doctor).toContain('/skill:elements-pi');
    expect(doctor).not.toContain('## MCP Checks');
    for (const prompt of ['artifact', 'doctor', 'create-project', 'migrate']) {
      await expect(access(resolve(`dist/prompts/elements-${prompt}.md`))).resolves.toBeUndefined();
    }
    await expect(readFile(resolve('dist/prompts/elements-migrate.md'), 'utf8')).resolves.toContain(
      'nvidia_elements_api_get'
    );
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
      'nvidia_elements_api_list',
      'nvidia_elements_api_get',
      'nvidia_elements_api_validate',
      'nvidia_elements_api_imports_get',
      'nvidia_elements_api_tokens_list',
      'nvidia_elements_api_icons_list',
      'nvidia_elements_examples_list',
      'nvidia_elements_examples_get',
      'nvidia_elements_project_validate',
      'nvidia_elements_packages_list',
      'nvidia_elements_packages_get',
      'nvidia_elements_packages_changelogs_get'
    ]);
  });
});
