// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
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
