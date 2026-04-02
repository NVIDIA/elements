// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Pulse } from '@nvidia-elements/core/pulse';

define(Pulse);

declare global {
  interface HTMLElementTagNameMap {
    'nve-pulse': Pulse;
  }
}
