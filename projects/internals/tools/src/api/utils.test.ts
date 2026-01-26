import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Attribute, Element, ProjectTypes, Token } from '@internals/metadata';
import { getPublicAPIs, getPublishedPackageNames } from './utils.js';

describe('getPublishedPackageNames', () => {
  const projects = [
    {
      name: '@nvidia-elements/core',
      version: '1.0.0',
      description: 'elements description',
      readme: 'elements readme',
      changelog: 'elements changelog'
    },
    {
      name: '@nvidia-elements/monaco',
      version: '1.0.0',
      description: 'monaco description',
      readme: 'monaco readme',
      changelog: 'monaco changelog'
    },
    {
      name: '@nvidia-elements/code',
      version: '1.0.0',
      description: 'code description',
      readme: 'code readme',
      changelog: 'code changelog'
    },
    {
      name: '@internals/metadata',
      version: '0.0.0',
      description: 'metadata description',
      readme: 'metadata readme',
      changelog: 'metadata changelog'
    }
  ];

  it('should get published package names', () => {
    expect(getPublishedPackageNames(projects)).toEqual(['@nvidia-elements/core', '@nvidia-elements/monaco', '@nvidia-elements/code']);
  });
});

describe('getAvailableAPIs', () => {
  const metadata = {
    created: '2025-01-01',
    data: {
      elements: [
        { name: 'nve-button', manifest: { description: 'button description', metadata: { behavior: 'button' } } },
        { name: 'nve-badge', manifest: { description: 'badge description' } },
        { name: 'nve-deprecated', manifest: { description: 'deprecated', deprecated: 'true' } },
        { name: 'nve-no-description', manifest: {} }
      ],
      attributes: [],
      tokens: [],
      types: []
    }
  } as {
    created: string;
    data: { elements: Element[]; attributes: Attribute[]; tokens: Token[]; types: ProjectTypes[] };
  };

  it('should return list of available elements APIs in JSON', () => {
    const apis = getPublicAPIs('json', metadata);
    expect(apis).toEqual({
      elements: [
        { name: 'nve-button', behavior: 'button', description: 'button description' },
        { name: 'nve-badge', behavior: '', description: 'badge description' }
      ],
      attributes: []
    });
  });

  it('should return list of available elements APIs in markdown', () => {
    const apis = getPublicAPIs('markdown', metadata);
    expect(apis).toContain('- **nve-button (button)**: button description');
    expect(apis).toContain('- **nve-badge**: badge description');
  });
});

describe('Edge cases', () => {
  it('should handle empty metadata for getAvailableAPIs', () => {
    const emptyMetadata = { created: '2025-01-01', data: { elements: [], attributes: [], tokens: [], types: [] } } as {
      created: string;
      data: { elements: Element[]; attributes: Attribute[]; tokens: Token[]; types: ProjectTypes[] };
    };
    expect(getPublicAPIs('json', emptyMetadata)).toEqual({ elements: [], attributes: [] });
    expect(getPublicAPIs('markdown', emptyMetadata)).toBe('');
  });

  it('should handle projects with no elements for getAvailableAPIs', () => {
    const metadataNoElements = {
      created: '2025-01-01',
      data: {
        elements: [],
        attributes: [],
        tokens: [],
        types: []
      }
    } as {
      created: string;
      data: { elements: Element[]; attributes: Attribute[]; tokens: Token[]; types: ProjectTypes[] };
    };

    expect(getPublicAPIs('json', metadataNoElements)).toEqual({ elements: [], attributes: [] });
    expect(getPublicAPIs('markdown', metadataNoElements)).toBe('');
  });

  it('should handle empty metadata for getPublishedPackageNames', () => {
    const emptyProjects = [];
    expect(getPublishedPackageNames(emptyProjects)).toEqual([]);
  });
});

describe('getLatestPublishedVersions', () => {
  const projects = [{ name: '@nvidia-elements/core', version: '1.0.0', description: '', readme: '', changelog: '' }];

  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should throw error when fetch fails and ELEMENTS_ENV is mcp', async () => {
    vi.stubEnv('ELEMENTS_ENV', 'mcp');
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const { getLatestPublishedVersions } = await import('./utils.js');

    await expect(getLatestPublishedVersions(projects)).rejects.toThrow(
      'Could not fetch latest versions from https://esm.nvidia.com'
    );
  });

  it('should return fallback version and warn when fetch fails and ELEMENTS_ENV is not mcp', async () => {
    vi.stubEnv('ELEMENTS_ENV', 'dev');
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getLatestPublishedVersions } = await import('./utils.js');

    const result = await getLatestPublishedVersions(projects);

    expect(warnSpy).toHaveBeenCalledWith('Could not fetch latest versions from https://esm.nvidia.com');
    expect(result).toEqual({ '@nvidia-elements/core': '0.0.0' });
  });
});
