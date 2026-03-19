// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Select } from '@nvidia-elements/core/select';
import '@nvidia-elements/core/forms/define.js';

define(Select);

declare global {
  interface HTMLElementTagNameMap {
    'nve-select': Select;
  }
}
