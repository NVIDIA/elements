// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/picture-in-picture.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { MediaPipButton } from '@nvidia-elements/media/pip-button';

define(MediaPipButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-pip-button': MediaPipButton;
  }
}
