// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Dropzone } from '@nvidia-elements/core/dropzone';

define(Dropzone);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dropzone': Dropzone;
  }
}
