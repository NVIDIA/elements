import { describe, expect, it } from 'vitest';
import type { Attribute, Element, ProjectTypes, Token } from '@nve-internals/metadata';
import { getAvailableAPIs, getPublishedPackageNames } from './utils.js';

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
      name: '@nve-internals/metadata',
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
    const apis = getAvailableAPIs('json', metadata);
    expect(apis).toEqual({
      elements: [
        { name: 'nve-button', behavior: 'button', description: 'button description' },
        { name: 'nve-badge', behavior: '', description: 'badge description' }
      ],
      attributes: []
    });
  });

  it('should return list of available elements APIs in markdown', () => {
    const apis = getAvailableAPIs('markdown', metadata);
    expect(apis).toContain('## nve-button (button)\n\nbutton description');
    expect(apis).toContain('## nve-badge\n\nbadge description');
  });
});

describe('Edge cases', () => {
  it('should handle empty metadata for getAvailableAPIs', () => {
    const emptyMetadata = { created: '2025-01-01', data: { elements: [], attributes: [], tokens: [], types: [] } } as {
      created: string;
      data: { elements: Element[]; attributes: Attribute[]; tokens: Token[]; types: ProjectTypes[] };
    };
    expect(getAvailableAPIs('json', emptyMetadata)).toEqual({ elements: [], attributes: [] });
    expect(getAvailableAPIs('markdown', emptyMetadata)).toBe('');
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

    expect(getAvailableAPIs('json', metadataNoElements)).toEqual({ elements: [], attributes: [] });
    expect(getAvailableAPIs('markdown', metadataNoElements)).toBe('');
  });

  it('should handle empty metadata for getPublishedPackageNames', () => {
    const emptyProjects = [];
    expect(getPublishedPackageNames(emptyProjects)).toEqual([]);
  });
});
