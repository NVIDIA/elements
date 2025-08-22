import { describe, expect, it } from 'vitest';
import type { MetadataSummary } from '@internals/metadata';
import { getChangelogs, searchChangelogs } from './utils.js';

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

  it('should filter out projects without changelogs', () => {
    const metadataWithMissingChangelogs = {
      projects: {
        '@nvidia-elements/core': { changelog: '1.0.0' },
        '@nvidia-elements/monaco': { changelog: '2.0.0' },
        '@nvidia-elements/code': { changelog: undefined },
        '@nvidia-elements/styles': { changelog: null },
        '@nvidia-elements/themes': {}
      }
    } as unknown as MetadataSummary;

    expect(getChangelogs(metadataWithMissingChangelogs)).toEqual({
      '@nvidia-elements/core': '1.0.0',
      '@nvidia-elements/monaco': '2.0.0'
    });
  });

  it('should handle empty projects object', () => {
    const emptyMetadata = {
      projects: {}
    } as unknown as MetadataSummary;

    expect(getChangelogs(emptyMetadata)).toEqual({});
  });
});

describe('searchChangelogs', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': { changelog: '1.0.0' },
      '@nvidia-elements/monaco': { changelog: '2.0.0' },
      '@nvidia-elements/code': { changelog: '3.0.0' }
    }
  } as unknown as MetadataSummary;

  it('should search changelogs', () => {
    expect(searchChangelogs('elements', metadata)).toEqual('1.0.0');
    expect(searchChangelogs('monaco', metadata)).toEqual('2.0.0');
    expect(searchChangelogs('code', metadata)).toEqual('3.0.0');
    expect(searchChangelogs('elements monaco', metadata)).toEqual('1.0.0');
    expect(searchChangelogs('no-match', metadata)).toEqual(undefined);
  });

  it('should handle projects with no changelogs', () => {
    const metadataWithNoChangelogs = {
      projects: {
        '@nvidia-elements/core': { changelog: undefined },
        '@nvidia-elements/monaco': { changelog: null },
        '@nvidia-elements/code': {}
      }
    } as unknown as MetadataSummary;

    expect(searchChangelogs('elements', metadataWithNoChangelogs)).toEqual(undefined);
    expect(searchChangelogs('monaco', metadataWithNoChangelogs)).toEqual(undefined);
    expect(searchChangelogs('code', metadataWithNoChangelogs)).toEqual(undefined);
  });

  it('should handle empty query', () => {
    expect(searchChangelogs('', metadata)).toEqual(undefined);
  });

  it('should handle query with only short words', () => {
    // fuzzyMatch filters out words shorter than 3 characters
    expect(searchChangelogs('el', metadata)).toEqual(undefined);
    expect(searchChangelogs('mo', metadata)).toEqual(undefined);
  });
});
