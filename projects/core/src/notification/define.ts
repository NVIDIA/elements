// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '@nvidia-elements/core/icon/icons/information-circle.js';
import '@nvidia-elements/core/icon/icons/exclamation-triangle.js';
import '@nvidia-elements/core/icon/icons/checkmark-circle.js';
import '@nvidia-elements/core/icon/icons/exclamation-circle.js';
import '@nvidia-elements/core/icon/icons/cancel.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import { define } from '@nvidia-elements/foundations/internal/define';
import { Notification, NotificationGroup } from '@nvidia-elements/core/notification';

define(Notification);
define(NotificationGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-notification': Notification;
    'nve-notification-group': NotificationGroup;
  }
}
