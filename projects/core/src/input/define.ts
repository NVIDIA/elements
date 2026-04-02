// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Input, InputGroup } from '@nvidia-elements/core/input';
import '@nvidia-elements/core/forms/define.js';

define(Input);
define(InputGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-input': Input;
    'nve-input-group': InputGroup;
  }
}
