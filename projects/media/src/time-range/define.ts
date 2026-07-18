// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { MediaTimeRange } from '@nvidia-elements/media/time-range';

define(MediaTimeRange);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-time-range': MediaTimeRange;
  }
}
