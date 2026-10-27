// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/foundations/internal/define';
import { PageHeader } from '@nvidia-elements/core/page-header';

define(PageHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-page-header': PageHeader;
  }
}
