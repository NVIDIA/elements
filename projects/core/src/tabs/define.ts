// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { TabsGroup, TabsItem, TabsItemGroup, Tabs } from '@nvidia-elements/core/tabs';

define(TabsItem);
define(TabsItemGroup);
define(Tabs);
define(TabsGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tabs-item': TabsItem;
    'nve-tabs-item-group': TabsItemGroup;
    'nve-tabs': Tabs;
    'nve-tabs-group': TabsGroup;
  }
}
