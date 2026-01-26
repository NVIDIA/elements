import { describe, expect, it } from 'vitest';
import type { Attribute, Element } from '@internals/metadata';
import type { ToolMethod } from '../internal/tools.js';
import { ApiService } from './service.js';

describe('ApiService', () => {
  it('should provide list tool', async () => {
    const result = await ApiService.list();
    expect(result).toBeDefined();
    expect(result).toContain('- **nve-button');
    expect((ApiService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((ApiService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((ApiService.list as ToolMethod<unknown>).metadata.description).toBe(
      'Get list of all available APIs and components.'
    );
  });

  it('should provide list tool with JSON format', async () => {
    const result = await ApiService.list({ format: 'json' });
    expect(result).toBeDefined();
    expect((ApiService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((ApiService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((ApiService.list as ToolMethod<unknown>).metadata.description).toBe(
      'Get list of all available APIs and components.'
    );
  });

  it('should provide search tool', async () => {
    const result = await ApiService.search({ query: 'button', format: 'markdown' });
    expect((result as string).includes('## nve-button')).toBe(true);
    expect((ApiService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ApiService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ApiService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Get API information for specific APIs and components.'
    );
    expect((ApiService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
    expect((ApiService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.format).toBeDefined();
  });

  it('should provide search tool with JSON format', async () => {
    const result = (await ApiService.search({ query: 'button', format: 'json' })) as (Element | Attribute)[];
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect((ApiService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ApiService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ApiService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Get API information for specific APIs and components.'
    );
    expect((ApiService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
    expect((ApiService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.format).toBeDefined();
  });

  it('should provide version tool', async () => {
    const result = await ApiService.version();
    expect(result).toBeDefined();
    expect((ApiService.version as ToolMethod<unknown>).metadata.name).toBe('version');
    expect((ApiService.version as ToolMethod<unknown>).metadata.command).toBe('version');
    expect((ApiService.version as ToolMethod<unknown>).metadata.description).toBe(
      'Get latest versions of elements/@nve packages.'
    );
  });

  it('should return helpful message for empty search results (markdown)', async () => {
    const result = await ApiService.search({ query: 'nonexistent-component-xyz', format: 'markdown' });
    expect(result).toContain('No components or APIs found matching');
    expect(result).toContain('nonexistent-component-xyz');
    expect(result).toContain('Tip:');
  });

  it('should return empty array for empty search results (json)', async () => {
    const result = await ApiService.search({ query: 'nonexistent-component-xyz', format: 'json' });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});
