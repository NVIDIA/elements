// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Toolbar } from '@nvidia-elements/core/toolbar';

define(Toolbar);

declare global {
  interface HTMLElementTagNameMap {
    'nve-toolbar': Toolbar;
  }
}
