// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Password } from '@nvidia-elements/core/password';
import '@nvidia-elements/core/forms/define.js';

define(Password);

declare global {
  interface HTMLElementTagNameMap {
    'nve-password': Password;
  }
}
