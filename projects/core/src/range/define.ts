// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/forms/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Range } from '@nvidia-elements/core/range';

define(Range);

declare global {
  interface HTMLElementTagNameMap {
    'nve-range': Range;
  }
}
