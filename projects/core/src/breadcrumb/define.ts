// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Breadcrumb } from '@nvidia-elements/core/breadcrumb';

define(Breadcrumb);

declare global {
  interface HTMLElementTagNameMap {
    'nve-breadcrumb': Breadcrumb;
  }
}
