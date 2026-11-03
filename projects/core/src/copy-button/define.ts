// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/copy.js';
import '@nvidia-elements/core/icon/icons/check.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/toast/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { CopyButton } from '@nvidia-elements/core/copy-button';

define(CopyButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-copy-button': CopyButton;
  }
}
