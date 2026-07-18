// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { MediaController } from '@nvidia-elements/media/controller';

define(MediaController);

declare global {
  interface HTMLElementTagNameMap {
    'nve-media-controller': MediaController;
  }
}
