// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Search } from '@nvidia-elements/core/search';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(Search);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-search': Search;
  }
}
