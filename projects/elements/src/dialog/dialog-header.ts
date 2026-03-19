// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import styles from './dialog-header.css?inline';

/**
 * @element nve-dialog-header
 * @description Displays the title and contextual information at the top of a dialog to orient users to the dialog's purpose.
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/dialog
 * @slot - default slot for the dialog header
 * @cssprop --border-bottom
 * @cssprop --padding
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
@audit()
export class DialogHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-dialog-header',
    version: '0.0.0',
    parents: ['nve-dialog']
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
