// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import styles from './dialog-footer.css?inline';

/**
 * @element nve-dialog-footer
 * @description Contains the action buttons and controls at the bottom of a dialog for confirming, canceling, or navigating.
 * @since 0.6.0
 * @entrypoint \@nvidia-elements/core/dialog
 * @slot - default slot for the dialog footer
 * @cssprop --border-top
 * @cssprop --padding
 * @cssprop --gap
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
@audit()
export class DialogFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-dialog-footer',
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
    this.slot = 'footer';
  }
}
