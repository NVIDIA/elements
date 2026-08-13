// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { FormatTruncate } from '@nvidia-elements/core/format-truncate';

define(FormatTruncate);

declare global {
  interface HTMLElementTagNameMap {
    'nve-format-truncate': FormatTruncate;
  }
}
