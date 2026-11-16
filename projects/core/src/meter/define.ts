// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { Meter, MeterGroup } from '@nvidia-elements/core/meter';

define(Meter);
define(MeterGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-meter': Meter;
    'nve-meter-group': MeterGroup;
  }
}
