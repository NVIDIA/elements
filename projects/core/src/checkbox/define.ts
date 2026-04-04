// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Checkbox, CheckboxGroup } from '@nvidia-elements/core/checkbox';
import '@nvidia-elements/core/forms/define.js';

define(Checkbox);
define(CheckboxGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-checkbox': Checkbox;
    'nve-checkbox-group': CheckboxGroup;
  }
}
