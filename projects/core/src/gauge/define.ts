// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Gauge } from '@nvidia-elements/core/gauge';

define(Gauge);

declare global {
  interface HTMLElementTagNameMap {
    'nve-gauge': Gauge;
  }
}
