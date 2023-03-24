import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { TabsItem } from '@elements/elements/tabs';
import '@elements/elements/tabs/define.js';

describe('mlv-tab', () => {
  let fixture: HTMLElement;
  let element: TabsItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-tabs-item></mlv-tabs-item>
    `);
    element = fixture.querySelector('mlv-tabs-item');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-tabs-item')).toBeDefined();
  });

  it('should be an interactive button type', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('tab');
  });
});
