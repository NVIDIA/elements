// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { ScrollBox } from '@nvidia-elements/foundations/scroll-box';

define(ScrollBox);

declare global {
  interface HTMLElementTagNameMap {
    'nve-scroll-box': ScrollBox;
  }
}
