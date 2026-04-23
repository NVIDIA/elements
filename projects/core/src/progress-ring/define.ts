// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { ProgressRing } from '@nvidia-elements/core/progress-ring';

define(ProgressRing);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progress-ring': ProgressRing;
  }
}
