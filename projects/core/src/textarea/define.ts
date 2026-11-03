// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/forms/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Textarea } from '@nvidia-elements/core/textarea';

define(Textarea);

declare global {
  interface HTMLElementTagNameMap {
    'nve-textarea': Textarea;
  }
}
