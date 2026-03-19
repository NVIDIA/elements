// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Combobox } from '@nvidia-elements/core/combobox';
import '@nvidia-elements/core/forms/define.js';

define(Combobox);

declare global {
  interface HTMLElementTagNameMap {
    'nve-combobox': Combobox;
  }
}
