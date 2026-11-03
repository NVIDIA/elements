// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/volume.js';
import '@nvidia-elements/core/icon/icons/volume-muted.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { MediaMuteButton } from '@nvidia-elements/media/mute-button';

define(MediaMuteButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-mute-button': MediaMuteButton;
  }
}
