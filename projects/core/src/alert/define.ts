// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert, AlertGroup, AlertBanner } from '@nvidia-elements/core/alert';
import { define } from '@nvidia-elements/core/internal';

define(Alert);
define(AlertGroup);
define(AlertBanner);

declare global {
  interface HTMLElementTagNameMap {
    'nve-alert': Alert;
    'nve-alert-group': AlertGroup;
  }
}
