import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { TabsItem } from '@elements/elements/tabs';
import '@elements/elements/tabs/define.js';

describe('nve-tab', () => {
  let fixture: HTMLElement;
  let element: TabsItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tabs-item></nve-tabs-item>
    `);
    element = fixture.querySelector('nve-tabs-item');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-tabs-item')).toBeDefined();
  });

  it('should be an interactive button type', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('tab');
  });
});
