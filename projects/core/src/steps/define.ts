// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { StepsItem, Steps } from '@nvidia-elements/core/steps';

define(StepsItem);
define(Steps);

declare global {
  interface HTMLElementTagNameMap {
    'nve-steps-item': StepsItem;
    'nve-steps': Steps;
  }
}
