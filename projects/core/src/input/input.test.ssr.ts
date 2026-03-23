import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Input } from '@nvidia-elements/core/input';
import '@nvidia-elements/core/input/define.js';

describe(Input.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-input>
        <label>label</label>
        <input type="text" />
      </nve-input>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-input')).toBe(true);
  });
});
