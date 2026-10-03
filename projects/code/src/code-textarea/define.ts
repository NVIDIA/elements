// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { CodeTextarea } from '@nvidia-elements/code/code-textarea';

define(CodeTextarea);

declare global {
  interface HTMLElementTagNameMap {
    'nve-code-textarea': CodeTextarea;
  }
}
