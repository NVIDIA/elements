// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { PageLoader } from '@nvidia-elements/core/page-loader';

define(PageLoader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-page-loader': PageLoader;
  }
}
