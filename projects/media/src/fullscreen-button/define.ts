// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/maximize.js';
import '@nvidia-elements/core/icon/icons/minimize.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { MediaFullscreenButton } from '@nvidia-elements/media/fullscreen-button';

define(MediaFullscreenButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-fullscreen-button': MediaFullscreenButton;
  }
}
