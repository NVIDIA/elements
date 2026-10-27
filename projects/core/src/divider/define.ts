// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { Divider } from '@nvidia-elements/core/divider';

define(Divider);

declare global {
  interface HTMLElementTagNameMap {
    'nve-divider': Divider;
  }
}
