// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Sparkline } from '@nvidia-elements/core/sparkline';

define(Sparkline);

declare global {
  interface HTMLElementTagNameMap {
    'nve-sparkline': Sparkline;
  }
}
