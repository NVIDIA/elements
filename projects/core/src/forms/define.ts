// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/information-circle.js';
import '@nvidia-elements/core/icon/icons/exclamation-triangle.js';
import '@nvidia-elements/core/icon/icons/checkmark-circle.js';
import '@nvidia-elements/core/icon/icons/exclamation-circle.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-control': Control;
    'nve-control-group': ControlGroup;
    'nve-control-message': ControlMessage;
  }
}
