import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@nve-internals/vite';
import { AppHeader } from '@nvidia-elements/core/app-header';
import '@nvidia-elements/core/app-header/define.js';

/* eslint-disable elements/deprecated-tags */

describe(AppHeader.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-app-header>
        <h2 slot="title">header</h2>
      </nve-app-header>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-app-header')).toBe(true);
  });
});
