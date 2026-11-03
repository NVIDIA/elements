// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/clock.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Time } from '@nvidia-elements/core/time';

define(Time);

declare global {
  interface HTMLElementTagNameMap {
    'nve-time': Time;
  }
}
