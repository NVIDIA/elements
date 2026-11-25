// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { DraggableList } from '@nvidia-elements/foundations/draggable-list';

define(DraggableList);

declare global {
  interface HTMLElementTagNameMap {
    'nve-draggable-list': DraggableList;
  }
}
