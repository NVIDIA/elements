import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Avatar } from '@nvidia-elements/core/avatar';
import '@nvidia-elements/core/avatar/define.js';

describe(Avatar.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-avatar>AV</nve-avatar>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-avatar')).toBe(true);
  });
});
