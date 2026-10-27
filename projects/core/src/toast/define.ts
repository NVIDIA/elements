// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { Toast } from '@nvidia-elements/core/toast';

define(Toast);

declare global {
  interface HTMLElementTagNameMap {
    'nve-toast': Toast;
  }
}
