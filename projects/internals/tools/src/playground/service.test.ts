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
    expect(result.length).toBe(1);
    expect(result[0].message).toBe('Unexpected use of restricted attribute nve-layout on custom HTML element.');
    expect(result[0].line).toBe(1);
    expect(result[0].column).toBe(13);
    expect(result[0].endLine).toBe(1);
    expect(result[0].endColumn).toBe(32);
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.name).toBe('validate');
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.command).toBe('validate');
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.description).toBe(
      'Returns a list of potential errors in a playground template.'
    );
    expect(
      (PlaygroundService.validate as ToolMethod<unknown>).metadata.inputSchema?.properties?.template
    ).toBeDefined();
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
      'Creates a playground url/link generated from a html template string. Returns URL only if template passes validation, otherwise returns errors to correct.'
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
      expect((result as { message: string }[])[0].message).toBe(
        'Unexpected use of restricted attribute nve-layout on custom HTML element.'
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
  });
});
