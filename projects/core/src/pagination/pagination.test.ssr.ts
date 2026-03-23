import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Pagination } from '@nvidia-elements/core/pagination';
import '@nvidia-elements/core/pagination/define.js';

describe(Pagination.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(
      html`<nve-pagination name="page" value="1" step="10" items="100"></nve-pagination>`
    );
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-pagination')).toBe(true);
  });
});
