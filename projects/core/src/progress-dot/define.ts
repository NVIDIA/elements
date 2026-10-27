// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { ProgressDot } from '@nvidia-elements/core/progress-dot';

define(ProgressDot);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progress-dot': ProgressDot;
  }
}
