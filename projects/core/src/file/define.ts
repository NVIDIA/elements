// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/forms/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { File } from '@nvidia-elements/core/file';

define(File);

declare global {
  interface HTMLElementTagNameMap {
    'nve-file': File;
  }
}
