// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/information-circle.js';
import '@nvidia-elements/core/icon/icons/exclamation-triangle.js';
import '@nvidia-elements/core/icon/icons/checkmark-circle.js';
import '@nvidia-elements/core/icon/icons/exclamation-circle.js';
import '@nvidia-elements/core/icon/icons/clock.js';
import '@nvidia-elements/core/icon/icons/x-circle.js';
import '@nvidia-elements/core/icon/icons/question-mark-circle.js';
import '@nvidia-elements/core/icon/icons/bar-pill-stack.js';
import '@nvidia-elements/core/icon/icons/running.js';
import '@nvidia-elements/core/icon/icons/refresh.js';
import '@nvidia-elements/core/icon/icons/stop-sign.js';
import '@nvidia-elements/core/icon/icons/circle-dash.js';
import '@nvidia-elements/core/icon/icons/circle-dot.js';
import '@nvidia-elements/core/icon/icons/circle-angled-line.js';
import '@nvidia-elements/core/icon/icons/cancel.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import { Alert, AlertGroup } from '@nvidia-elements/core/alert';
import { define } from '@nvidia-elements/foundations/internal/define';

define(Alert);
define(AlertGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-alert': Alert;
    'nve-alert-group': AlertGroup;
  }
}
