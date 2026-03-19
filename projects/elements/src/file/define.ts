// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { File } from '@nvidia-elements/core/file';
import '@nvidia-elements/core/forms/define.js';

define(File);

declare global {
  interface HTMLElementTagNameMap {
    'nve-file': File;
  }
}
