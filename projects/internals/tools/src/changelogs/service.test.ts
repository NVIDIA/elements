import { describe, expect, it } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { ChangelogsService, searchChangelogs } from './service.js';

describe('ChangelogsService', () => {
  it('should provide list tool', async () => {
    const result = await ChangelogsService.list();
    expect(result).toBeDefined();
    expect(result).toContain('@nvidia-elements/core');
    expect((ChangelogsService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((ChangelogsService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((ChangelogsService.list as ToolMethod<unknown>).metadata.description).toBe(
      'Get changelog details for all @nve packages.'
    );
  });

  it('should provide list tool with JSON format', async () => {
    const result = await ChangelogsService.list({ format: 'json' });
    expect(result).toBeDefined();
    expect(result['@nvidia-elements/core']).toBeDefined();
    expect((ChangelogsService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((ChangelogsService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((ChangelogsService.list as ToolMethod<unknown>).metadata.description).toBe(
      'Get changelog details for all @nve packages.'
    );
  });

  it('should provide search tool', async () => {
    const result = await ChangelogsService.search({ name: '@nvidia-elements/core', format: 'markdown' });
    expect((result as string).includes('@nvidia-elements/core')).toBe(true);
    expect((ChangelogsService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ChangelogsService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ChangelogsService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Get changelog details for specific @nve package.'
    );
    expect((ChangelogsService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.name).toBeDefined();
    expect((ChangelogsService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.format).toBeDefined();
  });

  it('should provide search tool with JSON format', async () => {
    const result = await ChangelogsService.search({ name: '@nvidia-elements/core', format: 'json' });
    expect((result as { [key: string]: string })['@nvidia-elements/core']).toBeDefined();
    expect((ChangelogsService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ChangelogsService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ChangelogsService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Get changelog details for specific @nve package.'
    );
    expect((ChangelogsService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.name).toBeDefined();
    expect((ChangelogsService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.format).toBeDefined();
  });

  it('should return helpful message when no changelog found (markdown)', async () => {
    const result = await ChangelogsService.search({ name: 'no-match', format: 'markdown' });
    expect(result).toContain('No changelog found for');
    expect(result).toContain('no-match');
    expect(result).toContain('Available packages:');
    expect(result).toContain('Tip:');
  });

  it('should return helpful message when no changelog found (json)', async () => {
    const result = await ChangelogsService.search({ name: 'no-match', format: 'json' });
    expect((result as { [key: string]: string })['no-match']).toBeDefined();
    expect((result as { [key: string]: string })['no-match']).toContain('No changelog found');
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
