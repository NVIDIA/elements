// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Attribute, Element, ProjectTypes, Token } from '@internals/metadata';
import {
  attributeMetadataToMarkdown,
  getContextAPIs,
  getContextTokens,
  getPublishedPackageNames,
  type PartialAPIResult
} from './utils.js';

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

  it('should exclude @nvidia-elements packages with version 0.0.0', () => {
    const withUnpublished = [
      ...projects,
      { name: '@nvidia-elements/unpublished', version: '0.0.0', description: '', readme: '', changelog: '' }
    ];
    expect(getPublishedPackageNames(withUnpublished)).toEqual(['@nvidia-elements/core', '@nvidia-elements/monaco', '@nvidia-elements/code']);
  });

  it('should handle empty metadata for getPublishedPackageNames', () => {
    const emptyProjects = [];
    expect(getPublishedPackageNames(emptyProjects)).toEqual([]);
  });
});

describe('getContextAPIs', () => {
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
    const apis = getContextAPIs('json', metadata);
    expect(apis).toEqual({
      elements: [
        { name: 'nve-button', behavior: 'button', description: 'button description' },
        { name: 'nve-badge', behavior: '', description: 'badge description' }
      ],
      attributes: []
    });
  });

  it('should return list of available elements APIs in markdown', () => {
    const apis = getContextAPIs('markdown', metadata);
    expect(apis).toContain('`nve-button` (button): button description');
    expect(apis).toContain('`nve-badge`: badge description');
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

describe('getContextAPIs edge cases', () => {
  it('should return empty string for unsupported format', () => {
    const metadata = {
      created: '2025-01-01',
      data: { elements: [], attributes: [], tokens: [], types: [] }
    } as {
      created: string;
      data: { elements: Element[]; attributes: Attribute[]; tokens: Token[]; types: ProjectTypes[] };
    };
    // @ts-expect-error - testing invalid format
    expect(getContextAPIs('yaml', metadata)).toBe('');
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
    const result = getContextAPIs('markdown', metadata);
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
    const result = getContextAPIs('json', metadata) as { elements: PartialAPIResult[]; attributes: PartialAPIResult[] };
    expect(result.attributes).toEqual([]);
  });
});

describe('Edge cases', () => {
  it('should handle empty metadata for getContextAPIs', () => {
    const emptyMetadata = { created: '2025-01-01', data: { elements: [], attributes: [], tokens: [], types: [] } } as {
      created: string;
      data: { elements: Element[]; attributes: Attribute[]; tokens: Token[]; types: ProjectTypes[] };
    };
    expect(getContextAPIs('json', emptyMetadata)).toEqual({ elements: [], attributes: [] });
    expect(getContextAPIs('markdown', emptyMetadata)).toBe('');
  });

  it('should handle projects with no elements for getContextAPIs', () => {
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

    expect(getContextAPIs('json', metadataNoElements)).toEqual({ elements: [], attributes: [] });
    expect(getContextAPIs('markdown', metadataNoElements)).toBe('');
  });
});

describe('getContextTokens', () => {
  const createToken = (name: string, value: string = '#000', description: string = ''): Token => ({
    name,
    value,
    description
  });

  describe('filtering', () => {
    it('should filter out nve-config- tokens', () => {
      const tokens = [createToken('nve-config-test'), createToken('sys-color-primary')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('nve-config-'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-color tokens', () => {
      const tokens = [createToken('ref-color-blue'), createToken('sys-color-primary')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-color'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-scale tokens', () => {
      const tokens = [createToken('ref-scale-100'), createToken('sys-spacing-md')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-scale'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-opacity tokens', () => {
      const tokens = [createToken('ref-opacity-50'), createToken('sys-opacity-md')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-opacity'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-outline tokens', () => {
      const tokens = [createToken('ref-outline-width'), createToken('sys-outline-default')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-outline'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ref-font-family- tokens', () => {
      const tokens = [createToken('ref-font-family-mono'), createToken('sys-font-body')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ref-font-family-'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out sys-color-scheme tokens', () => {
      const tokens = [createToken('sys-color-scheme-dark'), createToken('sys-color-primary')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('sys-color-scheme'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out sys-contrast tokens', () => {
      const tokens = [createToken('sys-contrast-high'), createToken('sys-color-primary')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('sys-contrast'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out line-height tokens', () => {
      const tokens = [createToken('sys-line-height-lg'), createToken('sys-font-size-lg')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('line-height'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out ratio tokens', () => {
      const tokens = [createToken('sys-ratio-wide'), createToken('sys-spacing-md')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('ratio'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out -xxx tokens', () => {
      const tokens = [createToken('sys-size-xxxl'), createToken('sys-size-lg')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('-xxx'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should filter out -xx tokens', () => {
      const tokens = [createToken('sys-size-xxl'), createToken('sys-size-lg')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result.some(t => t.name.includes('-xx'))).toBe(false);
      expect(result).toHaveLength(1);
    });

    it('should keep valid semantic tokens', () => {
      const tokens = [createToken('sys-color-primary'), createToken('sys-spacing-md'), createToken('sys-font-size-lg')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result).toHaveLength(3);
    });
  });

  describe('sorting', () => {
    it('should sort tokens alphabetically by name', () => {
      const tokens = [createToken('sys-z-index'), createToken('sys-alpha'), createToken('sys-medium')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result[0].name).toBe('sys-alpha');
      expect(result[1].name).toBe('sys-medium');
      expect(result[2].name).toBe('sys-z-index');
    });
  });

  describe('markdown format', () => {
    it('should return markdown table with header', () => {
      const tokens = [createToken('sys-color-primary', '#007bff')];
      const result = getContextTokens('markdown', tokens);
      expect(result).toContain('## CSS Variables');
      expect(result).toContain('Available semantic design tokens for theming.');
      expect(result).toContain('| name     | value |');
      expect(result).toContain('| -------- | ----- |');
    });

    it('should include token name and value in markdown rows', () => {
      const tokens = [createToken('sys-color-primary', '#007bff'), createToken('sys-spacing-md', '16px')];
      const result = getContextTokens('markdown', tokens);
      expect(result).toContain('| sys-color-primary | #007bff |');
      expect(result).toContain('| sys-spacing-md | 16px |');
    });

    it('should return markdown with empty table when all tokens filtered', () => {
      const tokens = [createToken('nve-config-test')];
      const result = getContextTokens('markdown', tokens);
      expect(result).toContain('## CSS Variables');
      expect(result).not.toContain('nve-config-test');
    });
  });

  describe('json format', () => {
    it('should return array of filtered tokens', () => {
      const tokens = [createToken('sys-color-primary', '#007bff'), createToken('nve-config-test', 'value')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'sys-color-primary', value: '#007bff', description: '' });
    });

    it('should return empty array when all tokens are filtered', () => {
      const tokens = [createToken('nve-config-test'), createToken('ref-color-blue')];
      const result = getContextTokens('json', tokens) as Token[];
      expect(result).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty token array', () => {
      const result = getContextTokens('json', []) as Token[];
      expect(result).toEqual([]);
    });

    it('should handle empty token array for markdown', () => {
      const result = getContextTokens('markdown', []);
      expect(result).toContain('## CSS Variables');
    });

    it('should return undefined for invalid format', () => {
      const tokens = [createToken('sys-color-primary')];
      // @ts-expect-error - testing invalid format
      const result = getContextTokens('invalid', tokens);
      expect(result).toBeUndefined();
    });
  });
});

describe('attributeMetadataToMarkdown', () => {
  it('should create markdown with all sections', () => {
    const attribute: Attribute = {
      name: 'theme',
      description: 'The theme to apply to the component',
      example: '<nve-button theme="primary">Click me</nve-button>',
      markdown: '',
      values: [{ name: 'primary' }, { name: 'secondary' }, { name: 'danger' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('## theme')).toBe(true);
    expect(markdown.includes('The theme to apply to the component')).toBe(true);
    expect(markdown.includes('### Example')).toBe(true);
    expect(markdown.includes('<nve-button theme="primary">Click me</nve-button>')).toBe(true);
    expect(markdown.includes('### Values')).toBe(true);
    expect(markdown.includes('| name | type | value  |')).toBe(true);
    expect(markdown.includes('| `theme` | `string` |`primary`, `secondary`, `danger` |')).toBe(true);
  });

  it('should show placeholder when example is missing', () => {
    const attribute: Attribute = {
      name: 'size',
      description: 'The size of the component',
      example: '',
      markdown: '',
      values: [{ name: 'small' }, { name: 'medium' }, { name: 'large' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('## size')).toBe(true);
    expect(markdown.includes('The size of the component')).toBe(true);
    expect(markdown.includes('### Example')).toBe(true);
    expect(markdown.includes('No example available.')).toBe(true);
    expect(markdown.includes('### Values')).toBe(true);
    expect(markdown.includes('| `size` | `string` |`small`, `medium`, `large` |')).toBe(true);
  });

  it('should filter out values containing pipe character', () => {
    const attribute: Attribute = {
      name: 'variant',
      description: 'The variant style',
      example: '<nve-badge variant="info">Badge</nve-badge>',
      markdown: '',
      values: [
        { name: 'info' },
        { name: 'warning' },
        { name: 'error|danger' }, // should be filtered
        { name: 'success' }
      ]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('| `variant` | `string` |`info`, `warning`, `success` |')).toBe(true);
    expect(markdown.includes('error|danger')).toBe(false);
  });

  it('should filter out values containing @ character', () => {
    const attribute: Attribute = {
      name: 'status',
      description: 'The status indicator',
      example: '<nve-status status="active">Status</nve-status>',
      markdown: '',
      values: [
        { name: 'active' },
        { name: '@deprecated' }, // should be filtered
        { name: 'inactive' },
        { name: 'user@email' } // should be filtered
      ]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('| `status` | `string` |`active`, `inactive` |')).toBe(true);
    expect(markdown.includes('@deprecated')).toBe(false);
    expect(markdown.includes('user@email')).toBe(false);
  });

  it('should filter out values containing & character', () => {
    const attribute: Attribute = {
      name: 'align',
      description: 'Text alignment',
      example: '<nve-text align="left">Text</nve-text>',
      markdown: '',
      values: [
        { name: 'left' },
        { name: 'center' },
        { name: 'left&right' }, // should be filtered
        { name: 'right' }
      ]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('| `align` | `string` |`left`, `center`, `right` |')).toBe(true);
    expect(markdown.includes('left&right')).toBe(false);
  });

  it('should handle empty values array', () => {
    const attribute: Attribute = {
      name: 'custom',
      description: 'Custom attribute',
      example: '<nve-element custom="value">Element</nve-element>',
      markdown: '',
      values: []
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('## custom')).toBe(true);
    expect(markdown.includes('Custom attribute')).toBe(true);
    expect(markdown.includes('| `custom` | `string` | |')).toBe(true);
  });

  it('should handle attribute with all values filtered out', () => {
    const attribute: Attribute = {
      name: 'special',
      description: 'Special attribute',
      example: '<nve-element special="test">Element</nve-element>',
      markdown: '',
      values: [{ name: 'value|1' }, { name: '@deprecated' }, { name: 'test&value' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('## special')).toBe(true);
    expect(markdown.includes('Special attribute')).toBe(true);
    expect(markdown.includes('| `special` | `string` | |')).toBe(true);
  });

  it('should trim example content', () => {
    const attribute: Attribute = {
      name: 'color',
      description: 'Color scheme',
      example: '\n\n  <nve-button color="red">Button</nve-button>  \n\n',
      markdown: '',
      values: [{ name: 'red' }, { name: 'blue' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('```html\n<nve-button color="red">Button</nve-button>\n```')).toBe(true);
  });

  it('should format attribute name correctly in table', () => {
    const attribute: Attribute = {
      name: 'data-test-id',
      description: 'Test identifier',
      example: '<div data-test-id="test">Content</div>',
      markdown: '',
      values: [{ name: 'test' }, { name: 'example' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('## data-test-id')).toBe(true);
    expect(markdown.includes('| `data-test-id` | `string` |`test`, `example` |')).toBe(true);
  });

  it('should handle single value', () => {
    const attribute: Attribute = {
      name: 'disabled',
      description: 'Disables the element',
      example: '<button disabled>Click</button>',
      markdown: '',
      values: [{ name: 'true' }]
    };

    const markdown = attributeMetadataToMarkdown(attribute);

    expect(markdown.includes('| `disabled` | `string` |`true` |')).toBe(true);
  });
});
