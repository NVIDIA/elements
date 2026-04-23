// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Icon, mergeIcons } from '@nvidia-elements/core/icon';

define(Icon);
if (customElements.get(Icon.metadata.tag)) {
  mergeIcons(customElements.get(Icon.metadata.tag) as typeof Icon);
}

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon': Icon;
  }
}
