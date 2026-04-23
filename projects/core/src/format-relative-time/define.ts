// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { FormatRelativeTime } from '@nvidia-elements/core/format-relative-time';

define(FormatRelativeTime);

declare global {
  interface HTMLElementTagNameMap {
    'nve-format-relative-time': FormatRelativeTime;
  }
}
