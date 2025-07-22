import { describe, expect, it } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { PlaygroundService } from './service.js';

describe('PlaygroundService', () => {
  it('should provide validateTemplate', async () => {
    const result = await PlaygroundService.validateTemplate({
      html: '<div nve-invalid="test"><nve-button>hello there</nve-button>'
    });
    expect(result).toBe('<div><nve-button>hello there</nve-button></div>');
    expect((PlaygroundService.validateTemplate as ToolMethod<unknown>).metadata.name).toBe('validateTemplate');
    expect((PlaygroundService.validateTemplate as ToolMethod<unknown>).metadata.command).toBe('validate-template');
    expect((PlaygroundService.validateTemplate as ToolMethod<unknown>).metadata.description).toBe(
      'Get validated/sanitized HTML string for an example template/playground.'
    );
    expect(
      (PlaygroundService.validateTemplate as ToolMethod<unknown>).metadata.inputSchema?.properties?.html
    ).toBeDefined();
  });

  it('should provide createPlayground', async () => {
    const result = await PlaygroundService.create({
      html: '<nve-button></nve-button>',
      type: 'default',
      start: false
    });
    expect(result.includes('?version=1&layout=vertical-split&file=index.html&files=')).toBe(true);
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.name).toBe('create');
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.command).toBe('create');
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.description).toBe(
      'Create a playground url/link from a html string'
    );
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.inputSchema?.properties?.html).toBeDefined();
  });
});
