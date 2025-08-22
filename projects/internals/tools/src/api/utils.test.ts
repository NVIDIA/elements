import { describe, expect, it } from 'vitest';
import type { MetadataSummary } from '@internals/metadata';
import {
  getAvailableAPIs,
  getChangelogs,
  getPublishedPackageNames,
  searchChangelogs,
  searchTagNames,
  searchAPIs
} from './utils.js';

describe('getPublishedPackageNames', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': { version: '1.0.0' },
      '@nvidia-elements/monaco': { version: '1.0.0' },
      '@nvidia-elements/code': { version: '1.0.0' },
      '@internals/metadata': { version: '0.0.0' }
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
        elements: [{ name: 'nve-button' }, { name: 'nve-badge' }, { name: 'nve-grid' }, { name: 'nve-grid-cell' }]
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

describe('getChangelogs', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': { changelog: '1.0.0' },
      '@nvidia-elements/monaco': { changelog: '1.0.0' },
      '@nvidia-elements/code': { changelog: '1.0.0' }
    }
  } as unknown as MetadataSummary;

  it('should get changelogs', async () => {
    expect(getChangelogs(metadata)).toEqual({
      '@nvidia-elements/core': '1.0.0',
      '@nvidia-elements/monaco': '1.0.0',
      '@nvidia-elements/code': '1.0.0'
    });
  });
});

describe('searchChangelogs', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': { changelog: '1.0.0' },
      '@nvidia-elements/monaco': { changelog: '1.0.0' },
      '@nvidia-elements/code': { changelog: '1.0.0' }
    }
  } as unknown as MetadataSummary;

  it('should search changelogs', () => {
    expect(searchChangelogs('monaco', metadata)).toEqual({ '@nvidia-elements/monaco': '1.0.0' });
    expect(searchChangelogs('elements', metadata)).toEqual({ '@nvidia-elements/core': '1.0.0' });
    expect(searchChangelogs('code', metadata)).toEqual({ '@nvidia-elements/code': '1.0.0' });
    expect(searchChangelogs('elements monaco', metadata)).toEqual({
      '@nvidia-elements/core': '1.0.0',
      '@nvidia-elements/monaco': '1.0.0'
    });
    expect(searchChangelogs('no-match', metadata)).toEqual({
      '@nvidia-elements/core': '1.0.0',
      '@nvidia-elements/monaco': '1.0.0',
      '@nvidia-elements/code': '1.0.0'
    });
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
    const apis = getAvailableAPIs('json', metadata);
    expect(apis.length).toEqual(2);
    expect(apis).toEqual([
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
    expect(searchAPIs('button', 'json', metadata)).toEqual([
      { tagName: 'nve-button', description: 'button description', deprecated: false }
    ]);
  });

  it('should search elements APIs in markdown', () => {
    const result = searchAPIs('button', 'markdown', metadata);
    expect(result).toBe('## nve-button\n\nbutton description');
  });

  it('should search by tag name', () => {
    expect(searchAPIs('nve-badge', 'json', metadata)).toEqual([
      { tagName: 'nve-badge', description: 'badge description', deprecated: false }
    ]);
  });

  it('should return empty array for no matches in JSON', () => {
    expect(searchAPIs('no-match', 'json', metadata)).toEqual([]);
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

    expect(searchAPIs('deprecated', 'json', metadataWithDeprecated)).toEqual([]);
  });
});

describe('Edge cases', () => {
  it('should handle empty metadata for getAvailableAPIs', () => {
    const emptyMetadata = { projects: {} } as unknown as MetadataSummary;
    expect(getAvailableAPIs('json', emptyMetadata)).toEqual([]);
    expect(getAvailableAPIs('markdown', emptyMetadata)).toBe('');
  });

  it('should handle projects with no elements for getAvailableAPIs', () => {
    const metadataNoElements = {
      projects: {
        '@nvidia-elements/core': { elements: [] }
      }
    } as unknown as MetadataSummary;

    expect(getAvailableAPIs('json', metadataNoElements)).toEqual([]);
    expect(getAvailableAPIs('markdown', metadataNoElements)).toBe('');
  });

  it('should handle empty metadata for searchTagNames', () => {
    const emptyMetadata = { projects: {} } as unknown as MetadataSummary;
    expect(searchTagNames('query', emptyMetadata)).toEqual([]);
  });

  it('should handle projects with no elements for searchTagNames', () => {
    const metadataNoElements = {
      projects: {
        '@nvidia-elements/core': { elements: [] }
      }
    } as unknown as MetadataSummary;

    expect(searchTagNames('query', metadataNoElements)).toEqual([]);
  });

  it('should handle empty metadata for getChangelogs', () => {
    const emptyMetadata = { projects: {} } as unknown as MetadataSummary;
    expect(getChangelogs(emptyMetadata)).toEqual({});
  });

  it('should handle empty metadata for searchChangelogs', () => {
    const emptyMetadata = { projects: {} } as unknown as MetadataSummary;
    expect(searchChangelogs('query', emptyMetadata)).toEqual({});
  });

  it('should handle empty metadata for getPublishedPackageNames', () => {
    const emptyMetadata = { projects: {} } as unknown as MetadataSummary;
    expect(getPublishedPackageNames(emptyMetadata)).toEqual([]);
  });
});
