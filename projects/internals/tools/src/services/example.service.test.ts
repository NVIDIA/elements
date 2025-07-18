import { describe, expect, it } from 'vitest';
import type { ToolMethod } from '../utils/tools.js';
import { ExampleService } from './example.service.js';

describe('ExampleService', () => {
  it('should provide getAvailable tool', async () => {
    const result = await ExampleService.available();
    expect(result).toBeDefined();
    expect((ExampleService.available as ToolMethod<unknown>).metadata.name).toBe('available');
    expect((ExampleService.available as ToolMethod<unknown>).metadata.command).toBe('available');
    expect((ExampleService.available as ToolMethod<unknown>).metadata.description).toBe(
      'Get list of available examples.'
    );
    expect((ExampleService.available as ToolMethod<unknown>).metadata.inputSchema).toBeUndefined();
  });

  it('should provide search tool', async () => {
    const result = await ExampleService.search({ query: 'button' });
    expect(result).toBeDefined();
    expect((ExampleService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ExampleService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ExampleService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Search for template examples by name or description.'
    );
    expect((ExampleService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
  });
});
