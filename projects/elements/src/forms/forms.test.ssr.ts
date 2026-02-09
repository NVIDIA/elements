import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Control } from '@nvidia-elements/core/forms';
import '@nvidia-elements/core/forms/define.js';

describe(Control.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-control>
        <label>label</label>
        <input />
        <nve-control-message>message</nve-control-message>
      </nve-control>  
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-control')).toBe(true);
    expect(result.includes('nve-control-message')).toBe(true);
  });
});
