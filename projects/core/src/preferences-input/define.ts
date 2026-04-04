// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { PreferencesInput } from '@nvidia-elements/core/preferences-input';

define(PreferencesInput);

declare global {
  interface HTMLElementTagNameMap {
    'nve-preferences-input': PreferencesInput;
  }
}
