// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/calendar.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Datetime } from '@nvidia-elements/core/datetime';

define(Datetime);

declare global {
  interface HTMLElementTagNameMap {
    'nve-datetime': Datetime;
  }
}
