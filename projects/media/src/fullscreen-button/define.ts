// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { MediaFullscreenButton } from '@nvidia-elements/media/fullscreen-button';

define(MediaFullscreenButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-fullscreen-button': MediaFullscreenButton;
  }
}
