// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { TabsItem, Tabs } from '@nvidia-elements/core/tabs';

define(TabsItem);
define(Tabs);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tabs-item': TabsItem;
    'nve-tabs': Tabs;
  }
}
