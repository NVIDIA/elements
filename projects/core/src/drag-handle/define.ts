// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/drag.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { DragHandle } from '@nvidia-elements/core/drag-handle';

define(DragHandle);

declare global {
  interface HTMLElementTagNameMap {
    'nve-drag-handle': DragHandle;
  }
}
