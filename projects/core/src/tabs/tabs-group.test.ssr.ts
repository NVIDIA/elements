import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { TabsGroup } from '@nvidia-elements/core/tabs';
import '@nvidia-elements/core/tabs/define.js';

describe(TabsGroup.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-tabs-group id="tab-group">
        <nve-tabs>
          <nve-tabs-item selected command="--toggle" commandfor="tab-group" value="overview">Overview</nve-tabs-item>
          <nve-tabs-item command="--toggle" commandfor="tab-group" value="details">Details</nve-tabs-item>
        </nve-tabs>
        <div slot="overview">Overview panel</div>
        <div slot="details">Details panel</div>
      </nve-tabs-group>
    `);

    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-tabs-group')).toBe(true);
    expect(result.includes('nve-tabs')).toBe(true);
    expect(result.includes('slot="overview"')).toBe(true);
  });
});
