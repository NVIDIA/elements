import { describe, it, expect } from 'vitest';
import { updatePackageJson } from './update.js';
import type { ElementVersions } from '../api/utils.js';

function createMockElementVersions(versions: Partial<ElementVersions>): ElementVersions {
  return {
    '@nvidia-elements/core': '1.0.0',
    '@nvidia-elements/core-react': '1.0.0',
    '@nvidia-elements/styles': '1.0.0',
    '@nvidia-elements/testing': '1.0.0',
    '@nvidia-elements/themes': '1.0.0',
    '@nvidia-elements/behaviors-alpine': '1.0.0',
    '@nvidia-elements/brand': '1.0.0',
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
    expect(result).toEqual({
      dependencies: {},
      devDependencies: {},
      peerDependencies: {
        '@nvidia-elements/core': '^2.0.0'
      }
    });
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
    expect(result).toEqual({
      dependencies: {
        '@nvidia-elements/core': '2.0.0',
        '@nvidia-elements/styles': '1.0.0'
      },
      devDependencies: {},
      peerDependencies: {}
    });
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
    expect(result).toEqual({
      dependencies: {},
      devDependencies: {
        '@nvidia-elements/core': '2.0.0',
        '@nvidia-elements/themes': '0.4.0'
      },
      peerDependencies: {}
    });
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
    expect(result).toEqual({
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
    expect(result).toEqual({
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
    expect(result).toEqual({
      dependencies: {
        'other-package': '1.0.0'
      },
      devDependencies: {},
      peerDependencies: {}
    });
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
    expect(result).toEqual({
      dependencies: {},
      devDependencies: {},
      peerDependencies: {}
    });
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
    expect(result).toEqual({
      dependencies: {
        '@nvidia-elements/core': '2.0.0'
      },
      devDependencies: {},
      peerDependencies: {}
    });
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
    expect(result).toEqual({
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
  });
});
