// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Logo } from '@nvidia-elements/core/logo';

define(Logo);

declare global {
  interface HTMLElementTagNameMap {
    'nve-logo': Logo;
  }
}
