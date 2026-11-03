// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/forms/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Switch, SwitchGroup } from '@nvidia-elements/core/switch';

define(Switch);
define(SwitchGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-switch': Switch;
    'nve-switch-group': SwitchGroup;
  }
}
