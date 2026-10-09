// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Viewport, ViewportGridlines, ViewportMinimap, ViewportZoomRange } from '@nvidia-elements/core/viewport';

define(Viewport);
define(ViewportGridlines);
define(ViewportMinimap);
define(ViewportZoomRange);

declare global {
  interface HTMLElementTagNameMap {
    'nve-viewport': Viewport;
    'nve-viewport-gridlines': ViewportGridlines;
    'nve-viewport-minimap': ViewportMinimap;
    'nve-viewport-zoom-range': ViewportZoomRange;
  }
}
