import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@nve-internals/vite';
import { Pulse } from '@nvidia-elements/core/pulse';
import '@nvidia-elements/core/pulse/define.js';

describe(Pulse.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-pulse></nve-pulse>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-pulse')).toBe(true);
  });
});
