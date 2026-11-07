// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/rewind.js';
import '@nvidia-elements/core/icon/icons/rewind-10.js';
import '@nvidia-elements/core/icon/icons/fast-forward.js';
import '@nvidia-elements/core/icon/icons/fast-forward-10.js';
import '@nvidia-elements/core/icon/icons/start.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { MediaSeekButton } from '@nvidia-elements/media/seek-button';

define(MediaSeekButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-seek-button': MediaSeekButton;
  }
}
