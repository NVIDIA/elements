// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/star.js';
import '@nvidia-elements/core/icon/icons/star-half.js';
import '@nvidia-elements/core/icon/icons/star-stroke.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/icon/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { StarRating } from '@nvidia-elements/core/star-rating';

define(StarRating);

declare global {
  interface HTMLElementTagNameMap {
    'nve-star-rating': StarRating;
  }
}
