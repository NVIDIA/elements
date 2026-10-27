// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { Viewport } from '@nvidia-elements/viewport/viewport';

define(Viewport);

declare global {
  interface HTMLElementTagNameMap {
    'nve-viewport': Viewport;
  }
}
