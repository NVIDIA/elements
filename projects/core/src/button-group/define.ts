// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { ButtonGroup } from '@nvidia-elements/core/button-group';

define(ButtonGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-button-group': ButtonGroup;
  }
}
