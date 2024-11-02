import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Page } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/page/define.js';

describe(Page.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-page>
        <div slot="header">header</div>
        <div slot="subheader">subheader</div>
        <div slot="left-aside">left-aside</div>
        <div slot="left">left</div>
        <main>main</main>
        <div slot="bottom">bottom</div>
        <div slot="right">right</div>
        <div slot="right-aside">right-aside</div>
        <div slot="subfooter">subfooter</div>
        <div slot="footer">footer</div>
      </nve-page>
    `);

    await elementIsStable(fixture.querySelector(Page.metadata.tag));
    const results = await runAxe([Page.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
