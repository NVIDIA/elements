import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Month } from '@nvidia-elements/core/month';
import '@nvidia-elements/core/month/define.js';

describe(Month.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-month>
        <label>label</label>
        <input type="month" />
      </nve-month>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-month')).toBe(true);
  });
});
