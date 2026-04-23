// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Time } from '@nvidia-elements/core/time';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Time);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-time': Time;
  }
}
