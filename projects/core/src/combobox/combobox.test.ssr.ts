import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Combobox } from '@nvidia-elements/core/combobox';
import '@nvidia-elements/core/combobox/define.js';

describe(Combobox.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
        <nve-control-message>message</nve-control-message>
      </nve-combobox> 
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-combobox')).toBe(true);
  });
});
