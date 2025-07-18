import { describe, expect, it } from 'vitest';
import type { MetadataSummary } from '@internals/metadata';
import {
  getAvailableElementsAPIs,
  getChangelogs,
  getPublishedPackageNames,
  searchChangelogs,
  searchTagNames
} from './api.js';

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

describe('getAvailableElementsAPIs', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        elements: [
          { name: 'nve-button', manifest: { description: 'button description' } },
          { name: 'nve-badge', manifest: { description: 'badge description' } },
          { name: 'nve-deprecated', manifest: { description: 'deprecated', deprecated: 'true' } },
          { name: 'nve-no-description', manifest: {} }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should return list of available elements APIs', () => {
    const apis = getAvailableElementsAPIs(metadata);
    expect(apis.length).toEqual(2);
    expect(apis).toEqual([
      { name: 'nve-button', description: 'button description' },
      { name: 'nve-badge', description: 'badge description' }
    ]);
  });
});
