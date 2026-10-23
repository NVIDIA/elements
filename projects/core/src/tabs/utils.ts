// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TabsItem } from './tabs.js';

/** Resolves the tab controls owned by the tab strip, in visual order. */
export function getTabItems(entries: readonly Element[]): TabsItem[] {
  return entries.flatMap(entry => {
    if (entry.getAttribute('slot')) return [];
    if (entry.localName === 'nve-tabs-item') return [entry as TabsItem];
    if (entry.localName !== 'nve-tabs-item-group') return [];
    const item = entry.querySelector<TabsItem>(':scope > nve-tabs-item:is(:not([slot]), [slot=""])');
    return item ? [item] : [];
  });
}

export function isTabItemTabbable(item: TabsItem): boolean {
  const anchor = item.querySelector<HTMLAnchorElement>(':scope > a:is(:not([slot]), [slot=""])');
  return item.tabIndex >= 0 || (!!anchor && anchor.matches('[href], [tabindex]') && anchor.tabIndex >= 0);
}
