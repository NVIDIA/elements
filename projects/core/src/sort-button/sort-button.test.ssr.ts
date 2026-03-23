import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { SortButton } from '@nvidia-elements/core/sort-button';
import '@nvidia-elements/core/sort-button/define.js';

describe(SortButton.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-sort-button aria-label="sort"></nve-sort-button>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-sort-button')).toBe(true);
  });
});
