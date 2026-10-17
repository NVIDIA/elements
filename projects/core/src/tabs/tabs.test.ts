// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { TabsItem, Tabs } from '@nvidia-elements/core/tabs';
import { getAnchorNames } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/tabs/define.js';

describe(Tabs.metadata.tag, () => {
  let fixture: HTMLElement;
  let parentElement: Tabs;
  let childElement: TabsItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-tabs>
      <nve-tabs-item></nve-tabs-item>
    </nve-tabs>
    `);
    parentElement = fixture.querySelector(Tabs.metadata.tag);
    childElement = fixture.querySelector(TabsItem.metadata.tag);

    await elementIsStable(parentElement);
    await elementIsStable(childElement);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define parentElement', () => {
    expect(customElements.get(Tabs.metadata.tag)).toBeDefined();
  });

  it('should define childElement', () => {
    expect(customElements.get(TabsItem.metadata.tag)).toBeDefined();
  });

  it('should have correct a11y roles', async () => {
    expect(parentElement._internals.role).toBe('tablist');
    expect(childElement._internals.role).toBe('tab');
  });

  it('should have a type default of button for the tab item', async () => {
    await elementIsStable(childElement);
    expect(childElement.type).toBe('button');
  });

  it('should have proper defaults on parent', () => {
    expect(parentElement.vertical).toBe(false);
    expect(parentElement.borderless).toBe(false);
    expect(parentElement.behaviorSelect).toBe(false);
  });

  it('should configure indicator animation timing in either orientation', async () => {
    expect(getComputedStyle(parentElement, '::after').transitionDuration).toBe('0.15s');
    parentElement.style.setProperty('--indicator-animation-duration', '75ms');
    expect(getComputedStyle(parentElement, '::after').transitionDuration).toBe('0.075s');
    parentElement.vertical = true;
    await elementIsStable(parentElement);
    expect(getComputedStyle(parentElement, '::after').transitionDuration).toBe('0.075s');
    parentElement.style.setProperty('--indicator-animation-duration', '0ms');
    expect(getComputedStyle(parentElement, '::after').transitionDuration).toBe('0s');
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

  it('should set the correct aria-orientation based on the tab orientation', async () => {
    expect(parentElement.vertical).toBe(false);
    expect(parentElement._internals.ariaOrientation).toBe('horizontal');

    parentElement.vertical = true;
    await elementIsStable(parentElement);

    expect(parentElement.vertical).toBe(true);
    expect(parentElement._internals.ariaOrientation).toBe('vertical');
  });

  it('should set the correct keynav orientation', async () => {
    expect(parentElement.vertical).toBe(false);
    expect(parentElement.keynavListConfig.layout).toBe('horizontal');

    parentElement.vertical = true;
    await elementIsStable(parentElement);

    expect(parentElement.vertical).toBe(true);
    expect(parentElement.keynavListConfig.layout).toBe('vertical');
  });

  it('should add --selected anchor name when tab item is selected', async () => {
    document.body.appendChild(childElement);
    expect(childElement.selected).toBe(false);

    const initialAnchorNames = getAnchorNames(childElement);
    expect(initialAnchorNames).not.toContain('--selected');

    childElement.selected = true;
    await elementIsStable(childElement);

    const anchorNames = getAnchorNames(childElement);
    expect(anchorNames).toContain('--selected');

    childElement.remove();
  });

  it('should remove --selected anchor name when tab item is deselected', async () => {
    document.body.appendChild(childElement);
    childElement.selected = true;
    await elementIsStable(childElement);

    let anchorNames = getAnchorNames(childElement);
    expect(anchorNames).toContain('--selected');

    childElement.selected = false;
    await elementIsStable(childElement);

    anchorNames = getAnchorNames(childElement);
    expect(anchorNames).not.toContain('--selected');

    childElement.remove();
  });

  it('should toggle --selected anchor name when selected property changes multiple times', async () => {
    document.body.appendChild(childElement);
    expect(childElement.selected).toBe(false);

    childElement.selected = true;
    await elementIsStable(childElement);
    expect(getAnchorNames(childElement)).toContain('--selected');

    childElement.selected = false;
    await elementIsStable(childElement);
    expect(getAnchorNames(childElement)).not.toContain('--selected');

    childElement.selected = true;
    await elementIsStable(childElement);
    expect(getAnchorNames(childElement)).toContain('--selected');

    childElement.remove();
  });

  it('should preserve other anchor names when adding --selected', async () => {
    document.body.appendChild(childElement);
    childElement.style.anchorName = '--my-custom-anchor';

    childElement.selected = true;
    await elementIsStable(childElement);

    const anchorNames = getAnchorNames(childElement);
    expect(anchorNames).toContain('--selected');
    expect(anchorNames).toContain('--my-custom-anchor');

    childElement.remove();
  });

  it('should not select a disabled tab when behaviorSelect is true', async () => {
    parentElement.behaviorSelect = true;
    childElement.disabled = true;
    await elementIsStable(parentElement);
    await elementIsStable(childElement);

    expect(childElement.selected).toBe(false);
    emulateClick(childElement);
    await elementIsStable(childElement);
    expect(childElement.selected).toBe(false);
  });

  it('should preserve other anchor names when removing --selected', async () => {
    document.body.appendChild(childElement);
    childElement.style.anchorName = '--my-custom-anchor, --selected';
    childElement.selected = true;
    await elementIsStable(childElement);

    childElement.selected = false;
    await elementIsStable(childElement);

    const anchorNames = getAnchorNames(childElement);
    expect(anchorNames).not.toContain('--selected');
    expect(anchorNames).toContain('--my-custom-anchor');

    childElement.remove();
  });
});

describe(`${Tabs.metadata.tag} - multi tab selection`, () => {
  let fixture: HTMLElement;
  let tabs: Tabs;
  let tab1: TabsItem;
  let tab2: TabsItem;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tabs behavior-select>
        <nve-tabs-item id="tab1">Tab 1</nve-tabs-item>
        <nve-tabs-item id="tab2">Tab 2</nve-tabs-item>
      </nve-tabs>
    `);
    tabs = fixture.querySelector(Tabs.metadata.tag);
    tab1 = fixture.querySelector<TabsItem>('#tab1');
    tab2 = fixture.querySelector<TabsItem>('#tab2');
    await elementIsStable(tabs);
    await elementIsStable(tab1);
    await elementIsStable(tab2);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should deselect other tabs when a new tab is selected', async () => {
    emulateClick(tab1);
    await elementIsStable(tabs);
    expect(tab1.selected).toBe(true);
    expect(tab2.selected).toBe(false);

    emulateClick(tab2);
    await elementIsStable(tabs);
    expect(tab1.selected).toBe(false);
    expect(tab2.selected).toBe(true);
  });
});

describe(`${Tabs.metadata.tag} - initial focus`, () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize the selected tab as tabbable', async () => {
    fixture = await createFixture(html`
      <nve-tabs>
        <nve-tabs-item>Overview</nve-tabs-item>
        <nve-tabs-item selected>Details</nve-tabs-item>
        <nve-tabs-item>Settings</nve-tabs-item>
      </nve-tabs>
    `);
    const tabs = fixture.querySelector<Tabs>(Tabs.metadata.tag);
    const tabItems = fixture.querySelectorAll<TabsItem>(TabsItem.metadata.tag);
    await elementIsStable(tabs);

    expect(tabItems[0].tabIndex).toBe(-1);
    expect(tabItems[1].tabIndex).toBe(0);
    expect(tabItems[2].tabIndex).toBe(-1);
  });

  it('should initialize the first tab as tabbable when no tab is selected', async () => {
    fixture = await createFixture(html`
      <nve-tabs>
        <nve-tabs-item>Overview</nve-tabs-item>
        <nve-tabs-item>Details</nve-tabs-item>
        <nve-tabs-item>Settings</nve-tabs-item>
      </nve-tabs>
    `);
    const tabs = fixture.querySelector<Tabs>(Tabs.metadata.tag);
    const tabItems = fixture.querySelectorAll<TabsItem>(TabsItem.metadata.tag);
    await elementIsStable(tabs);

    expect(tabItems[0].tabIndex).toBe(0);
    expect(tabItems[1].tabIndex).toBe(-1);
    expect(tabItems[2].tabIndex).toBe(-1);
  });
});

describe(`${TabsItem.metadata.tag} - decorative slots`, () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  it('should retain decoration and rich labels in their supplied parents', async () => {
    fixture = await createFixture(html`
      <nve-tabs behavior-select>
        <nve-tabs-item>
          <span slot="prefix" aria-hidden="true">●</span>
          <strong>Experiment</strong>
          <span slot="suffix">3</span>
        </nve-tabs-item>
      </nve-tabs>
    `);
    const item = fixture.querySelector<TabsItem>('nve-tabs-item');
    await elementIsStable(item);

    expect(item.querySelector('strong').parentElement).toBe(item);
    expect(item.shadowRoot.querySelector<HTMLSlotElement>('slot[name="prefix"]').assignedElements()[0]).toBe(
      item.firstElementChild
    );
    expect(item.shadowRoot.querySelector<HTMLSlotElement>('slot[name="suffix"]').assignedElements()[0]).toBe(
      item.lastElementChild
    );
    expect(item.querySelector('strong').assignedSlot.name).toBe('');
  });

  it('should select the tab when its decoration is clicked', async () => {
    fixture = await createFixture(html`
      <nve-tabs behavior-select>
        <nve-tabs-item><span slot="prefix">●</span>Experiment</nve-tabs-item>
      </nve-tabs>
    `);
    const item = fixture.querySelector<TabsItem>('nve-tabs-item');
    await elementIsStable(item);
    emulateClick(item.querySelector('span'));
    expect(item.selected).toBe(true);
  });

  it('should detect a label anchor after the prefix slot', async () => {
    fixture = await createFixture(html`
      <nve-tabs>
        <nve-tabs-item><span slot="prefix">●</span><a href="#experiment">Experiment</a></nve-tabs-item>
      </nve-tabs>
    `);
    const item = fixture.querySelector<TabsItem>('nve-tabs-item');
    await elementIsStable(item);
    expect(item.readOnly).toBe(true);
    item.disabled = true;
    await elementIsStable(item);
    const click = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
    item.querySelector('a').dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
  });

  it('should activate the label anchor when its suffix decoration is clicked', async () => {
    fixture = await createFixture(html`
      <nve-tabs>
        <nve-tabs-item>
          <a href="#experiment">Experiment</a>
          <span slot="suffix" style="contain: layout; display: inline-block">3</span>
        </nve-tabs-item>
      </nve-tabs>
    `);
    const item = fixture.querySelector<TabsItem>('nve-tabs-item');
    await elementIsStable(item);
    const click = vi.fn((event: Event) => event.preventDefault());
    item.querySelector('a').addEventListener('click', click);
    const decoration = item.querySelector('span').getBoundingClientRect();
    const bounds = item.getBoundingClientRect();

    await userEvent.click(item, {
      position: {
        x: decoration.left - bounds.left + decoration.width / 2,
        y: decoration.top - bounds.top + decoration.height / 2
      }
    });

    expect(click).toHaveBeenCalledTimes(1);
  });
});
