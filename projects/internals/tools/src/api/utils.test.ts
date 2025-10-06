import { describe, expect, it } from 'vitest';
import type { MetadataSummary } from '@nve-internals/metadata';
import {
  getAvailableAPIs,
  getPublishedPackageNames,
  searchTagNames,
  searchAPIs,
  type PartialAPIResult
} from './utils.js';

describe('getPublishedPackageNames', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': { version: '1.0.0' },
      '@nvidia-elements/monaco': { version: '1.0.0' },
      '@nvidia-elements/code': { version: '1.0.0' },
      '@nve-internals/metadata': { version: '0.0.0' }
    }
  } as unknown as MetadataSummary;

  it('should get published package names', () => {
    expect(getPublishedPackageNames(metadata)).toEqual(['@nvidia-elements/core', '@nvidia-elements/monaco', '@nvidia-elements/code']);
  });
});

describe('searchTagNames', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        elements: [{ name: 'nve-button' }, { name: 'nve-badge' }, { name: 'nve-grid' }, { name: 'nve-grid-cell' }],
        attributes: []
      }
    }
  } as unknown as MetadataSummary;

  it('should search tag names', () => {
    expect(searchTagNames('nve-button', metadata)).toEqual(['nve-button']);
    expect(searchTagNames('nve-badge', metadata)).toEqual(['nve-badge']);
    expect(searchTagNames('nve-button and nve-badge', metadata)).toEqual(['nve-button', 'nve-badge']);
    expect(searchTagNames('nve-grid', metadata)).toEqual(['nve-grid', 'nve-grid-cell']);
    expect(searchTagNames('nve-grid-cell', metadata)).toEqual(['nve-grid', 'nve-grid-cell']);
    expect(searchTagNames('no-match', metadata)).toEqual([]);
    expect(searchTagNames('nve-no-match', metadata)).toEqual([]);
  });
});

describe('searchTagNames - overlapping words', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        elements: [
          { name: 'nve-card' },
          { name: 'nve-card-header' },
          { name: 'nve-card-content' },
          { name: 'nve-card-footer' },
          { name: 'nve-accordion' },
          { name: 'nve-accordion-group' },
          { name: 'nve-accordion-header' },
          { name: 'nve-accordion-content' }
        ],
        attributes: []
      }
    }
  } as unknown as MetadataSummary;

  it('should search tag names with overlapping words', () => {
    expect(searchTagNames('nve-card how to use card component with header and content', metadata)).toEqual([
      'nve-card',
      'nve-card-header',
      'nve-card-content',
      'nve-card-footer'
    ]);
  });
});

describe('getAvailableAPIs', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        elements: [
          { name: 'nve-button', manifest: { description: 'button description', metadata: { behavior: 'button' } } },
          { name: 'nve-badge', manifest: { description: 'badge description' } },
          { name: 'nve-deprecated', manifest: { description: 'deprecated', deprecated: 'true' } },
          { name: 'nve-no-description', manifest: {} }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should return list of available elements APIs in JSON', () => {
    const apis = getAvailableAPIs('json', metadata) as { elements: PartialAPIResult[]; attributes: PartialAPIResult[] };
    expect(apis.elements.length).toEqual(2);
    expect(apis.elements).toEqual([
      { name: 'nve-button', behavior: 'button', description: 'button description' },
      { name: 'nve-badge', behavior: '', description: 'badge description' }
    ]);
  });

  it('should return list of available elements APIs in markdown', () => {
    const apis = getAvailableAPIs('markdown', metadata);
    expect(apis).toContain('## nve-button (button)\n\nbutton description');
    expect(apis).toContain('## nve-badge\n\nbadge description');
  });
});

describe('searchElementsAPIs', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        elements: [
          {
            name: 'nve-button',
            manifest: { tagName: 'nve-button', description: 'button description', deprecated: false },
            markdown: '## nve-button\n\nbutton description'
          },
          {
            name: 'nve-badge',
            manifest: { tagName: 'nve-badge', description: 'badge description', deprecated: false },
            markdown: '## nve-badge\n\nbadge description'
          }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should search elements APIs in JSON', () => {
    expect(searchAPIs('button', 'json', metadata)).toEqual({
      elements: [{ tagName: 'nve-button', description: 'button description', deprecated: false }],
      attributes: []
    });
  });

  it('should search elements APIs in markdown', () => {
    const result = searchAPIs('button', 'markdown', metadata);
    expect(result).toBe('## nve-button\n\nbutton description');
  });

  it('should search by tag name', () => {
    expect(searchAPIs('nve-badge', 'json', metadata)).toEqual({
      elements: [{ tagName: 'nve-badge', description: 'badge description', deprecated: false }],
      attributes: []
    });
  });

  it('should return empty array for no matches in JSON', () => {
    expect(searchAPIs('no-match', 'json', metadata)).toEqual({ elements: [], attributes: [] });
  });

  it('should return empty string for no matches in markdown', () => {
    expect(searchAPIs('no-match', 'markdown', metadata)).toBe('');
  });

  it('should filter out deprecated elements', () => {
    const metadataWithDeprecated = {
      projects: {
        '@nvidia-elements/core': {
          elements: [
            {
              name: 'nve-button',
              manifest: { tagName: 'nve-button', description: 'button description', deprecated: false },
              markdown: '## nve-button\n\nbutton description'
            },
            {
              name: 'nve-deprecated',
              manifest: { tagName: 'nve-deprecated', description: 'deprecated', deprecated: true },
              markdown: '## nve-deprecated\n\ndeprecated'
            }
          ]
        }
      }
    } as unknown as MetadataSummary;

    expect(searchAPIs('deprecated', 'json', metadataWithDeprecated)).toEqual({ elements: [], attributes: [] });
  });
});

describe('Edge cases', () => {
  it('should handle empty metadata for getAvailableAPIs', () => {
    const emptyMetadata = { projects: {} } as unknown as MetadataSummary;
    expect(getAvailableAPIs('json', emptyMetadata)).toEqual({ elements: [], attributes: [] });
    expect(getAvailableAPIs('markdown', emptyMetadata)).toBe('');
  });

  it('should handle projects with no elements for getAvailableAPIs', () => {
    const metadataNoElements = {
      projects: {
        '@nvidia-elements/core': { elements: [], attributes: [] }
      }
    } as unknown as MetadataSummary;

    expect(getAvailableAPIs('json', metadataNoElements)).toEqual({ elements: [], attributes: [] });
    expect(getAvailableAPIs('markdown', metadataNoElements)).toBe('');
  });

  it('should handle empty metadata for searchTagNames', () => {
    const emptyMetadata = { projects: {} } as unknown as MetadataSummary;
    expect(searchTagNames('query', emptyMetadata)).toEqual([]);
  });

  it('should handle projects with no elements for searchTagNames', () => {
    const metadataNoElements = {
      projects: {
        '@nvidia-elements/core': { elements: [], attributes: [] }
      }
    } as unknown as MetadataSummary;

    expect(searchTagNames('query', metadataNoElements)).toEqual([]);
  });

  it('should handle empty metadata for getPublishedPackageNames', () => {
    const emptyMetadata = { projects: {} } as unknown as MetadataSummary;
    expect(getPublishedPackageNames(emptyMetadata)).toEqual([]);
  });
});
