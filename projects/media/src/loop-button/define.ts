// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/looping.js';
import '@nvidia-elements/core/icon/icons/looping-off.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { MediaLoopButton } from '@nvidia-elements/media/loop-button';

define(MediaLoopButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-loop-button': MediaLoopButton;
  }
}
