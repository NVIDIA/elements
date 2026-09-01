// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Icon, mergeIcons } from '@nvidia-elements/core/icon';

define(Icon);
if (customElements.get(Icon.metadata.tag)) {
  const icon = customElements.get(Icon.metadata.tag) as typeof Icon;

  // deprecated icons
  icon.alias({
    'thumb-stroke': 'thumb',
    'bell-stroke': 'bell',
    'bookmark-stroke': 'bookmark',
    'dot-stroke': 'dot',
    'filter-stroke': 'filter',
    'flag-stroke': 'flag',
    'globe-alt-stroke': 'globe-alt',
    'information-circle-stroke': 'information-circle',
    'pointer-stroke': 'pointer',
    'question-mark-circle-stroke': 'question-mark-circle'
  });

  mergeIcons(icon);
}

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon': Icon;
  }
}
