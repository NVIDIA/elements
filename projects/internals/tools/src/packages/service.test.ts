import { describe, expect, it, vi } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { PackagesService, searchChangelogs } from './service.js';

vi.mock('../api/utils.js', async importOriginal => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getLatestPublishedVersions: vi.fn().mockResolvedValue({
      '@nvidia-elements/core': '1.0.0',
      '@nvidia-elements/themes': '1.0.0'
    })
  };
});

describe('PackagesService', () => {
  it('should provide changelogs list tool', async () => {
    const result = await PackagesService.changelogsList();
    expect(result).toBeDefined();
    expect(result).toContain('@nvidia-elements/core');
    expect((PackagesService.changelogsList as ToolMethod<unknown>).metadata.name).toBe('changelogsList');
    expect((PackagesService.changelogsList as ToolMethod<unknown>).metadata.command).toBe('changelogs.list');
    expect((PackagesService.changelogsList as ToolMethod<unknown>).metadata.description).toBe(
      'Get changelog details for all @nve packages.'
    );
  });

  it('should provide list tool with JSON format', async () => {
    const result = await PackagesService.changelogsList({ format: 'json' });
    expect(result).toBeDefined();
    expect(result['@nvidia-elements/core']).toBeDefined();
    expect((PackagesService.changelogsList as ToolMethod<unknown>).metadata.name).toBe('changelogsList');
    expect((PackagesService.changelogsList as ToolMethod<unknown>).metadata.command).toBe('changelogs.list');
    expect((PackagesService.changelogsList as ToolMethod<unknown>).metadata.description).toBe(
      'Get changelog details for all @nve packages.'
    );
  });

  it('should provide changelogs search tool', async () => {
    const result = await PackagesService.changelogsSearch({ name: '@nvidia-elements/core', format: 'markdown' });
    expect((result as string).includes('@nvidia-elements/core')).toBe(true);
    expect((PackagesService.changelogsSearch as ToolMethod<unknown>).metadata.name).toBe('changelogsSearch');
    expect((PackagesService.changelogsSearch as ToolMethod<unknown>).metadata.command).toBe('changelogs.search');
    expect((PackagesService.changelogsSearch as ToolMethod<unknown>).metadata.description).toBe(
      'Search for and retrieve changelog details by package name (supports fuzzy matching).'
    );
    expect(
      (PackagesService.changelogsSearch as ToolMethod<unknown>).metadata.inputSchema?.properties?.name
    ).toBeDefined();
    expect(
      (PackagesService.changelogsSearch as ToolMethod<unknown>).metadata.inputSchema?.properties?.format
    ).toBeDefined();
  });

  it('should provide changelogs search tool with JSON format', async () => {
    const result = await PackagesService.changelogsSearch({ name: '@nvidia-elements/core', format: 'json' });
    expect((result as { [key: string]: string })['@nvidia-elements/core']).toBeDefined();
    expect((PackagesService.changelogsSearch as ToolMethod<unknown>).metadata.name).toBe('changelogsSearch');
    expect((PackagesService.changelogsSearch as ToolMethod<unknown>).metadata.command).toBe('changelogs.search');
    expect((PackagesService.changelogsSearch as ToolMethod<unknown>).metadata.description).toBe(
      'Search for and retrieve changelog details by package name (supports fuzzy matching).'
    );
    expect(
      (PackagesService.changelogsSearch as ToolMethod<unknown>).metadata.inputSchema?.properties?.name
    ).toBeDefined();
    expect(
      (PackagesService.changelogsSearch as ToolMethod<unknown>).metadata.inputSchema?.properties?.format
    ).toBeDefined();
  });

  it('should return helpful message when no changelog found (markdown)', async () => {
    const result = await PackagesService.changelogsSearch({ name: 'no-match', format: 'markdown' });
    expect(result).toContain('No changelog found for');
    expect(result).toContain('no-match');
    expect(result).toContain('Available packages:');
    expect(result).toContain('Tip:');
  });

  it('should return helpful message when no changelog found (json)', async () => {
    const result = await PackagesService.changelogsSearch({ name: 'no-match', format: 'json' });
    expect((result as { [key: string]: string })['no-match']).toBeDefined();
    expect((result as { [key: string]: string })['no-match']).toContain('No changelog found');
  });

  it('should provide versions list tool', async () => {
    const result = await PackagesService.versionsList();
    expect(result).toBeDefined();
    expect(result['@nvidia-elements/core']).toBe('1.0.0');
    expect(result['@nvidia-elements/themes']).toBe('1.0.0');
    expect((PackagesService.versionsList as ToolMethod<unknown>).metadata.name).toBe('versionsList');
    expect((PackagesService.versionsList as ToolMethod<unknown>).metadata.command).toBe('versions.list');
    expect((PackagesService.versionsList as ToolMethod<unknown>).metadata.description).toBe(
      'Get latest published versions of all Elements packages.'
    );
  });
});

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

  it('should handle empty query', () => {
    expect(searchChangelogs('', changelogs)).toEqual(undefined);
  });

  it('should handle query with only short words', () => {
    // fuzzyMatch filters out words shorter than 3 characters
    expect(searchChangelogs('el', changelogs)).toEqual(undefined);
    expect(searchChangelogs('mo', changelogs)).toEqual(undefined);
  });
});
