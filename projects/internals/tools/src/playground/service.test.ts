import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { PlaygroundService } from './service.js';

describe('PlaygroundService', () => {
  it('should provide validate', async () => {
    const env = process.env.ELEMENTS_ENV;
    process.env.ELEMENTS_ENV = 'mcp';
    const result = await PlaygroundService.validate({
      template: '<nve-button nve-layout="column">hello there</nve-button>'
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].message).toContain(
      'Unexpected use of restricted attribute "nve-layout" on <nve-button>. Remove the attribute.'
    );
    expect(result[0].message).toContain('Supported attributes:');
    expect(result[0].line).toBe(1);
    expect(result[0].column).toBe(13);
    expect(result[0].endLine).toBe(1);
    expect(result[0].endColumn).toBe(32);
    expect(result[1].message).toBe(
      'Layout "column" is missing gap spacing. Add a gap value such as "xs", "sm", "md", "lg", "xl"'
    );
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.name).toBe('validate');
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.command).toBe('validate');
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.description).toBe(
      'Validates HTML templates specifically for playground examples. Includes all checks from the "api_template_validate" tool with additional constraints to prevent common mistakes when generating standalone demos and playgrounds. Use this before calling playground_create.'
    );
    expect(
      (PlaygroundService.validate as ToolMethod<unknown>).metadata.inputSchema?.properties?.template
    ).toBeDefined();
    process.env.ELEMENTS_ENV = env;
  });

  it('should return warning for empty template', async () => {
    const env = process.env.ELEMENTS_ENV;
    process.env.ELEMENTS_ENV = 'mcp';
    const result = await PlaygroundService.validate({ template: '' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('empty-template');
    expect(result[0].severity).toBe('warn');
    expect(result[0].message).toContain('Template is empty');
    process.env.ELEMENTS_ENV = env;
  });

  it('should return warning for whitespace-only template', async () => {
    const env = process.env.ELEMENTS_ENV;
    process.env.ELEMENTS_ENV = 'mcp';
    const result = await PlaygroundService.validate({ template: '   \n  ' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('empty-template');
    process.env.ELEMENTS_ENV = env;
  });

  it('should provide create', async () => {
    const result = await PlaygroundService.create({
      template: '<nve-button></nve-button>',
      type: 'default',
      start: false
    });
    // https://elements-stage.nvidia.com/ui/elements-playground
    expect(result).has.string('https://elements-stage.nvidia.com/ui/elements-playground');
    expect(result).has.string('?version=1');
    expect(result).has.string('&layout=vertical-split');
    expect(result).has.string('&file=index.html');
    expect(result).has.string('&files=');
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.name).toBe('create');
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.command).toBe('create');
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.description).toBe(
      'Create a shareable playground URL from an HTML template. Returns URL if valid, or validation errors if invalid. Tip: Use playground_validate first to check for issues.'
    );
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.inputSchema?.properties?.template).toBeDefined();
  });

  describe('create', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.ELEMENTS_ENV;
    });

    afterEach(() => {
      process.env.ELEMENTS_ENV = originalEnv;
    });

    it('should return lint errors when template has validation errors in mcp environment', async () => {
      process.env.ELEMENTS_ENV = 'mcp';
      const result = await PlaygroundService.create({
        template: '<nve-button nve-layout="column">hello</nve-button>',
        start: false
      });
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBeGreaterThan(0);
      expect((result as { message: string }[])[0].message).toContain(
        'Unexpected use of restricted attribute "nve-layout" on <nve-button>. Remove the attribute.'
      );
    });

    it('should return lint errors when template has validation errors in cli environment', async () => {
      process.env.ELEMENTS_ENV = 'cli';
      const result = await PlaygroundService.create({
        template: '<nve-button nve-layout="column">hello</nve-button>',
        start: false
      });
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBeGreaterThan(0);
    });

    it('should skip validation and return URL when not in mcp or cli environment', async () => {
      process.env.ELEMENTS_ENV = 'browser';
      const result = await PlaygroundService.create({
        template: '<nve-button nve-layout="column">hello</nve-button>',
        start: false
      });
      expect(typeof result).toBe('string');
      expect(result).has.string('https://elements-stage.nvidia.com/ui/elements-playground');
    });

    it('should return URL when template passes lint in mcp environment', async () => {
      process.env.ELEMENTS_ENV = 'mcp';
      const result = await PlaygroundService.create({
        template: '<nve-button>valid</nve-button>',
        start: false
      });
      expect(typeof result).toBe('string');
      expect(result).has.string('https://elements-stage.nvidia.com/ui/elements-playground');
    });

    it('should include author in formatted name when provided', async () => {
      process.env.ELEMENTS_ENV = 'browser';
      const result = await PlaygroundService.create({
        template: '<nve-button>test</nve-button>',
        author: 'Claude',
        start: false
      });
      expect(typeof result).toBe('string');
      expect(result).has.string('https://elements-stage.nvidia.com/ui/elements-playground');
    });

    it('should handle undefined ELEMENTS_ENV', async () => {
      delete process.env.ELEMENTS_ENV;
      const result = await PlaygroundService.create({
        template: '<nve-button>test</nve-button>',
        start: false
      });
      expect(typeof result).toBe('string');
      expect(result).has.string('https://elements-stage.nvidia.com/ui/elements-playground');
    });
  });

  describe('validate', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.ELEMENTS_ENV;
    });

    afterEach(() => {
      process.env.ELEMENTS_ENV = originalEnv;
    });

    it('should return empty array when not in mcp or cli environment', async () => {
      process.env.ELEMENTS_ENV = 'browser';
      const result = await PlaygroundService.validate({
        template: '<nve-button nve-layout="column">hello</nve-button>'
      });
      expect(result).toEqual([]);
    });
  });
});
