import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
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
  });

  it('should provide search tool with JSON format', async () => {
    const result = (await ApiService.search({ query: 'button', format: 'json' })) as (Element | Attribute)[];
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
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

  describe('get', () => {
    it('should have correct metadata', () => {
      expect((ApiService.get as ToolMethod<unknown>).metadata.name).toBe('get');
      expect((ApiService.get as ToolMethod<unknown>).metadata.command).toBe('get');
      expect((ApiService.get as ToolMethod<unknown>).metadata.description).toContain(
        'Get the documentation for up to 5 known Elements components or attribute APIs by name (nve-*).'
      );
      expect((ApiService.get as ToolMethod<unknown>).metadata.inputSchema?.properties?.names).toBeDefined();
      expect((ApiService.get as ToolMethod<unknown>).metadata.inputSchema?.required).toContain('names');
    });

    it('should return markdown for a single string name', async () => {
      const result = await ApiService.get({ names: 'nve-button', format: 'markdown' });
      expect(typeof result).toBe('string');
      expect(result as string).toContain('nve-button');
    });

    it('should return json for a single string name', async () => {
      const result = (await ApiService.get({ names: 'nve-button', format: 'json' })) as (Element | Attribute)[];
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('nve-button');
    });

    it('should return markdown for an array with one name', async () => {
      const result = await ApiService.get({ names: ['nve-button'], format: 'markdown' });
      expect(typeof result).toBe('string');
      expect(result as string).toContain('nve-button');
    });

    it('should return markdown for multiple names', async () => {
      const result = await ApiService.get({ names: ['nve-button', 'nve-badge'], format: 'markdown' });
      expect(typeof result).toBe('string');
      expect(result as string).toContain('nve-button');
      expect(result as string).toContain('nve-badge');
      expect(result as string).toContain('---');
    });

    it('should return json for multiple names', async () => {
      const result = (await ApiService.get({
        names: ['nve-button', 'nve-badge'],
        format: 'json'
      })) as (Element | Attribute)[];
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result.map(r => r.name)).toContain('nve-button');
      expect(result.map(r => r.name)).toContain('nve-badge');
    });

    it('should include not-found note when some names are missing (markdown)', async () => {
      const result = await ApiService.get({
        names: ['nve-button', 'nve-nonexistent-xyz'],
        format: 'markdown'
      });
      expect(typeof result).toBe('string');
      expect(result as string).toContain('nve-button');
      expect(result as string).toContain('Not found: nve-nonexistent-xyz');
    });

    it('should omit not-found names from json and only return found results', async () => {
      const result = (await ApiService.get({
        names: ['nve-button', 'nve-nonexistent-xyz'],
        format: 'json'
      })) as (Element | Attribute)[];
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('nve-button');
    });

    it('should return helpful message when all names are not found', async () => {
      const result = await ApiService.get({
        names: ['nve-nonexistent-abc', 'nve-nonexistent-xyz'],
        format: 'markdown'
      });
      expect(typeof result).toBe('string');
      expect(result as string).toContain('No components or APIs found matching');
      expect(result as string).toContain('nve-nonexistent-abc');
      expect(result as string).toContain('nve-nonexistent-xyz');
      expect(result as string).toContain('Tip:');
    });

    it('should return helpful message when all names are not found (json)', async () => {
      const result = await ApiService.get({
        names: ['nve-nonexistent-abc'],
        format: 'json'
      });
      expect(typeof result).toBe('string');
      expect(result as string).toContain('No components or APIs found matching');
    });
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

  describe('importsGet', () => {
    it('should have correct metadata', () => {
      expect((ApiService.importsGet as ToolMethod<unknown>).metadata.name).toBe('importsGet');
      expect((ApiService.importsGet as ToolMethod<unknown>).metadata.command).toBe('imports.get');
      expect((ApiService.importsGet as ToolMethod<unknown>).metadata.description).toContain(
        'Get the esm imports for a given HTML template'
      );
      expect((ApiService.importsGet as ToolMethod<unknown>).metadata.inputSchema?.properties?.template).toBeDefined();
      expect((ApiService.importsGet as ToolMethod<unknown>).metadata.inputSchema?.required).toContain('template');
    });

    it('should return imports for a template with known elements', async () => {
      const result = await ApiService.importsGet({ template: '<nve-button>Click</nve-button>' });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toContain('/define.js');
    });

    it('should return empty array for template with no elements', async () => {
      const result = await ApiService.importsGet({ template: '<div>plain html</div>' });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });
});
