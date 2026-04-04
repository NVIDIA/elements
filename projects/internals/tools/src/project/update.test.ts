// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { updatePackageJson } from './update.js';
import type { ElementVersions } from '../api/utils.js';

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
