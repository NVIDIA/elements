import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Range } from '@nvidia-elements/core/range';
import '@nvidia-elements/core/range/define.js';

describe(Range.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-range>
        <label>label</label>
        <input type="range" />
      </nve-range>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-range')).toBe(true);
  });
});
