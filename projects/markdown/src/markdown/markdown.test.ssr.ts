import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Markdown } from '@nvidia-elements/markdown/markdown';
import '@nvidia-elements/markdown/markdown/define.js';

describe(Markdown.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-markdown></nve-markdown>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-markdown')).toBe(true);
  });
});
