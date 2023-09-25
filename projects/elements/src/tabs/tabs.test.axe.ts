import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { TabsItem, Tabs } from '@elements/elements/tabs';
import '@elements/elements/tabs/define.js';

describe('mlv-tabs axe', () => {
  let fixture: HTMLElement;
  let tabs: Tabs;
  let item: TabsItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-tabs>
        <mlv-tabs-item>Tab 1</mlv-tabs-item>
        <mlv-tabs-item selected>Tab 2</mlv-tabs-item>
        <mlv-tabs-item disabled>Tab 3</mlv-tabs-item>
      </mlv-tabs>
    `);
    tabs = fixture.querySelector('mlv-tabs');
    item = fixture.querySelector('mlv-tabs-item');

    await elementIsStable(tabs);
    await elementIsStable(item);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-tabs']);
    expect(results.violations.length).toBe(0);
  });
});
