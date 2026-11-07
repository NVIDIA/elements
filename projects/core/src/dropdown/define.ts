// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/cancel.js';
import '@nvidia-elements/core/icon-button/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Dropdown, DropdownHeader, DropdownFooter } from '@nvidia-elements/core/dropdown';

define(Dropdown);
define(DropdownFooter);
define(DropdownHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dropdown': Dropdown;
    'nve-dropdown-footer': DropdownFooter;
    'nve-dropdown-header': DropdownHeader;
  }
}
