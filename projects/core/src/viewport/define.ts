// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Viewport, ViewportGridlines, ViewportMinimap } from '@nvidia-elements/core/viewport';

define(Viewport);
define(ViewportGridlines);
define(ViewportMinimap);

declare global {
  interface HTMLElementTagNameMap {
    'nve-viewport': Viewport;
    'nve-viewport-gridlines': ViewportGridlines;
    'nve-viewport-minimap': ViewportMinimap;
  }
}
