import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/button/define.js';

describe(Button.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-button>button</nve-button>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-button')).toBe(true);
  });
});
