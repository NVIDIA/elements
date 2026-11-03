// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/sort-ascending.js';
import '@nvidia-elements/core/icon/icons/sort-descending.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { SortButton } from '@nvidia-elements/core/sort-button';

define(SortButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-sort-button': SortButton;
  }
}
