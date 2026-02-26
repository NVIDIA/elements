import { describe, expect, it, vi } from 'vitest';
import { searchChangelogs, findPublicAPIChangelog, limitChangelogVersions } from './utils.js';

vi.mock('@internals/metadata', () => ({
  ApiService: { search: vi.fn() }
}));

describe('searchChangelogs', () => {
  const changelogs = {
    '@nvidia-elements/core': '1.0.0',
    '@nvidia-elements/monaco': '2.0.0',
    '@nvidia-elements/code': '3.0.0'
  };

  it('should search changelogs', () => {
    expect(searchChangelogs('elements', changelogs)).toEqual('1.0.0');
    expect(searchChangelogs('monaco', changelogs)).toEqual('2.0.0');
    expect(searchChangelogs('code', changelogs)).toEqual('3.0.0');
    expect(searchChangelogs('elements monaco', changelogs)).toEqual('1.0.0');
    expect(searchChangelogs('no-match', changelogs)).toEqual(undefined);
  });

  it('should handle projects with no changelogs', () => {
    const changelogsWithNoChangelogs = {
      projects: {
        '@nvidia-elements/core': undefined,
        '@nvidia-elements/monaco': null,
        '@nvidia-elements/code': undefined
      }
    } as unknown as { [key: string]: string };

    expect(searchChangelogs('elements', changelogsWithNoChangelogs)).toEqual(undefined);
    expect(searchChangelogs('monaco', changelogsWithNoChangelogs)).toEqual(undefined);
    expect(searchChangelogs('code', changelogsWithNoChangelogs)).toEqual(undefined);
  });

  it('should prefer exact match over fuzzy match', () => {
    const scoped = {
      '@nvidia-elements/behaviors-alpine': 'behaviors-alpine-changelog',
      '@nvidia-elements/lint': 'lint-changelog',
      '@nvidia-elements/forms': 'forms-changelog'
    };
    expect(searchChangelogs('@nvidia-elements/lint', scoped)).toBe('lint-changelog');
    expect(searchChangelogs('@nvidia-elements/forms', scoped)).toBe('forms-changelog');
    expect(searchChangelogs('@nvidia-elements/behaviors-alpine', scoped)).toBe('behaviors-alpine-changelog');
  });

  it('should match by substring when no exact match', () => {
    const scoped = {
      '@nvidia-elements/behaviors-alpine': 'behaviors-alpine-changelog',
      '@nvidia-elements/lint': 'lint-changelog'
    };
    expect(searchChangelogs('lint', scoped)).toBe('lint-changelog');
    expect(searchChangelogs('behaviors-alpine', scoped)).toBe('behaviors-alpine-changelog');
  });

  it('should handle empty query', () => {
    expect(searchChangelogs('', changelogs)).toEqual(undefined);
  });

  it('should match short substrings', () => {
    // substring match finds these even though fuzzyMatch would filter them out
    expect(searchChangelogs('el', changelogs)).toEqual('1.0.0');
    expect(searchChangelogs('mo', changelogs)).toEqual('2.0.0');
  });
});

describe('limitChangelogVersions', () => {
  const changelog = [
    '## [v3.0.0](url) (2026-03-01)',
    '### Features',
    '* new feature',
    '',
    '## [v2.0.0](url) (2026-02-01)',
    '### Bug Fixes',
    '* fix bug',
    '',
    '## [v1.0.0](url) (2026-01-01)',
    '### Initial Release',
    '* init'
  ].join('\n');

  it('should return all versions when limit exceeds total count', () => {
    const result = limitChangelogVersions(changelog, 10);
    expect(result).toContain('v3.0.0');
    expect(result).toContain('v2.0.0');
    expect(result).toContain('v1.0.0');
  });

  it('should return first N versions when limit is less than total', () => {
    const result = limitChangelogVersions(changelog, 2);
    expect(result).toContain('v3.0.0');
    expect(result).toContain('v2.0.0');
    expect(result).not.toContain('v1.0.0');
  });

  it('should preserve preamble text before first version header', () => {
    const withPreamble = '# Changelog\n\nAll notable changes.\n\n' + changelog;
    const result = limitChangelogVersions(withPreamble, 1);
    expect(result).toContain('# Changelog');
    expect(result).toContain('All notable changes.');
    expect(result).toContain('v3.0.0');
    expect(result).not.toContain('v2.0.0');
  });

  it('should handle changelog with no version headers', () => {
    const noHeaders = 'Just some text\nwith no headers';
    expect(limitChangelogVersions(noHeaders, 5)).toBe(noHeaders);
  });

  it('should handle empty string', () => {
    expect(limitChangelogVersions('', 5)).toBe('');
  });
});

describe('findPublicAPIChangelog', () => {
  it('should return changelog when element is found', async () => {
    const { ApiService } = await import('@internals/metadata');
    vi.mocked(ApiService.search).mockResolvedValue([
      { name: 'nve-button', changelog: '## 1.0.0\n- Initial release' }
    ] as never);

    const result = await findPublicAPIChangelog('nve-button');
    expect(result).toBe('## 1.0.0\n- Initial release');
  });

  it('should return JSON string when result has no changelog', async () => {
    const { ApiService } = await import('@internals/metadata');
    const attribute = { name: 'nve-layout', description: 'Layout attribute' };
    vi.mocked(ApiService.search).mockResolvedValue([attribute] as never);

    const result = await findPublicAPIChangelog('nve-layout');
    expect(result).toBe(JSON.stringify(attribute, null, 2));
  });

  it('should return undefined when no matching result is found', async () => {
    const { ApiService } = await import('@internals/metadata');
    vi.mocked(ApiService.search).mockResolvedValue([{ name: 'nve-badge', changelog: '## 1.0.0' }] as never);

    const result = await findPublicAPIChangelog('nve-button');
    expect(result).toBeUndefined();
  });

  it('should return undefined when search returns empty results', async () => {
    const { ApiService } = await import('@internals/metadata');
    vi.mocked(ApiService.search).mockResolvedValue([] as never);

    const result = await findPublicAPIChangelog('nve-button');
    expect(result).toBeUndefined();
  });
});
