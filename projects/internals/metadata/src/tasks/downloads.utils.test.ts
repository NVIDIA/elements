import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  parsePackageInfo,
  getDownloads,
  convertToDownloadsReport,
  generateDownloadsReport
} from './downloads.utils.js';

describe('parsePackageInfo', () => {
  it('should parse valid package info with scoped package', () => {
    const result = {
      repo: 'test-repo',
      path: '@nvidia-elements/button/-/@nve',
      name: 'button-1.2.3.tgz',
      stats: [{ downloads: 10, remote_downloads: 5 }]
    };

    const parsed = parsePackageInfo(result);

    expect(parsed).toEqual({
      package: '@nvidia-elements/button',
      version: '1.2.3',
      downloads: 15
    });
  });

  it('should parse package with prerelease version', () => {
    const result = {
      repo: 'test-repo',
      path: '@nvidia-elements/experimental/-/@nve-labs',
      name: 'experimental-2.0.0-beta.1.tgz',
      stats: [{ downloads: 3 }]
    };

    const parsed = parsePackageInfo(result);

    expect(parsed).toEqual({
      package: '@nvidia-elements/experimental',
      version: '2.0.0-beta.1',
      downloads: 3
    });
  });

  it('should parse package with build metadata version', () => {
    const result = {
      repo: 'test-repo',
      path: '@elements/elements/-/@elements',
      name: 'elements-1.0.0-alpha.20231201.tgz',
      stats: [{ downloads: 8, remote_downloads: 2 }]
    };

    const parsed = parsePackageInfo(result);

    expect(parsed).toEqual({
      package: '@elements/elements',
      version: '1.0.0-alpha.20231201',
      downloads: 10
    });
  });

  it('should handle zero downloads', () => {
    const result = {
      repo: 'test-repo',
      path: '@nvidia-elements/icon/-/@nve',
      name: 'icon-0.1.0.tgz',
      stats: [{ downloads: 0, remote_downloads: 0 }]
    };

    const parsed = parsePackageInfo(result);

    expect(parsed).toEqual({
      package: '@nvidia-elements/icon',
      version: '0.1.0',
      downloads: 0
    });
  });

  it('should handle missing stats', () => {
    const result = {
      repo: 'test-repo',
      path: '@nvidia-elements/badge/-/@nve',
      name: 'badge-1.0.0.tgz'
    };

    const parsed = parsePackageInfo(result);

    expect(parsed).toEqual({
      package: '@nvidia-elements/badge',
      version: '1.0.0',
      downloads: 0
    });
  });

  it('should handle missing downloads in stats', () => {
    const result = {
      repo: 'test-repo',
      path: '@nvidia-elements/alert/-/@nve',
      name: 'alert-2.1.0.tgz',
      stats: [{}]
    };

    const parsed = parsePackageInfo(result);

    expect(parsed).toEqual({
      package: '@nvidia-elements/alert',
      version: '2.1.0',
      downloads: 0
    });
  });

  it('should return null for invalid path format', () => {
    const result = {
      repo: 'test-repo',
      path: 'invalid/path/structure',
      name: 'package-1.0.0.tgz',
      stats: [{ downloads: 5 }]
    };

    const parsed = parsePackageInfo(result);

    expect(parsed).toBeNull();
  });

  it('should return null for invalid name format', () => {
    const result = {
      repo: 'test-repo',
      path: '@nvidia-elements/button/-/@nve',
      name: 'button.tgz',
      stats: [{ downloads: 5 }]
    };

    const parsed = parsePackageInfo(result);

    expect(parsed).toBeNull();
  });

  it('should return null for non-tgz file', () => {
    const result = {
      repo: 'test-repo',
      path: '@nvidia-elements/button/-/@nve',
      name: 'button-1.0.0.zip',
      stats: [{ downloads: 5 }]
    };

    const parsed = parsePackageInfo(result);

    expect(parsed).toBeNull();
  });
});

describe('getDownloads', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and parse download data successfully', async () => {
    const mockResponse = {
      results: [
        {
          repo: 'sw-ngc-unified-npm-proxy',
          path: '@nvidia-elements/button/-/@nve',
          name: 'button-1.0.0.tgz',
          stats: [{ downloads: 100, remote_downloads: 50 }]
        },
        {
          repo: 'sw-ngc-unified-npm-proxy',
          path: '@nvidia-elements/experimental/-/@nve-labs',
          name: 'experimental-2.0.0.tgz',
          stats: [{ downloads: 25 }]
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(JSON.stringify(mockResponse))
    });

    const result = await getDownloads('https://registry.npmjs.org', 'sw-ngc-unified-npm-proxy', 'test-token');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      package: '@nvidia-elements/button',
      version: '1.0.0',
      downloads: 150,
      instance: 'registry.npmjs.org'
    });
    expect(result[1]).toEqual({
      package: '@nvidia-elements/experimental',
      version: '2.0.0',
      downloads: 25,
      instance: 'registry.npmjs.org'
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://registry.npmjs.org',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          Authorization: 'Bearer test-token'
        }
      })
    );
  });

  it('should filter out invalid results', async () => {
    const mockResponse = {
      results: [
        {
          repo: 'elements-ui-npm',
          path: '@elements/elements/-/@elements',
          name: 'elements-1.0.0.tgz',
          stats: [{ downloads: 10 }]
        },
        {
          repo: 'elements-ui-npm',
          path: 'invalid/path',
          name: 'invalid-1.0.0.tgz',
          stats: [{ downloads: 5 }]
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(JSON.stringify(mockResponse))
    });

    const result = await getDownloads('https://artifactory.build.nvidia.com/artifactory', 'elements-ui-npm', 'test-token');

    expect(result).toHaveLength(1);
    expect(result[0].package).toBe('@elements/elements');
  });

  it('should handle empty results', async () => {
    const mockResponse = {
      results: []
    };

    global.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(JSON.stringify(mockResponse))
    });

    const result = await getDownloads('https://registry.npmjs.org', 'sw-ngc-unified-npm-proxy', 'test-token');

    expect(result).toHaveLength(0);
  });

  it('should set correct instance name for elements-ui-playground-npm', async () => {
    const mockResponse = {
      results: [
        {
          repo: 'elements-ui-playground-npm',
          path: '@elements/elements-react/-/@elements',
          name: 'elements-react-1.0.0.tgz',
          stats: [{ downloads: 5 }]
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(JSON.stringify(mockResponse))
    });

    const result = await getDownloads(
      'https://artifactory.build.nvidia.com/artifactory',
      'elements-ui-playground-npm',
      'test-token'
    );

    expect(result[0].instance).toBe('artifactory.build.nvidia.com');
  });
});

describe('convertToDownloadsReport', () => {
  it('should convert simple package data to report format', () => {
    const packages = [
      {
        package: '@nvidia-elements/button',
        version: '1.0.0',
        downloads: 100,
        instance: 'registry.npmjs.org'
      }
    ];

    const report = convertToDownloadsReport(packages);

    expect(report.packages).toHaveLength(1);
    expect(report.packages[0]).toEqual({
      package: '@nvidia-elements/button',
      totalDownloads: 100,
      versions: [
        {
          version: '1.0.0',
          totalDownloads: 100,
          instances: [{ instance: 'registry.npmjs.org', downloads: 100 }]
        }
      ],
      instances: [{ name: 'registry.npmjs.org', totalDownloads: 100 }]
    });
    expect(report.totalDownloads).toBe(100);
    expect(report.created).toBeDefined();
  });

  it('should aggregate multiple versions of the same package', () => {
    const packages = [
      {
        package: '@nvidia-elements/button',
        version: '1.0.0',
        downloads: 100,
        instance: 'registry.npmjs.org'
      },
      {
        package: '@nvidia-elements/button',
        version: '2.0.0',
        downloads: 200,
        instance: 'registry.npmjs.org'
      }
    ];

    const report = convertToDownloadsReport(packages);

    expect(report.packages).toHaveLength(1);
    expect(report.packages[0].totalDownloads).toBe(300);
    expect(report.packages[0].versions).toHaveLength(2);
    expect(report.totalDownloads).toBe(300);
  });

  it('should aggregate downloads across multiple instances', () => {
    const packages = [
      {
        package: '@nvidia-elements/button',
        version: '1.0.0',
        downloads: 100,
        instance: 'registry.npmjs.org'
      },
      {
        package: '@nvidia-elements/button',
        version: '1.0.0',
        downloads: 50,
        instance: 'artifactory.build.nvidia.com'
      }
    ];

    const report = convertToDownloadsReport(packages);

    expect(report.packages).toHaveLength(1);
    expect(report.packages[0].totalDownloads).toBe(150);
    expect(report.packages[0].versions).toHaveLength(1);
    expect(report.packages[0].versions[0].totalDownloads).toBe(150);
    expect(report.packages[0].versions[0].instances).toHaveLength(2);
    expect(report.packages[0].instances).toHaveLength(2);
  });

  it('should sort versions in descending order', () => {
    const packages = [
      {
        package: '@nvidia-elements/button',
        version: '1.0.0',
        downloads: 100,
        instance: 'registry.npmjs.org'
      },
      {
        package: '@nvidia-elements/button',
        version: '2.0.0',
        downloads: 200,
        instance: 'registry.npmjs.org'
      },
      {
        package: '@nvidia-elements/button',
        version: '1.5.0',
        downloads: 150,
        instance: 'registry.npmjs.org'
      }
    ];

    const report = convertToDownloadsReport(packages);

    expect(report.packages[0].versions[0].version).toBe('2.0.0');
    expect(report.packages[0].versions[1].version).toBe('1.5.0');
    expect(report.packages[0].versions[2].version).toBe('1.0.0');
  });

  it('should sort packages alphabetically', () => {
    const packages = [
      {
        package: '@nvidia-elements/icon',
        version: '1.0.0',
        downloads: 50,
        instance: 'registry.npmjs.org'
      },
      {
        package: '@nvidia-elements/button',
        version: '1.0.0',
        downloads: 100,
        instance: 'registry.npmjs.org'
      },
      {
        package: '@nvidia-elements/alert',
        version: '1.0.0',
        downloads: 75,
        instance: 'registry.npmjs.org'
      }
    ];

    const report = convertToDownloadsReport(packages);

    expect(report.packages[0].package).toBe('@nvidia-elements/alert');
    expect(report.packages[1].package).toBe('@nvidia-elements/button');
    expect(report.packages[2].package).toBe('@nvidia-elements/icon');
  });

  it('should handle complex multi-package, multi-version, multi-instance scenario', () => {
    const packages = [
      {
        package: '@nvidia-elements/button',
        version: '1.0.0',
        downloads: 100,
        instance: 'registry.npmjs.org'
      },
      {
        package: '@nvidia-elements/button',
        version: '1.0.0',
        downloads: 50,
        instance: 'artifactory.build.nvidia.com'
      },
      {
        package: '@nvidia-elements/button',
        version: '2.0.0',
        downloads: 200,
        instance: 'registry.npmjs.org'
      },
      {
        package: '@nvidia-elements/icon',
        version: '1.0.0',
        downloads: 75,
        instance: 'registry.npmjs.org'
      }
    ];

    const report = convertToDownloadsReport(packages);

    expect(report.packages).toHaveLength(2);
    expect(report.totalDownloads).toBe(425);

    // Check @nvidia-elements/button
    const buttonPkg = report.packages.find(p => p.package === '@nvidia-elements/button');
    expect(buttonPkg.totalDownloads).toBe(350);
    expect(buttonPkg.versions).toHaveLength(2);
    expect(buttonPkg.instances).toHaveLength(2);

    // Check instance totals for @nvidia-elements/button
    const urmInstance = buttonPkg.instances.find(i => i.name === 'registry.npmjs.org');
    const artifactoryInstance = buttonPkg.instances.find(i => i.name === 'artifactory.build.nvidia.com');
    expect(urmInstance.totalDownloads).toBe(300);
    expect(artifactoryInstance.totalDownloads).toBe(50);
  });

  it('should handle empty package array', () => {
    const packages = [];

    const report = convertToDownloadsReport(packages);

    expect(report.packages).toHaveLength(0);
    expect(report.totalDownloads).toBe(0);
    expect(report.created).toBeDefined();
  });
});

describe('generateDownloadsReport', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should exit with error if tokens are missing', async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv };
    delete process.env.URM_ARTIFACTORY_TOKEN;
    delete process.env.MAGLEV_ARTIFACTORY_TOKEN;

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(generateDownloadsReport()).rejects.toThrow('process.exit called');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Required: URM_ARTIFACTORY_TOKEN, MAGLEV_ARTIFACTORY_TOKEN');
    expect(processExitSpy).toHaveBeenCalledWith(1);

    process.env = originalEnv;
  });

  it('should generate report with data from all sources', async () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      URM_ARTIFACTORY_TOKEN: 'urm-token',
      MAGLEV_ARTIFACTORY_TOKEN: 'elements-token'
    };

    const urmResponse = {
      results: [
        {
          repo: 'sw-ngc-unified-npm-proxy',
          path: '@nvidia-elements/button/-/@nve',
          name: 'button-1.0.0.tgz',
          stats: [{ downloads: 100 }]
        }
      ]
    };

    const elementsResponse = {
      results: [
        {
          repo: 'elements-ui-npm',
          path: '@elements/elements/-/@elements',
          name: 'elements-1.0.0.tgz',
          stats: [{ downloads: 50 }]
        }
      ]
    };

    const playgroundResponse = {
      results: [
        {
          repo: 'elements-ui-playground-npm',
          path: '@elements/elements-react/-/@elements',
          name: 'elements-react-1.0.0.tgz',
          stats: [{ downloads: 25 }]
        }
      ]
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        text: vi.fn().mockResolvedValue(JSON.stringify(urmResponse))
      })
      .mockResolvedValueOnce({
        text: vi.fn().mockResolvedValue(JSON.stringify(elementsResponse))
      })
      .mockResolvedValueOnce({
        text: vi.fn().mockResolvedValue(JSON.stringify(playgroundResponse))
      });

    const report = await generateDownloadsReport();

    expect(report.packages).toHaveLength(3);
    expect(report.totalDownloads).toBe(175);
    expect(fetch).toHaveBeenCalledTimes(3);

    // Verify correct URLs and tokens were used
    expect(fetch).toHaveBeenCalledWith(
      'https://registry.npmjs.org',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer urm-token'
        })
      })
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://artifactory.build.nvidia.com/artifactory/api/search/aql',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer elements-token'
        })
      })
    );

    process.env = originalEnv;
  });

  it('should aggregate packages from multiple sources', async () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      URM_ARTIFACTORY_TOKEN: 'urm-token',
      MAGLEV_ARTIFACTORY_TOKEN: 'elements-token'
    };

    const urmResponse = {
      results: [
        {
          repo: 'sw-ngc-unified-npm-proxy',
          path: '@nvidia-elements/button/-/@nve',
          name: 'button-1.0.0.tgz',
          stats: [{ downloads: 100 }]
        }
      ]
    };

    const elementsResponse = {
      results: [
        {
          repo: 'elements-ui-npm',
          path: '@nvidia-elements/button/-/@nve',
          name: 'button-1.0.0.tgz',
          stats: [{ downloads: 50 }]
        }
      ]
    };

    const playgroundResponse = {
      results: []
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        text: vi.fn().mockResolvedValue(JSON.stringify(urmResponse))
      })
      .mockResolvedValueOnce({
        text: vi.fn().mockResolvedValue(JSON.stringify(elementsResponse))
      })
      .mockResolvedValueOnce({
        text: vi.fn().mockResolvedValue(JSON.stringify(playgroundResponse))
      });

    const report = await generateDownloadsReport();

    expect(report.packages).toHaveLength(1);
    expect(report.packages[0].package).toBe('@nvidia-elements/button');
    expect(report.packages[0].totalDownloads).toBe(150);
    expect(report.packages[0].instances).toHaveLength(2);

    process.env = originalEnv;
  });
});
