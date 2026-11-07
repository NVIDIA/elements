// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/eye.js';
import '@nvidia-elements/core/icon/icons/eye-hidden.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Password } from '@nvidia-elements/core/password';

define(Password);

declare global {
  interface HTMLElementTagNameMap {
    'nve-password': Password;
  }
}
