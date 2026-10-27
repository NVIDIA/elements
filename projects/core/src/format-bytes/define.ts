// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { FormatBytes } from '@nvidia-elements/core/format-bytes';

define(FormatBytes);

declare global {
  interface HTMLElementTagNameMap {
    'nve-format-bytes': FormatBytes;
  }
}
