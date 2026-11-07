// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/progress-ring/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { PageLoader } from '@nvidia-elements/core/page-loader';

define(PageLoader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-page-loader': PageLoader;
  }
}
