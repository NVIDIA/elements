// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { StarRating } from '@nvidia-elements/core/star-rating';
import '@nvidia-elements/core/forms/define.js';

define(StarRating);

declare global {
  interface HTMLElementTagNameMap {
    'nve-star-rating': StarRating;
  }
}
