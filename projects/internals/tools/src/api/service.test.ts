// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
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
        'Get documentation known components or attributes by name (nve-*). Limit: 3'
      );
      expect((ApiService.get as ToolMethod<unknown>).metadata.inputSchema?.properties?.names).toBeDefined();
      expect((ApiService.get as ToolMethod<unknown>).metadata.inputSchema?.required).toContain('names');
    });

    it('should return markdown for a single string name', async () => {
      const result = await ApiService.get({ names: 'nve-button', format: 'markdown' });
      expect(typeof result).toBe('string');
      expect(result as string).toContain('nve-button');
      expect(result as string).toContain('| readOnly (readonly) |');
    });

    it('should return projected mixin api for directly mixed components', async () => {
      const result = await ApiService.get({ names: 'nve-media-mute-button', format: 'markdown' });
      expect(typeof result).toBe('string');
      expect(result as string).toContain('| pressed |');
      expect(result as string).toContain('| checked |');
      expect(result as string).toContain('| readOnly (readonly) |');
      expect(result as string).toContain('| commandForElement (commandfor) |');
      expect(result as string).not.toContain('| commandForElement (commandForElement) |');
    });

    it('should return json for a single string name', async () => {
      const result = (await ApiService.get({ names: 'nve-button', format: 'json' })) as (Element | Attribute)[];
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('nve-button');

      const button = result[0] as Element;
      const readOnly = button.manifest?.members.find(member => member.name === 'readOnly');

      expect(readOnly?.attribute).toBe('readonly');
    });

    it('should return json with projected mixin attributes for directly mixed components', async () => {
      const result = (await ApiService.get({ names: 'nve-media-mute-button', format: 'json' })) as (
        | Element
        | Attribute
      )[];
      const muteButton = result[0] as Element;
      const checked = muteButton.manifest?.members.find(member => member.name === 'checked');
      const commandForElement = muteButton.manifest?.members.find(member => member.name === 'commandForElement');

      expect(checked?.attribute).toBe('checked');
      expect(commandForElement?.attribute).toBe('commandfor');
      expect(muteButton.manifest?.attributes?.some(attribute => attribute.name === 'commandForElement')).toBe(false);
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

    it('should reject when all names are not found', async () => {
      await expect(
        ApiService.get({
          names: ['nve-nonexistent-abc', 'nve-nonexistent-xyz'],
          format: 'markdown'
        })
      ).rejects.toThrow('No components or APIs found matching "nve-nonexistent-abc", "nve-nonexistent-xyz".');
    });

    it('should reject when all names are not found (json)', async () => {
      await expect(
        ApiService.get({
          names: ['nve-nonexistent-abc'],
          format: 'json'
        })
      ).rejects.toThrow('No components or APIs found matching "nve-nonexistent-abc".');
    });
  });

  describe('validate', () => {
    it('should have correct metadata', () => {
      expect((ApiService.validate as ToolMethod<unknown>).metadata.command).toBe('validate');
      expect((ApiService.validate as ToolMethod<unknown>).metadata.inputSchema?.properties?.paths).toBeDefined();
      expect((ApiService.validate as ToolMethod<unknown>).metadata.inputSchema?.properties?.template).toBeDefined();
      expect((ApiService.validate as ToolMethod<unknown>).metadata.inputSchema?.properties?.stdin).toBeUndefined();
      expect((ApiService.validate as ToolMethod<unknown>).metadata.inputSchema?.properties?.fix).toBeUndefined();
      expect((ApiService.validate as ToolMethod<unknown>).metadata.cli).toMatchObject({
        exclude: ['template'],
        properties: { stdin: { type: 'boolean' }, fix: { type: 'boolean' } },
        positionals: { paths: { optional: true, variadic: true } }
      });
    });

    it('should default the validation language to HTML in metadata', () => {
      expect((ApiService.validate as ToolMethod<unknown>).metadata.inputSchema?.properties?.lang).toMatchObject({
        type: 'string',
        enum: ['html', 'json'],
        default: 'html'
      });
    });

    it('should return structured HTML diagnostics', async () => {
      const result = await ApiService.validate({
        template: '<nve-invalid></nve-invalid>',
        lang: 'html',
        format: 'json'
      });
      expect(typeof result).toBe('object');
      expect((result as { ok: boolean }).ok).toBe(false);
      expect((result as { diagnostics: unknown[] }).diagnostics).toHaveLength(1);
    });

    it('should default supplied content to HTML', async () => {
      const result = await ApiService.validate({ template: '<nve-invalid></nve-invalid>', format: 'json' });
      expect(result).toMatchObject({ ok: false, summary: { files: 1 } });
      expect((result as { diagnostics: { rule: string }[] }).diagnostics[0]?.rule).toContain('@nvidia-elements/lint/');
    });

    it('should require a filename for JSON content', async () => {
      await expect(ApiService.validate({ template: '{}', lang: 'json', format: 'json' })).rejects.toThrow(
        'filename is required'
      );
    });

    it('should validate supplied JSON with an explicit language and filename', async () => {
      const result = await ApiService.validate({
        template: '{}',
        lang: 'json',
        filename: 'package.json',
        format: 'json'
      });
      expect(result).toMatchObject({ ok: true, summary: { files: 1 } });
    });

    it('should reject fixes for supplied content', async () => {
      await expect(
        ApiService.validate({ template: '<nve-button></nve-button>', lang: 'html', format: 'json', fix: true })
      ).rejects.toThrow('--fix is available only');
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
      expect((ApiService.tokensList as ToolMethod<unknown>).metadata.inputSchema?.properties?.query).toBeDefined();
      expect((ApiService.tokensList as ToolMethod<unknown>).metadata.app?.resourceUri).toBe(
        'ui://elements/tokens-list'
      );
    });

    it('should provide list tool', async () => {
      const result = await ApiService.tokensList();
      expect(result).toBeDefined();
      expect(result).toContain('## CSS Variables');
    });

    it('should filter tokens by query', async () => {
      const result = (await ApiService.tokensList({ format: 'json', query: 'shadow' })) as {
        name: string;
        value: string;
        description: string;
      }[];
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every(token => [token.name, token.value, token.description].join(' ').toLowerCase().includes('shadow'))
      ).toBe(true);
    });
  });

  describe('iconsList', () => {
    it('should have correct metadata', () => {
      expect((ApiService.iconsList as ToolMethod<unknown>).metadata.name).toBe('iconsList');
      expect((ApiService.iconsList as ToolMethod<unknown>).metadata.command).toBe('icons.list');
      expect((ApiService.iconsList as ToolMethod<unknown>).metadata.summary).toBe(
        'Get list of all available icon names for nve-icon and nve-icon-button.'
      );
      expect((ApiService.iconsList as ToolMethod<unknown>).metadata.app?.resourceUri).toBe('ui://elements/icons-list');
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
