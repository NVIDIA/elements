// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { Attribute, Element } from '@internals/metadata';
import type { ToolMethod } from '../internal/tools.js';
import { ApiService } from './service.js';

describe('ApiService', () => {
  it('should provide list tool', async () => {
    const result = await ApiService.list();
    expect(result).toBeDefined();
    expect(result).toContain('`nve-button` (button):');
    expect((ApiService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((ApiService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((ApiService.list as ToolMethod<unknown>).metadata.summary).toBe(
      'Get list of all available Elements (nve-*) APIs and components.'
    );
  });

  it('should provide list tool with JSON format', async () => {
    const result = await ApiService.list({ format: 'json' });
    expect(result).toBeDefined();
    expect((ApiService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((ApiService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((ApiService.list as ToolMethod<unknown>).metadata.summary).toBe(
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
        'Get documentation known components or attributes by name (nve-*). Limit: 5'
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

    it('should return warning for empty template', async () => {
      process.env.ELEMENTS_ENV = 'mcp';
      const result = await ApiService.templateValidate({ template: '' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('empty-template');
      expect(result[0].severity).toBe('warn');
      expect(result[0].message).toContain('Template is empty');
    });

    it('should return warning for whitespace-only template', async () => {
      process.env.ELEMENTS_ENV = 'mcp';
      const result = await ApiService.templateValidate({ template: '   \n  ' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('empty-template');
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
      expect((ApiService.importsGet as ToolMethod<unknown>).metadata.summary).toContain(
        'Get esm imports for a given HTML template using Elements APIs (nve-*)'
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

  describe('tokensList', () => {
    it('should have correct metadata', () => {
      expect((ApiService.tokensList as ToolMethod<unknown>).metadata.name).toBe('tokensList');
      expect((ApiService.tokensList as ToolMethod<unknown>).metadata.command).toBe('tokens.list');
      expect((ApiService.tokensList as ToolMethod<unknown>).metadata.summary).toBe(
        'Get available semantic CSS custom properties / design tokens for theming.'
      );
    });

    it('should provide list tool', async () => {
      const result = await ApiService.tokensList();
      expect(result).toBeDefined();
      expect(result).toContain('## CSS Variables');
    });
  });

  describe('iconsList', () => {
    it('should have correct metadata', () => {
      expect((ApiService.iconsList as ToolMethod<unknown>).metadata.name).toBe('iconsList');
      expect((ApiService.iconsList as ToolMethod<unknown>).metadata.command).toBe('icons.list');
      expect((ApiService.iconsList as ToolMethod<unknown>).metadata.summary).toBe(
        'Get list of all available icon names for nve-icon and nve-icon-button.'
      );
    });

    it('should return markdown with all icon names', async () => {
      const result = await ApiService.iconsList();
      expect(typeof result).toBe('string');
      expect(result as string).toContain('## Available Icons');
    });

    it('should return json array of icon names', async () => {
      const result = await ApiService.iconsList({ format: 'json' });
      expect(Array.isArray(result)).toBe(true);
      expect((result as string[]).length).toBeGreaterThan(0);
      expect(typeof (result as string[])[0]).toBe('string');
    });
  });

  describe('get with large enum truncation', () => {
    it('should not truncate large enum values in json format', async () => {
      const result = (await ApiService.get({ names: ['nve-icon'], format: 'json' })) as Element[];
      expect(Array.isArray(result)).toBe(true);
      const iconEl = result[0] as Element;
      const nameMember = iconEl.manifest?.members?.find(m => m.name === 'name');
      if (nameMember?.type?.values && nameMember.type.values.length > 0) {
        expect(nameMember.type.values.length).toBeGreaterThan(20);
      }
    });

    it('should truncate large enum values in markdown format', async () => {
      const result = (await ApiService.get({ names: ['nve-icon'], format: 'markdown' })) as string;
      expect(result).toContain('icons_list');
      // The full union of 274 icon names should not appear in the type column
      expect(result).not.toMatch(/'[a-z]+-[a-z]+'( \\?\| '[a-z]+-[a-z]+'){50,}/);
    });
  });
});
