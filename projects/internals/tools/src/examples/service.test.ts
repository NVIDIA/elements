import { describe, expect, it } from 'vitest';
import type { MetadataExample } from '@internals/metadata';
import { ExamplesService } from './service.js';
import type { ToolMethod } from '../internal/tools.js';

describe('ExampleService', () => {
  it('should provide list tool', async () => {
    const result = await ExamplesService.list();
    expect(result).toBeDefined();
    expect((ExamplesService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((ExamplesService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((ExamplesService.list as ToolMethod<unknown>).metadata.description).toBe(
      'Get list of available example templates/patterns.'
    );
    expect((ExamplesService.list as ToolMethod<unknown>).metadata.inputSchema?.properties?.format).toBeDefined();
  });

  it('should provide search tool', async () => {
    const result = await ExamplesService.search({ query: 'button' });
    expect(result).toBeDefined();
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Search for example templates/patterns by name or description.'
    );
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
  });

  it('should provide search tool with JSON format', async () => {
    const results = await ExamplesService.search({ query: 'button', format: 'json' });
    const { id, entrypoint, template } = results[0] as MetadataExample;
    expect(id).toBeTruthy();
    expect(entrypoint).toBeTruthy();
    expect(template).toBeTruthy();
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Search for example templates/patterns by name or description.'
    );
    expect((ExamplesService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
  });

  it('should provide getAll tool for internal usage', async () => {
    const result = await ExamplesService.getAll();
    expect(result.length).toBeGreaterThan(0);
  });
});
