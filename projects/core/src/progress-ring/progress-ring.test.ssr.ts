import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ProgressRing } from '@nvidia-elements/core/progress-ring';
import '@nvidia-elements/core/progress-ring/define.js';

describe(ProgressRing.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-progress-ring value="50"></nve-progress-ring>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-progress-ring')).toBe(true);
  });
});
