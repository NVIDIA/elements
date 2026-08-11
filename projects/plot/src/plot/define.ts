// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Plot } from '@nvidia-elements/plot/plot';

define(Plot);

declare global {
  interface HTMLElementTagNameMap {
    'nve-plot': Plot;
  }
}
