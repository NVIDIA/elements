// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/cancel.js';
import '@nvidia-elements/core/date/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/select/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { ProgressiveFilterChip } from '@nvidia-elements/core/progressive-filter-chip';

define(ProgressiveFilterChip);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progressive-filter-chip': ProgressiveFilterChip;
  }
}
