import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { IconButton } from '@nvidia-elements/core/icon-button';
import '@nvidia-elements/core/icon-button/define.js';

describe(IconButton.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-icon-button icon-name="add"></nve-icon-button>
      <nve-icon-button icon-name="person"></nve-icon-button>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-icon-button')).toBe(true);
  });
});
