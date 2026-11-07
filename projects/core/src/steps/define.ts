// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/check.js';
import '@nvidia-elements/core/icon/icons/exclamation-circle.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/progress-ring/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { StepsItem, Steps } from '@nvidia-elements/core/steps';

define(StepsItem);
define(Steps);

declare global {
  interface HTMLElementTagNameMap {
    'nve-steps-item': StepsItem;
    'nve-steps': Steps;
  }
}
