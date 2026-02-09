import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Dot } from '@nvidia-elements/core/dot';
import '@nvidia-elements/core/dot/define.js';

describe(Dot.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-dot></nve-dot>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-dot')).toBe(true);
  });
});
