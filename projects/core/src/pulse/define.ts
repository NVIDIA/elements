// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Pulse } from '@nvidia-elements/core/pulse';

define(Pulse);

declare global {
  interface HTMLElementTagNameMap {
    'nve-pulse': Pulse;
  }
}
