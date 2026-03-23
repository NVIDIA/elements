import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import '@nvidia-elements/core/resize-handle/define.js';

describe(ResizeHandle.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-resize-handle></nve-resize-handle>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-resize-handle')).toBe(true);
  });
});
