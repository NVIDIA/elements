import { describe, expect, it } from 'vitest';
import type { ToolMethod } from '../utils/tools.js';
import { ApiService } from './api.service.js';

describe('ApiService', () => {
  it('should provide available tool', async () => {
    const result = await ApiService.available();
    expect(result).toBeDefined();
    expect((ApiService.available as ToolMethod<unknown>).metadata.name).toBe('available');
    expect((ApiService.available as ToolMethod<unknown>).metadata.command).toBe('available');
    expect((ApiService.available as ToolMethod<unknown>).metadata.description).toBe(
      'Get list of all available APIs and components.'
    );
  });

  it('should provide search tool', async () => {
    const result = await ApiService.search({ query: 'button', format: 'markdown' });
    expect(result).toBeDefined();
    expect((ApiService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ApiService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ApiService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Get API information for specific APIs and components'
    );
    expect((ApiService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
    expect((ApiService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.format).toBeDefined();
  });

  it('should provide changelog tool', async () => {
    const result = await ApiService.changelog({ name: 'button', format: 'markdown' });
    expect(result).toBeDefined();
    expect((ApiService.changelog as ToolMethod<unknown>).metadata.name).toBe('changelog');
    expect((ApiService.changelog as ToolMethod<unknown>).metadata.command).toBe('changelog');
    expect((ApiService.changelog as ToolMethod<unknown>).metadata.description).toBe(
      'Get the changelog details for the @nve packages'
    );
    expect((ApiService.changelog as ToolMethod<unknown>).metadata.inputSchema?.properties?.name).toBeDefined();
    expect((ApiService.changelog as ToolMethod<unknown>).metadata.inputSchema?.properties?.format).toBeDefined();
  });

  it('should provide version tool', async () => {
    const result = await ApiService.version();
    expect(result).toBeDefined();
    expect((ApiService.version as ToolMethod<unknown>).metadata.name).toBe('version');
    expect((ApiService.version as ToolMethod<unknown>).metadata.command).toBe('version');
    expect((ApiService.version as ToolMethod<unknown>).metadata.description).toBe(
      'Get the latest published versions of elements / @nve packages'
    );
  });
});
