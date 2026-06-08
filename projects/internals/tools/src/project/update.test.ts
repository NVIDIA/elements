// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePackageJson, updateProject } from './update.js';
import type { ElementVersions } from '../api/utils.js';
import type fs from 'node:fs';

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof fs>();
  return { ...actual, existsSync: vi.fn(() => true), writeFileSync: vi.fn() };
});

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn()
}));

vi.mock('../internal/node.js', () => ({
  getPackageJson: vi.fn(),
  getNPMClient: vi.fn()
}));

vi.mock('@internals/metadata', () => ({
  ProjectsService: { getData: vi.fn() }
}));

vi.mock('../api/utils.js', () => ({
  getLatestPublishedVersions: vi.fn()
}));

function createMockElementVersions(versions: Partial<ElementVersions>): ElementVersions {
  return {
    '@nvidia-elements/cli': '1.0.0',
    '@nvidia-elements/lint': '1.0.0',
    '@nvidia-elements/markdown': '1.0.0',
    '@nvidia-elements/core': '1.0.0',
    '@nvidia-elements/styles': '1.0.0',
    '@nvidia-elements/themes': '1.0.0',
    '@nvidia-elements/code': '1.0.0',
    '@nvidia-elements/forms': '1.0.0',
    '@nvidia-elements/monaco': '1.0.0',
    ...versions
  };
}

describe('updatePackageJson', () => {
  it('should update peerDependencies when package exists', () => {
    const packageJson = {
      dependencies: {},
      devDependencies: {},
      peerDependencies: {
        '@nvidia-elements/core': '1.0.0'
      }
    };

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.packageJson).toEqual({
      dependencies: {},
      devDependencies: {},
      peerDependencies: {
        '@nvidia-elements/core': '^2.0.0'
      }
    });
    expect(result.updated).toContainEqual({ name: '@nvidia-elements/core', from: '1.0.0', to: '^2.0.0' });
  });

  it('should update dependencies when package exists', () => {
    const packageJson = {
      dependencies: {
        '@nvidia-elements/core': '1.0.0',
        '@nvidia-elements/styles': '0.5.0'
      },
      devDependencies: {},
      peerDependencies: {}
    };

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0',
      '@nvidia-elements/styles': '1.0.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.packageJson).toEqual({
      dependencies: {
        '@nvidia-elements/core': '2.0.0',
        '@nvidia-elements/styles': '1.0.0'
      },
      devDependencies: {},
      peerDependencies: {}
    });
    expect(result.updated).toContainEqual({ name: '@nvidia-elements/core', from: '1.0.0', to: '2.0.0' });
    expect(result.updated).toContainEqual({ name: '@nvidia-elements/styles', from: '0.5.0', to: '1.0.0' });
  });

  it('should update devDependencies when package exists', () => {
    const packageJson = {
      dependencies: {},
      devDependencies: {
        '@nvidia-elements/core': '1.0.0',
        '@nvidia-elements/themes': '0.3.0'
      },
      peerDependencies: {}
    };

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0',
      '@nvidia-elements/themes': '0.4.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.packageJson).toEqual({
      dependencies: {},
      devDependencies: {
        '@nvidia-elements/core': '2.0.0',
        '@nvidia-elements/themes': '0.4.0'
      },
      peerDependencies: {}
    });
    expect(result.updated).toContainEqual({ name: '@nvidia-elements/core', from: '1.0.0', to: '2.0.0' });
    expect(result.updated).toContainEqual({ name: '@nvidia-elements/themes', from: '0.3.0', to: '0.4.0' });
  });

  it('should not update packages with catalog versions', () => {
    const packageJson = {
      dependencies: {
        '@nvidia-elements/core': 'catalog:latest'
      },
      devDependencies: {
        '@nvidia-elements/styles': 'catalog:dev'
      },
      peerDependencies: {
        '@nvidia-elements/themes': 'catalog:peer'
      }
    };

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0',
      '@nvidia-elements/styles': '1.0.0',
      '@nvidia-elements/themes': '0.4.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.packageJson).toEqual({
      dependencies: {
        '@nvidia-elements/core': 'catalog:latest'
      },
      devDependencies: {
        '@nvidia-elements/styles': 'catalog:dev'
      },
      peerDependencies: {
        '@nvidia-elements/themes': 'catalog:peer'
      }
    });
    expect(result.updated).toEqual([]);
  });

  it('should update multiple packages across different dependency types', () => {
    const packageJson = {
      dependencies: {
        '@nvidia-elements/core': '1.0.0',
        'other-package': '1.0.0'
      },
      devDependencies: {
        '@nvidia-elements/styles': '0.5.0'
      },
      peerDependencies: {
        '@nvidia-elements/themes': '0.3.0'
      }
    };

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0',
      '@nvidia-elements/styles': '1.0.0',
      '@nvidia-elements/themes': '0.4.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.packageJson).toEqual({
      dependencies: {
        '@nvidia-elements/core': '2.0.0',
        'other-package': '1.0.0'
      },
      devDependencies: {
        '@nvidia-elements/styles': '1.0.0'
      },
      peerDependencies: {
        '@nvidia-elements/themes': '^0.4.0'
      }
    });
    expect(result.updated).toHaveLength(3);
  });

  it('should handle packages that do not exist in any dependency type', () => {
    const packageJson = {
      dependencies: {
        'other-package': '1.0.0'
      },
      devDependencies: {},
      peerDependencies: {}
    };

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0',
      '@nvidia-elements/styles': '1.0.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.packageJson).toEqual({
      dependencies: {
        'other-package': '1.0.0'
      },
      devDependencies: {},
      peerDependencies: {}
    });
    expect(result.updated).toEqual([]);
  });

  it('should handle empty dependency objects', () => {
    const packageJson = {
      dependencies: {},
      devDependencies: {},
      peerDependencies: {}
    };

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.packageJson).toEqual({
      dependencies: {},
      devDependencies: {},
      peerDependencies: {}
    });
    expect(result.updated).toEqual([]);
  });

  it('should handle missing dependency properties', () => {
    const packageJson = {
      dependencies: {
        '@nvidia-elements/core': '1.0.0'
      },
      devDependencies: {},
      peerDependencies: {}
    };

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.packageJson).toEqual({
      dependencies: {
        '@nvidia-elements/core': '2.0.0'
      },
      devDependencies: {},
      peerDependencies: {}
    });
    expect(result.updated).toContainEqual({ name: '@nvidia-elements/core', from: '1.0.0', to: '2.0.0' });
  });

  it('should preserve non-NVE packages', () => {
    const packageJson = {
      dependencies: {
        '@nvidia-elements/core': '1.0.0',
        react: '18.0.0',
        typescript: '5.0.0'
      },
      devDependencies: {
        '@nvidia-elements/styles': '0.5.0',
        vitest: '1.0.0'
      },
      peerDependencies: {
        '@nvidia-elements/themes': '0.3.0',
        vue: '3.0.0'
      }
    };

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0',
      '@nvidia-elements/styles': '1.0.0',
      '@nvidia-elements/themes': '0.4.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.packageJson).toEqual({
      dependencies: {
        '@nvidia-elements/core': '2.0.0',
        react: '18.0.0',
        typescript: '5.0.0'
      },
      devDependencies: {
        '@nvidia-elements/styles': '1.0.0',
        vitest: '1.0.0'
      },
      peerDependencies: {
        '@nvidia-elements/themes': '^0.4.0',
        vue: '3.0.0'
      }
    });
    expect(result.updated).toHaveLength(3);
  });

  it('should handle packageJson without peerDependencies or devDependencies', () => {
    const packageJson = {
      dependencies: {
        '@nvidia-elements/core': '1.0.0'
      }
    } as Parameters<typeof updatePackageJson>[0];

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.updated).toContainEqual({ name: '@nvidia-elements/core', from: '1.0.0', to: '2.0.0' });
    expect(result.updated).toHaveLength(1);
  });

  it('should not report updates when versions already match', () => {
    const packageJson = {
      dependencies: {
        '@nvidia-elements/core': '2.0.0'
      },
      devDependencies: {},
      peerDependencies: {}
    };

    const latestVersions = createMockElementVersions({
      '@nvidia-elements/core': '2.0.0'
    });

    const result = updatePackageJson(packageJson, latestVersions);
    expect(result.packageJson.dependencies['@nvidia-elements/core']).toBe('2.0.0');
    expect(result.updated).toEqual([]);
  });
});

describe('updateProject', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { existsSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(true);
  });

  it('should return warning when no package.json exists', async () => {
    const { existsSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(false);

    const result = await updateProject('/some/cdn-only/project');
    expect(result.dependencies.status).toBe('warning');
    expect(result.dependencies.message).toContain('No package.json found in the project directory');
    expect(result.dependencies.message).toContain('Dependencies were not updated');
  });

  it('should not call getPackageJson when no package.json exists', async () => {
    const { existsSync } = await import('node:fs');
    const { getPackageJson } = await import('../internal/node.js');
    vi.mocked(existsSync).mockReturnValue(false);

    await updateProject('/some/cdn-only/project');
    expect(getPackageJson).not.toHaveBeenCalled();
  });

  it('should include resolved path in warning message', async () => {
    const { existsSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(false);

    const result = await updateProject('/some/cdn-only/project');
    expect(result.dependencies.message).toContain('package.json');
    expect(result.dependencies.message).toContain('/some/cdn-only/project');
  });

  it('should update dependencies without shell interpretation', async () => {
    const { writeFileSync } = await import('node:fs');
    const { execFileSync } = await import('node:child_process');
    const { ProjectsService } = await import('@internals/metadata');
    const { getLatestPublishedVersions } = await import('../api/utils.js');
    const { getNPMClient, getPackageJson } = await import('../internal/node.js');
    const cwd = '/tmp/project with spaces; echo bad';
    const packageJson = {
      dependencies: { '@nvidia-elements/core': '1.0.0' },
      devDependencies: {},
      peerDependencies: {}
    };

    vi.mocked(getPackageJson).mockReturnValue(packageJson);
    vi.mocked(ProjectsService.getData).mockResolvedValue({ data: [{ changelog: 'core' }] });
    vi.mocked(getLatestPublishedVersions).mockResolvedValue(
      createMockElementVersions({ '@nvidia-elements/core': '2.0.0' })
    );
    vi.mocked(getNPMClient).mockResolvedValue('pnpm');

    const result = await updateProject(cwd);

    expect(result.dependencies.status).toBe('success');
    expect(writeFileSync).toHaveBeenCalledWith(`${cwd}/package.json`, expect.stringContaining('"2.0.0"'));
    expect(execFileSync).toHaveBeenCalledWith('pnpm', ['update', '@nvidia-elements/*'], { cwd });
  });

  it('should treat pnpm ignored builds as non-fatal', async () => {
    const { execFileSync } = await import('node:child_process');
    const { ProjectsService } = await import('@internals/metadata');
    const { getLatestPublishedVersions } = await import('../api/utils.js');
    const { getNPMClient, getPackageJson } = await import('../internal/node.js');

    vi.mocked(getPackageJson).mockReturnValue({
      dependencies: { '@nvidia-elements/core': '1.0.0' },
      devDependencies: {},
      peerDependencies: {}
    });
    vi.mocked(ProjectsService.getData).mockResolvedValue({ data: [{ changelog: 'core' }] });
    vi.mocked(getLatestPublishedVersions).mockResolvedValue(
      createMockElementVersions({ '@nvidia-elements/core': '2.0.0' })
    );
    vi.mocked(getNPMClient).mockResolvedValue('pnpm');
    vi.mocked(execFileSync).mockImplementation(() => {
      const error = new Error('Command failed') as Error & { stderr: Buffer };
      error.stderr = Buffer.from('ERR_PNPM_IGNORED_BUILDS Ignored build scripts: esbuild');
      throw error;
    });

    const result = await updateProject('/tmp/project');

    expect(result.dependencies.status).toBe('success');
    expect(result.dependencies.message).toContain('@nvidia-elements/core: 1.0.0 → 2.0.0');
  });

  it('should report success when all packages are already up to date', async () => {
    const { writeFileSync } = await import('node:fs');
    const { execFileSync } = await import('node:child_process');
    const { ProjectsService } = await import('@internals/metadata');
    const { getLatestPublishedVersions } = await import('../api/utils.js');
    const { getNPMClient, getPackageJson } = await import('../internal/node.js');

    vi.mocked(getPackageJson).mockReturnValue({
      dependencies: { '@nvidia-elements/core': '2.0.0' },
      devDependencies: {},
      peerDependencies: {}
    });
    vi.mocked(ProjectsService.getData).mockResolvedValue({ data: [{ changelog: 'core' }] });
    vi.mocked(getLatestPublishedVersions).mockResolvedValue(
      createMockElementVersions({ '@nvidia-elements/core': '2.0.0' })
    );
    vi.mocked(getNPMClient).mockResolvedValue('pnpm');

    const result = await updateProject('/tmp/project');

    expect(result.dependencies.status).toBe('success');
    expect(result.dependencies.message).toContain('All packages are already up to date');
    expect(writeFileSync).not.toHaveBeenCalled();
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it('should report danger with command output when the install fails', async () => {
    const { execFileSync } = await import('node:child_process');
    const { ProjectsService } = await import('@internals/metadata');
    const { getLatestPublishedVersions } = await import('../api/utils.js');
    const { getNPMClient, getPackageJson } = await import('../internal/node.js');

    vi.mocked(getPackageJson).mockReturnValue({
      dependencies: { '@nvidia-elements/core': '1.0.0' },
      devDependencies: {},
      peerDependencies: {}
    });
    vi.mocked(ProjectsService.getData).mockResolvedValue({ data: [{ changelog: 'core' }] });
    vi.mocked(getLatestPublishedVersions).mockResolvedValue(
      createMockElementVersions({ '@nvidia-elements/core': '2.0.0' })
    );
    vi.mocked(getNPMClient).mockResolvedValue('pnpm');
    vi.mocked(execFileSync).mockImplementation(() => {
      const error = new Error('Command failed') as Error & { stderr: Buffer };
      error.stderr = Buffer.from('ENOTFOUND registry.npmjs.org');
      throw error;
    });

    const result = await updateProject('/tmp/project');

    expect(result.dependencies.status).toBe('danger');
    expect(result.dependencies.message).toContain('Failed to update to the latest version');
    expect(result.dependencies.message).toContain('ENOTFOUND registry.npmjs.org');
  });

  it('should stringify non-object errors from the install command', async () => {
    const { execFileSync } = await import('node:child_process');
    const { ProjectsService } = await import('@internals/metadata');
    const { getLatestPublishedVersions } = await import('../api/utils.js');
    const { getNPMClient, getPackageJson } = await import('../internal/node.js');

    vi.mocked(getPackageJson).mockReturnValue({
      dependencies: { '@nvidia-elements/core': '1.0.0' },
      devDependencies: {},
      peerDependencies: {}
    });
    vi.mocked(ProjectsService.getData).mockResolvedValue({ data: [{ changelog: 'core' }] });
    vi.mocked(getLatestPublishedVersions).mockResolvedValue(
      createMockElementVersions({ '@nvidia-elements/core': '2.0.0' })
    );
    vi.mocked(getNPMClient).mockResolvedValue('pnpm');
    vi.mocked(execFileSync).mockImplementation(() => {
      const failure: unknown = 'string failure';
      throw failure;
    });

    const result = await updateProject('/tmp/project');

    expect(result.dependencies.status).toBe('danger');
    expect(result.dependencies.message).toContain('string failure');
  });

  it('should fall back to the error message when no command output is present', async () => {
    const { execFileSync } = await import('node:child_process');
    const { ProjectsService } = await import('@internals/metadata');
    const { getLatestPublishedVersions } = await import('../api/utils.js');
    const { getNPMClient, getPackageJson } = await import('../internal/node.js');

    vi.mocked(getPackageJson).mockReturnValue({
      dependencies: { '@nvidia-elements/core': '1.0.0' },
      devDependencies: {},
      peerDependencies: {}
    });
    vi.mocked(ProjectsService.getData).mockResolvedValue({ data: [{ changelog: 'core' }] });
    vi.mocked(getLatestPublishedVersions).mockResolvedValue(
      createMockElementVersions({ '@nvidia-elements/core': '2.0.0' })
    );
    vi.mocked(getNPMClient).mockResolvedValue('pnpm');
    vi.mocked(execFileSync).mockImplementation(() => {
      throw new Error('npm exploded');
    });

    const result = await updateProject('/tmp/project');

    expect(result.dependencies.status).toBe('danger');
    expect(result.dependencies.message).toContain('npm exploded');
  });

  it('should fall back to a generic message when the error has no details', async () => {
    const { execFileSync } = await import('node:child_process');
    const { ProjectsService } = await import('@internals/metadata');
    const { getLatestPublishedVersions } = await import('../api/utils.js');
    const { getNPMClient, getPackageJson } = await import('../internal/node.js');

    vi.mocked(getPackageJson).mockReturnValue({
      dependencies: { '@nvidia-elements/core': '1.0.0' },
      devDependencies: {},
      peerDependencies: {}
    });
    vi.mocked(ProjectsService.getData).mockResolvedValue({ data: [{ changelog: 'core' }] });
    vi.mocked(getLatestPublishedVersions).mockResolvedValue(
      createMockElementVersions({ '@nvidia-elements/core': '2.0.0' })
    );
    vi.mocked(getNPMClient).mockResolvedValue('pnpm');
    vi.mocked(execFileSync).mockImplementation(() => {
      const failure: unknown = {};
      throw failure;
    });

    const result = await updateProject('/tmp/project');

    expect(result.dependencies.status).toBe('danger');
    expect(result.dependencies.message).toContain('Command failed');
  });

  it('should not write package.json when no package manager exists', async () => {
    const { writeFileSync } = await import('node:fs');
    const { execFileSync } = await import('node:child_process');
    const { ProjectsService } = await import('@internals/metadata');
    const { getLatestPublishedVersions } = await import('../api/utils.js');
    const { getNPMClient, getPackageJson } = await import('../internal/node.js');

    vi.mocked(getPackageJson).mockReturnValue({
      dependencies: { '@nvidia-elements/core': '1.0.0' },
      devDependencies: {},
      peerDependencies: {}
    });
    vi.mocked(ProjectsService.getData).mockResolvedValue({ data: [{ changelog: 'core' }] });
    vi.mocked(getLatestPublishedVersions).mockResolvedValue(
      createMockElementVersions({ '@nvidia-elements/core': '2.0.0' })
    );
    vi.mocked(getNPMClient).mockResolvedValue(null);

    const result = await updateProject('/tmp/project');

    expect(result.dependencies.status).toBe('danger');
    expect(writeFileSync).not.toHaveBeenCalled();
    expect(execFileSync).not.toHaveBeenCalled();
  });
});
