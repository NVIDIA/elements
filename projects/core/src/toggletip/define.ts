// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/cancel.js';
import '@nvidia-elements/core/icon-button/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Toggletip, ToggletipHeader, ToggletipFooter } from '@nvidia-elements/core/toggletip';

define(Toggletip);
define(ToggletipFooter);
define(ToggletipHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-toggletip': Toggletip;
    'nve-toggletip-footer': ToggletipFooter;
    'nve-toggletip-header': ToggletipHeader;
  }
}
