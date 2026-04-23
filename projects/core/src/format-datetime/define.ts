// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { FormatDatetime } from '@nvidia-elements/core/format-datetime';

define(FormatDatetime);

declare global {
  interface HTMLElementTagNameMap {
    'nve-format-datetime': FormatDatetime;
  }
}
