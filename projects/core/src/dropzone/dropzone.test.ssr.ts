import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Dropzone } from '@nvidia-elements/core/dropzone';
import '@nvidia-elements/core/dropzone/define.js';

describe(Dropzone.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-dropzone></nve-dropzone>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-dropzone')).toBe(true);
  });
});
