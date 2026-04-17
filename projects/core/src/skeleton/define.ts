// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Skeleton } from '@nvidia-elements/core/skeleton';

define(Skeleton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-skeleton': Skeleton;
  }
}
