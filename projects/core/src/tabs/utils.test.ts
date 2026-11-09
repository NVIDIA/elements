// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getTabItems, isTabItemTabbable } from './utils.js';
import type { TabsItem } from './tabs.js';

function item(markup: string): TabsItem {
  const root = document.createElement('div');
  root.innerHTML = markup;
  const element = root.querySelector<TabsItem>('nve-tabs-item');
  if (!element) throw new Error('Expected a tab item');
  return element;
}

describe('tab utilities', () => {
  it('resolves default-slot tab items and one direct tab per group in order', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<nve-tabs-item id="a"></nve-tabs-item><nve-tabs-item slot="suffix"></nve-tabs-item><div></div><nve-tabs-item-group><nve-tabs-item slot="prefix"></nve-tabs-item><nve-tabs-item id="b"></nve-tabs-item><nve-tabs-item id="ignored"></nve-tabs-item></nve-tabs-item-group><nve-tabs-item-group></nve-tabs-item-group>';
    expect(getTabItems([...root.children]).map(tab => tab.id)).toEqual(['a', 'b']);
  });

  it('accepts an empty slot and rejects nested tabs inside group wrappers', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<nve-tabs-item-group><div><nve-tabs-item></nve-tabs-item></div><nve-tabs-item slot="" id="direct"></nve-tabs-item></nve-tabs-item-group>';
    expect(getTabItems([...root.children]).map(tab => tab.id)).toEqual(['direct']);
  });

  it('uses the item or its default-slot anchor as the tab stop', () => {
    const tab = item('<nve-tabs-item tabindex="-1"><a href="#target">Link</a></nve-tabs-item>');
    expect(isTabItemTabbable(tab)).toBe(true);
    const anchor = tab.querySelector('a');
    if (!anchor) throw new Error('Expected anchor');
    anchor.tabIndex = -1;
    expect(isTabItemTabbable(tab)).toBe(false);
    tab.tabIndex = 0;
    expect(isTabItemTabbable(tab)).toBe(true);
    tab.tabIndex = -1;
    anchor.slot = 'suffix';
    expect(isTabItemTabbable(tab)).toBe(false);
  });
});
