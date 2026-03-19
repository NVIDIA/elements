// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Menu, MenuItem } from '@nvidia-elements/core/menu';

define(Menu);
define(MenuItem);

declare global {
  interface HTMLElementTagNameMap {
    'nve-menu': Menu;
    'nve-menu-item': MenuItem;
  }
}
