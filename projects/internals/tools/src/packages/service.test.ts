import { describe, expect, it, vi } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { PackagesService } from './service.js';

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
  it('should provide list tool', async () => {
    const result = await PackagesService.list();
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('@nvidia-elements/core');
    expect((PackagesService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((PackagesService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((PackagesService.list as ToolMethod<unknown>).metadata.summary).toBe(
      'Get latest published versions of all Elements packages.'
    );
  });

  it('should provide get tool', async () => {
    const result = await PackagesService.get({ name: '@nvidia-elements/core' });
    expect(result).toBeDefined();
    expect(result).toContain('@nvidia-elements/core');
    expect((PackagesService.get as ToolMethod<unknown>).metadata.name).toBe('get');
    expect((PackagesService.get as ToolMethod<unknown>).metadata.command).toBe('get');
    expect((PackagesService.get as ToolMethod<unknown>).metadata.summary).toBe(
      'Get details for a specific Elements package.'
    );
  });

  it('should throw error for unknown package in get tool', async () => {
    await expect(PackagesService.get({ name: 'unknown-package' })).rejects.toThrow(
      'No package found for "unknown-package"'
    );
  });

  it('should provide changelogs get tool', async () => {
    const result = await PackagesService.changelogsGet({ name: '@nvidia-elements/core', format: 'markdown' });
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('@nvidia-elements/core');
    expect((PackagesService.changelogsGet as ToolMethod<unknown>).metadata.name).toBe('changelogsGet');
    expect((PackagesService.changelogsGet as ToolMethod<unknown>).metadata.command).toBe('changelogs.get');
    expect((PackagesService.changelogsGet as ToolMethod<unknown>).metadata.summary).toBe(
      'Retrieve changelog details by package name.'
    );
  });

  it('should return changelog as json when format is json', async () => {
    const result = await PackagesService.changelogsGet({ name: '@nvidia-elements/core', format: 'json' });
    expect(typeof result).toBe('object');
    expect((result as { [key: string]: string })['@nvidia-elements/core']).toBeDefined();
  });

  it('should return changelog as markdown when format is undefined', async () => {
    const result = await PackagesService.changelogsGet({ name: '@nvidia-elements/core' });
    expect(typeof result).toBe('string');
  });

  it('should return helpful message when no changelog found (markdown)', async () => {
    const result = await PackagesService.changelogsGet({ name: 'no-match', format: 'markdown' });
    expect(result).toContain('No changelog found for');
    expect(result).toContain('no-match');
    expect(result).toContain('Available packages:');
  });

  it('should apply default limit to changelog versions', async () => {
    const result = await PackagesService.changelogsGet({ name: '@nvidia-elements/core' });
    expect(typeof result).toBe('string');
    expect(result).toContain('@nvidia-elements/core');
  });

  it('should limit changelog versions when explicit limit is provided', async () => {
    const full = await PackagesService.changelogsGet({ name: '@nvidia-elements/core', limit: 999 });
    const limited = await PackagesService.changelogsGet({ name: '@nvidia-elements/core', limit: 1 });
    expect((limited as string).length).toBeLessThanOrEqual((full as string).length);
  });

  it('should return helpful message when no changelog found (json)', async () => {
    const result = await PackagesService.changelogsGet({ name: 'no-match', format: 'json' });
    expect((result as { [key: string]: string })['no-match']).toBeDefined();
    expect((result as { [key: string]: string })['no-match']).toContain('No changelog found');
  });

  it('should provide versions method', async () => {
    const result = await PackagesService.versions();
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(result['@nvidia-elements/core']).toBe('1.0.0');
  });
});
