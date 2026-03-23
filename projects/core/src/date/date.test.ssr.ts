import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Date } from '@nvidia-elements/core/date';
import '@nvidia-elements/core/date/define.js';

describe(Date.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-date>
        <label>label</label>
        <input type="date" />
      </nve-date>  
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-date')).toBe(true);
  });
});
