// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { ResizeHandle } from '@nvidia-elements/core/resize-handle';

define(ResizeHandle);

declare global {
  interface HTMLElementTagNameMap {
    'nve-resize-handle': ResizeHandle;
  }
}
