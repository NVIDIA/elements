import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Week } from '@nvidia-elements/core/week';
import '@nvidia-elements/core/week/define.js';

describe(Week.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-week>
        <label>label</label>
        <input type="week" />
      </nve-week>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-week')).toBe(true);
  });
});
