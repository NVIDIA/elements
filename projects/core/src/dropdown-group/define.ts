// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { DropdownGroup } from '@nvidia-elements/core/dropdown-group';

define(DropdownGroup);
declare global {
  interface HTMLElementTagNameMap {
    'nve-dropdown-group': DropdownGroup;
  }
}
