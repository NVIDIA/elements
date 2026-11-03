// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/play.js';
import '@nvidia-elements/core/icon/icons/pause.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { MediaPauseButton } from '@nvidia-elements/media/pause-button';

define(MediaPauseButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-pause-button': MediaPauseButton;
  }
}
