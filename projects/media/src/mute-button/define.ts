// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { MediaMuteButton } from '@nvidia-elements/media/mute-button';

define(MediaMuteButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-mute-button': MediaMuteButton;
  }
}
