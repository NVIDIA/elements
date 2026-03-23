import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon/define.js';

describe(Icon.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-icon name="add"></nve-icon>
      <nve-icon name="person"></nve-icon>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-icon')).toBe(true);
  });
});
