// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/chevron.js';
import '@nvidia-elements/core/icon/icons/arrow-stop.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/select/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Pagination } from '@nvidia-elements/core/pagination';

define(Pagination);

declare global {
  interface HTMLElementTagNameMap {
    'nve-pagination': Pagination;
  }
}
