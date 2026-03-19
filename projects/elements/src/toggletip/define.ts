// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
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
