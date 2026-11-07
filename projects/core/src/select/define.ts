// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/caret.js';
import '@nvidia-elements/core/icon/icons/check.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/tag/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Select } from '@nvidia-elements/core/select';

define(Select);

declare global {
  interface HTMLElementTagNameMap {
    'nve-select': Select;
  }
}
