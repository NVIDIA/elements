// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { MediaSeekButton } from '@nvidia-elements/media/seek-button';

define(MediaSeekButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-seek-button': MediaSeekButton;
  }
}
