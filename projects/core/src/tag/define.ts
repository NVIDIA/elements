// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { Tag } from '@nvidia-elements/core/tag';

define(Tag);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tag': Tag;
  }
}
