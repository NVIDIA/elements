// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { MediaVolumeRange } from '@nvidia-elements/media/volume-range';

define(MediaVolumeRange);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-volume-range': MediaVolumeRange;
  }
}
