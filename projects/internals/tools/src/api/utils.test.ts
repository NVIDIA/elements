// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Attribute, Element, ProjectTypes, Token } from '@internals/metadata';
import { getPublicAPIs, getPublishedPackageNames, getSemanticTokens, type PartialAPIResult } from './utils.js';

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

  it('should exclude @nve packages with version 0.0.0', () => {
    const withUnpublished = [
      ...projects,
      { name: '@nvidia-elements/unpublished', version: '0.0.0', description: '', readme: '', changelog: '' }
    ];
    expect(getPublishedPackageNames(withUnpublished)).toEqual(['@nvidia-elements/core', '@nvidia-elements/monaco', '@nvidia-elements/code']);
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
    expect(apis).toContain('`nve-button` (button): button description');
    expect(apis).toContain('`nve-badge`: badge description');
  });
});

describe('getPublicAPIs edge cases', () => {
  it('should return empty string for unsupported format', () => {
    const metadata = {
      created: '2025-01-01',
      data: { elements: [], attributes: [], tokens: [], types: [] }
    } as {
      created: string;
      data: { elements: Element[]; attributes: Attribute[]; tokens: Token[]; types: ProjectTypes[] };
    };
    // @ts-expect-error - testing invalid format
    expect(getPublicAPIs('yaml', metadata)).toBe('');
  });

  it('should handle attributes with description and example', () => {
    const metadata = {
      created: '2025-01-01',
      data: {
        elements: [],
        attributes: [{ name: 'nve-layout', description: 'Layout utility', example: '<div nve-layout>' }],
        tokens: [],
        types: []
      }
    } as {
      created: string;
      data: { elements: Element[]; attributes: Attribute[]; tokens: Token[]; types: ProjectTypes[] };
    };
    const result = getPublicAPIs('markdown', metadata);
    expect(result).toContain('`nve-layout` (attribute): Layout utility');
  });

  it('should filter out attributes without example', () => {
    const metadata = {
      created: '2025-01-01',
      data: {
        elements: [],
        attributes: [{ name: 'nve-layout', description: 'Layout utility' }],
        tokens: [],
        types: []
      }
    } as {
      created: string;
      data: { elements: Element[]; attributes: Attribute[]; tokens: Token[]; types: ProjectTypes[] };
    };
    const result = getPublicAPIs('json', metadata) as { elements: PartialAPIResult[]; attributes: PartialAPIResult[] };
    expect(result.attributes).toEqual([]);
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

    // when ELEMENTS_ESM_CDN_BASE_URL is not configured, fetch is skipped and fallback version is returned
    try {
      const result = await getLatestPublishedVersions(projects);
      expect(result).toEqual({ '@nvidia-elements/core': '0.0.0' });
    } catch (e) {
      expect((e as Error).message).toContain('Could not fetch latest versions from');
    }
  });

  it('should return fallback version and warn when fetch fails and ELEMENTS_ENV is not mcp', async () => {
    vi.stubEnv('ELEMENTS_ENV', 'dev');
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getLatestPublishedVersions } = await import('./utils.js');

    const result = await getLatestPublishedVersions(projects);

    // when ELEMENTS_ESM_CDN_BASE_URL is configured, fetch fails and triggers a warning
    if (warnSpy.mock.calls.length > 0) {
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Could not fetch latest versions from'));
    }
    expect(result).toEqual({ '@nvidia-elements/core': '0.0.0' });
  });
});

describe('getSemanticTokens', () => {
  const createToken = (name: string, value: string = '#000', description: string = ''): Token => ({
    name,
    value,
    description
  });

  describe('filtering', () => {
    it('should filter out nve-config- tokens', () => {
      const tokens = [createToken('nve-config-test'), createToken('sys-color-primary')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('nve-config-'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-color tokens', () => {
      const tokens = [createToken('ref-color-blue'), createToken('sys-color-primary')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-color'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-scale tokens', () => {
      const tokens = [createToken('ref-scale-100'), createToken('sys-spacing-md')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-scale'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-opacity tokens', () => {
      const tokens = [createToken('ref-opacity-50'), createToken('sys-opacity-md')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-opacity'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-outline tokens', () => {
      const tokens = [createToken('ref-outline-width'), createToken('sys-outline-default')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-outline'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-font-family- tokens', () => {
      const tokens = [createToken('ref-font-family-mono'), createToken('sys-font-body')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-font-family-'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out sys-color-scheme tokens', () => {
      const tokens = [createToken('sys-color-scheme-dark'), createToken('sys-color-primary')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('sys-color-scheme'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out sys-contrast tokens', () => {
      const tokens = [createToken('sys-contrast-high'), createToken('sys-color-primary')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('sys-contrast'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out line-height tokens', () => {
      const tokens = [createToken('sys-line-height-lg'), createToken('sys-font-size-lg')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('line-height'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ratio tokens', () => {
      const tokens = [createToken('sys-ratio-wide'), createToken('sys-spacing-md')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ratio'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out -xxx tokens', () => {
      const tokens = [createToken('sys-size-xxxl'), createToken('sys-size-lg')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('-xxx'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out -xx tokens', () => {
      const tokens = [createToken('sys-size-xxl'), createToken('sys-size-lg')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('-xx'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should keep valid semantic tokens', () => {
      const tokens = [createToken('sys-color-primary'), createToken('sys-spacing-md'), createToken('sys-font-size-lg')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result).toHaveLength(3);
    });
  });

  describe('sorting', () => {
    it('should sort tokens alphabetically by name', () => {
      const tokens = [createToken('sys-z-index'), createToken('sys-alpha'), createToken('sys-medium')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result[0].name).toBe('sys-alpha');
      expect(result[1].name).toBe('sys-medium');
      expect(result[2].name).toBe('sys-z-index');
    });
  });

  describe('markdown format', () => {
    it('should return markdown table with header', () => {
      const tokens = [createToken('sys-color-primary', '#007bff')];
      const result = getSemanticTokens('markdown', tokens);
      expect(result).toContain('## CSS Variables');
      expect(result).toContain('Available semantic design tokens for theming.');
      expect(result).toContain('| name     | value |');
      expect(result).toContain('| -------- | ----- |');
    });

    it('should include token name and value in markdown rows', () => {
      const tokens = [createToken('sys-color-primary', '#007bff'), createToken('sys-spacing-md', '16px')];
      const result = getSemanticTokens('markdown', tokens);
      expect(result).toContain('| sys-color-primary | #007bff |');
      expect(result).toContain('| sys-spacing-md | 16px |');
    });

    it('should return markdown with empty table when all tokens filtered', () => {
      const tokens = [createToken('nve-config-test')];
      const result = getSemanticTokens('markdown', tokens);
      expect(result).toContain('## CSS Variables');
      expect(result).not.toContain('nve-config-test');
    });
  });

  describe('json format', () => {
    it('should return array of filtered tokens', () => {
      const tokens = [createToken('sys-color-primary', '#007bff'), createToken('nve-config-test', 'value')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'sys-color-primary', value: '#007bff', description: '' });
    });

    it('should return empty array when all tokens are filtered', () => {
      const tokens = [createToken('nve-config-test'), createToken('ref-color-blue')];
      const result = getSemanticTokens('json', tokens) as Token[];
      expect(result).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty token array', () => {
      const result = getSemanticTokens('json', []) as Token[];
      expect(result).toEqual([]);
    });

    it('should handle empty token array for markdown', () => {
      const result = getSemanticTokens('markdown', []);
      expect(result).toContain('## CSS Variables');
    });

    it('should return undefined for invalid format', () => {
      const tokens = [createToken('sys-color-primary')];
      // @ts-expect-error - testing invalid format
      const result = getSemanticTokens('invalid', tokens);
      expect(result).toBeUndefined();
    });
  });
});
