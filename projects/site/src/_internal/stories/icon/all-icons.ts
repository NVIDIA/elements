// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';

import { ICON_NAMES } from '@nvidia-elements/core/icon';
import type { IconName } from '@nvidia-elements/core/icon';

@customElement('all-icons')
export class AllIcons extends LitElement {
  render() {
    return html`
      ${ICON_NAMES.map(iconName => html`<nve-icon name=${iconName as IconName}></nve-icon>\n`)}
    `;
  }
}
