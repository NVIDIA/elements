// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { Button } from '@nvidia-elements/core/button';

define(Button);

declare global {
  interface HTMLElementTagNameMap {
    'nve-button': Button;
  }
}
