// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { FormatNumber } from '@nvidia-elements/core/format-number';

define(FormatNumber);

declare global {
  interface HTMLElementTagNameMap {
    'nve-format-number': FormatNumber;
  }
}
