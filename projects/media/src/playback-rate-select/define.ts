// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { MediaPlaybackRateSelect } from '@nvidia-elements/media/playback-rate-select';

define(MediaPlaybackRateSelect);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-playback-rate-select': MediaPlaybackRateSelect;
  }
}
