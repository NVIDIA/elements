// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import styles from './toggletip-header.css?inline';

/**
 * @element nve-toggletip-header
 * @description Displays a title or contextual label at the top of a toggletip to categorize its contents.
 * @since 0.38.0
 * @entrypoint \@nvidia-elements/core/toggletip
 * @slot - default slot for the toggletip header
 * @cssprop --border-bottom
 * @cssprop --padding
 * @cssprop --border-radius
 *
 */
@audit()
export class ToggletipHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-toggletip-header',
    version: '0.0.0',
    parents: ['nve-toggletip']
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
