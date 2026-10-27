// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { ViewportZoomRange } from '@nvidia-elements/viewport/zoom-range';
import '@nvidia-elements/viewport/viewport/define.js';

define(ViewportZoomRange);

declare global {
  interface HTMLElementTagNameMap {
    'nve-viewport-zoom-range': ViewportZoomRange;
  }
}
