// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';

define(IconButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon-button': IconButton;
  }
}
