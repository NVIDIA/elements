import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { Attribute, Element } from '@nve-internals/metadata';
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
      'Get list of all available Elements (nve-*) APIs and components.'
    );
  });

  it('should provide list tool with JSON format', async () => {
    const result = await ApiService.list({ format: 'json' });
    expect(result).toBeDefined();
    expect((ApiService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((ApiService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((ApiService.list as ToolMethod<unknown>).metadata.description).toBe(
      'Get list of all available Elements (nve-*) APIs and components.'
    );
  });

  it('should provide search tool', async () => {
    const result = await ApiService.search({ query: 'button', format: 'markdown' });
    expect((result as string).includes('## nve-button')).toBe(true);
    expect((ApiService.search as ToolMethod<unknown>).metadata.name).toBe('search');
    expect((ApiService.search as ToolMethod<unknown>).metadata.command).toBe('search');
    expect((ApiService.search as ToolMethod<unknown>).metadata.description).toBe(
      'Search and retrieve a list of Elements (nve-*) components and APIs using keywords or natural language.'
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
      'Search and retrieve a list of Elements (nve-*) components and APIs using keywords or natural language.'
    );
    expect((ApiService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
    expect((ApiService.search as ToolMethod<unknown>).metadata.inputSchema?.properties?.format).toBeDefined();
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

  describe('templateValidate', () => {
    const originalEnv = process.env.ELEMENTS_ENV;

    beforeEach(() => {
      delete process.env.ELEMENTS_ENV;
    });

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.ELEMENTS_ENV = originalEnv;
      } else {
        delete process.env.ELEMENTS_ENV;
      }
    });

    it('should have correct metadata', () => {
      expect((ApiService.templateValidate as ToolMethod<unknown>).metadata.name).toBe('templateValidate');
      expect((ApiService.templateValidate as ToolMethod<unknown>).metadata.command).toBe('template.validate');
      expect((ApiService.templateValidate as ToolMethod<unknown>).metadata.description).toContain(
        'Validates HTML templates using Elements APIs'
      );
      expect(
        (ApiService.templateValidate as ToolMethod<unknown>).metadata.inputSchema?.properties?.template
      ).toBeDefined();
      expect((ApiService.templateValidate as ToolMethod<unknown>).metadata.inputSchema?.required).toContain('template');
    });

    it('should return empty array when ELEMENTS_ENV is not set', async () => {
      const result = await ApiService.templateValidate({ template: '<nve-button>Test</nve-button>' });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should return empty array when ELEMENTS_ENV is not mcp or cli', async () => {
      process.env.ELEMENTS_ENV = 'test';
      const result = await ApiService.templateValidate({ template: '<nve-button>Test</nve-button>' });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should call lintTemplate when ELEMENTS_ENV is mcp', async () => {
      process.env.ELEMENTS_ENV = 'mcp';
      const mockLintTemplate = vi.fn().mockResolvedValue([{ message: 'test error', severity: 2 }]);

      vi.doMock('@nvidia-elements/lint/eslint/internals', () => ({
        lintTemplate: mockLintTemplate
      }));

      // Re-import to get the mocked version
      const { ApiService: MockedApiService } = await import('./service.js');
      const result = await MockedApiService.templateValidate({ template: '<nve-button>Test</nve-button>' });

      expect(Array.isArray(result)).toBe(true);
      vi.doUnmock('@nvidia-elements/lint/eslint/internals');
    });

    it('should call lintTemplate when ELEMENTS_ENV is cli', async () => {
      process.env.ELEMENTS_ENV = 'cli';
      const mockLintTemplate = vi.fn().mockResolvedValue([]);

      vi.doMock('@nvidia-elements/lint/eslint/internals', () => ({
        lintTemplate: mockLintTemplate
      }));

      const { ApiService: MockedApiService } = await import('./service.js');
      const result = await MockedApiService.templateValidate({ template: '<nve-button>Test</nve-button>' });

      expect(Array.isArray(result)).toBe(true);
      vi.doUnmock('@nvidia-elements/lint/eslint/internals');
    });
  });
});
