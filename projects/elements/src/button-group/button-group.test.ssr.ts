import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { ButtonGroup } from '@nvidia-elements/core/button-group';
import '@nvidia-elements/core/button-group/define.js';

describe(ButtonGroup.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-button-group></nve-button-group>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-button-group')).toBe(true);
  });
});
