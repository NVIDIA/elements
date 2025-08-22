import { describe, expect, it } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { PlaygroundService } from './service.js';

describe('PlaygroundService', () => {
  it('should provide validate', async () => {
    const result = await PlaygroundService.validate({
      template: '<div nve-invalid="test"><nve-button>hello there</nve-button>'
    });
    expect(result).toBe('<div><nve-button>hello there</nve-button></div>');
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.name).toBe('validate');
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.command).toBe('validate');
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.description).toBe(
      'Get validated HTML string for an example template/playground.'
    );
    expect(
      (PlaygroundService.validate as ToolMethod<unknown>).metadata.inputSchema?.properties?.template
    ).toBeDefined();
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
      'Creates a playground url/link generated from a html template string.'
    );
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.inputSchema?.properties?.template).toBeDefined();
  });
});
