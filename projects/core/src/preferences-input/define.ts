// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/computer.js';
import '@nvidia-elements/core/icon/icons/sun.js';
import '@nvidia-elements/core/icon/icons/moon.js';
import '@nvidia-elements/core/icon/icons/circle-half.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/switch/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { PreferencesInput } from '@nvidia-elements/core/preferences-input';

define(PreferencesInput);

declare global {
  interface HTMLElementTagNameMap {
    'nve-preferences-input': PreferencesInput;
  }
}
