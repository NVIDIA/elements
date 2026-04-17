// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { SortButton } from '@nvidia-elements/core/sort-button';

define(SortButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-sort-button': SortButton;
  }
}
