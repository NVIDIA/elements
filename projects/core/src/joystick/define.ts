// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { Joystick } from '@nvidia-elements/core/joystick';

define(Joystick);

declare global {
  interface HTMLElementTagNameMap {
    'nve-joystick': Joystick;
  }
}
