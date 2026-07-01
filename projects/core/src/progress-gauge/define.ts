// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { ProgressGauge } from '@nvidia-elements/core/progress-gauge';

define(ProgressGauge);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progress-gauge': ProgressGauge;
  }
}
