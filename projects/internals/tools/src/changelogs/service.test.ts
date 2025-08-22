import { describe, expect, it } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { ChangelogsService } from './service.js';

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
});
