// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Pagination } from '@nvidia-elements/core/pagination';

define(Pagination);

declare global {
  interface HTMLElementTagNameMap {
    'nve-pagination': Pagination;
  }
}
