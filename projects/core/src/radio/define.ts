// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/forms/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Radio, RadioGroup } from '@nvidia-elements/core/radio';

define(Radio);
define(RadioGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-radio': Radio;
    'nve-radio-group': RadioGroup;
  }
}
