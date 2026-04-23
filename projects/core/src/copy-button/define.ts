// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { CopyButton } from '@nvidia-elements/core/copy-button';

define(CopyButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-copy-button': CopyButton;
  }
}
