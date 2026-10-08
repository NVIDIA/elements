// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { MediaLoopButton } from '@nvidia-elements/media/loop-button';

define(MediaLoopButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-loop-button': MediaLoopButton;
  }
}
