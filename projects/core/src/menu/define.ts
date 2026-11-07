// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/caret.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Menu, MenuGroup, MenuItem } from '@nvidia-elements/core/menu';

define(Menu);
define(MenuGroup);
define(MenuItem);

declare global {
  interface HTMLElementTagNameMap {
    'nve-menu': Menu;
    'nve-menu-group': MenuGroup;
    'nve-menu-item': MenuItem;
  }
}
