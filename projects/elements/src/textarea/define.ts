// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Textarea } from '@nvidia-elements/core/textarea';
import '@nvidia-elements/core/forms/define.js';

define(Textarea);

declare global {
  interface HTMLElementTagNameMap {
    'nve-textarea': Textarea;
  }
}
