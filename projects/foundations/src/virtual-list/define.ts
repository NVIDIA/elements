// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { VirtualList } from '@nvidia-elements/foundations/virtual-list';

define(VirtualList);

declare global {
  interface HTMLElementTagNameMap {
    'nve-virtual-list': VirtualList;
  }
}
