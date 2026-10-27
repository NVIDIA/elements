// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { ViewportGridlines } from '@nvidia-elements/viewport/gridlines';
import '@nvidia-elements/viewport/viewport/define.js';

define(ViewportGridlines);

declare global {
  interface HTMLElementTagNameMap {
    'nve-viewport-gridlines': ViewportGridlines;
  }
}
