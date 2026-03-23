import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import '@nvidia-elements/core/dropdown/define.js';

describe(Dropdown.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <button popovertarget="dropdown">button</button>
      <nve-dropdown id="dropdown" closable>hello</nve-dropdown>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-dropdown')).toBe(true);
  });
});
