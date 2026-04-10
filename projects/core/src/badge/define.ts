// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Badge } from '@nvidia-elements/core/badge';

define(Badge);

declare global {
  interface HTMLElementTagNameMap {
    'nve-badge': Badge;
  }
}
