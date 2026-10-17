// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Ghost } from '@nvidia-elements/core/ghost';
import { define } from '@nvidia-elements/core/internal';

define(Ghost);

declare global {
  interface HTMLElementTagNameMap {
    'nve-ghost': Ghost;
  }
}
