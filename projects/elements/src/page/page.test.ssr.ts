import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Page } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/page/define.js';

describe(Page.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-page>
        <div slot="header">header</div>
        <div slot="subheader">subheader</div>
        <div slot="left-aside">left-aside</div>
        <div slot="left">left</div>
        <main style="height: 100%">main</main>
        <div slot="bottom">bottom</div>
        <div slot="right">right</div>
        <div slot="right-aside">right-aside</div>
        <div slot="subfooter">subfooter</div>
        <div slot="footer">footer</div>
      </nve-page>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-page')).toBe(true);
  });
});
