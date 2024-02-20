import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { TabsItem, Tabs } from '@elements/elements/tabs';
import '@elements/elements/tabs/define.js';

describe('nve-tab', () => {
  let fixture: HTMLElement;
  let parentElement: Tabs;
  let childElement: TabsItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-tabs>
      <nve-tabs-item></nve-tabs-item>
    </nve-tabs>
    `);
    parentElement = fixture.querySelector('nve-tabs');
    childElement = fixture.querySelector('nve-tabs-item');

    await elementIsStable(parentElement);
    await elementIsStable(childElement);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define parentElement', () => {
    expect(customElements.get('nve-tabs')).toBeDefined();
  });

  it('should define childElement', () => {
    expect(customElements.get('nve-tabs-item')).toBeDefined();
  });

  it('should have correct a18y roles', async () => {
    expect(parentElement._internals.role).toBe('tablist');
    expect(childElement._internals.role).toBe('tab');
  });

  it('should have proper defaults on parent', () => {
    expect(parentElement.vertical).toBe(false);
    expect(parentElement.borderless).toBe(false);
    expect(parentElement.behaviorSelect).toBe(false);
  });

  it('should handle behaviorSelect via clicking', async () => {
    expect(childElement.selected).toBe(false);
    parentElement.behaviorSelect = true;

    const event = untilEvent(childElement, 'click');
    emulateClick(childElement);
    expect(await event).toBeDefined();

    expect(childElement.selected).toBe(true);
  });

  it('should NOT handle behaviorSelect via clicking by default', async () => {
    expect(childElement.selected).toBe(false);

    const event = untilEvent(childElement, 'click');
    emulateClick(childElement);
    expect(await event).toBeDefined();

    expect(childElement.selected).toBe(false);
  });
});
