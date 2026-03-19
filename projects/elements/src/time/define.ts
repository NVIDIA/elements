// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Time } from '@nvidia-elements/core/time';
import '@nvidia-elements/core/forms/define.js';

define(Time);

declare global {
  interface HTMLElementTagNameMap {
    'nve-time': Time;
  }
}
