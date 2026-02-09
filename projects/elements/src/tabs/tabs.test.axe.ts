import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { TabsItem, Tabs } from '@nvidia-elements/core/tabs';
import '@nvidia-elements/core/tabs/define.js';

describe(Tabs.metadata.tag, () => {
  let fixture: HTMLElement;
  let tabs: Tabs;
  let item: TabsItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tabs>
        <nve-tabs-item>Tab 1</nve-tabs-item>
        <nve-tabs-item selected>Tab 2</nve-tabs-item>
        <nve-tabs-item disabled>Tab 3</nve-tabs-item>
      </nve-tabs>
    `);
    tabs = fixture.querySelector(Tabs.metadata.tag);
    item = fixture.querySelector(TabsItem.metadata.tag);

    await elementIsStable(tabs);
    await elementIsStable(item);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Tabs.metadata.tag], {
      rules: { 'color-contrast': { enabled: false } }
    });
    expect(results.violations.length).toBe(0);
  });
});
