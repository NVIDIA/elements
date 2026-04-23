// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import styles from './dropdown-header.css?inline';

/**
 * @element nve-dropdown-header
 * @description Displays a title or contextual label at the top of a dropdown menu to categorize its contents.
 * @since 0.36.0
 * @entrypoint \@nvidia-elements/core/dropdown
 * @slot - default slot for the dropdown header
 * @cssprop --border-bottom
 * @cssprop --padding
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
@audit()
export class DropdownHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-dropdown-header',
    version: '0.0.0',
    parents: ['nve-dropdown']
  };

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.slot = 'header';
  }
}
