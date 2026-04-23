// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { ProgressBar } from '@nvidia-elements/core/progress-bar';

define(ProgressBar);

declare global {
  interface HTMLElementTagNameMap {
    'nve-progress-bar': ProgressBar;
  }
}
