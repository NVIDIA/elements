// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { AppHeader } from '@nvidia-elements/core/app-header';

define(AppHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-app-header': AppHeader;
  }
}
