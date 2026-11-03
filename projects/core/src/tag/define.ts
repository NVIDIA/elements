// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/cancel.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Tag } from '@nvidia-elements/core/tag';

define(Tag);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tag': Tag;
  }
}
