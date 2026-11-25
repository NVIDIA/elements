// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import styles from './dropdown-header.css?inline';

/**
 * @element nve-dropdown-header
 * @description Displays a title or contextual label above a dropdown's options. Use the header to identify the set of choices before users browse it.
 * @documentation https://nvidia.github.io/elements/docs/elements/dropdown/
 * @since 0.36.0
 * @entrypoint \@nvidia-elements/core/dropdown
 * @slot - default slot for the dropdown header
 * @cssprop --border-bottom
 * @cssprop --padding
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
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
