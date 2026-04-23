// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Dot } from '@nvidia-elements/core/dot';

define(Dot);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dot': Dot;
  }
}
