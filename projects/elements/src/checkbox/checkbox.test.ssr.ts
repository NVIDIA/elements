import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Checkbox } from '@nvidia-elements/core/checkbox';
import '@nvidia-elements/core/checkbox/define.js';

describe(Checkbox.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-checkbox-group>
        <nve-checkbox>
          <label>label</label>
          <input type="checkbox" />
        </nve-checkbox> 
        <nve-checkbox>
          <label>label</label>
          <input type="checkbox" />
        </nve-checkbox> 
      </nve-checkbox-group>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-checkbox')).toBe(true);
    expect(result.includes('nve-checkbox-group')).toBe(true);
  });
});
