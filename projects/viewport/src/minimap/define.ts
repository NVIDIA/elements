// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { ViewportMinimap } from '@nvidia-elements/viewport/minimap';
import '@nvidia-elements/viewport/viewport/define.js';

define(ViewportMinimap);

declare global {
  interface HTMLElementTagNameMap {
    'nve-viewport-minimap': ViewportMinimap;
  }
}
