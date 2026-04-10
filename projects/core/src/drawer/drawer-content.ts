// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import styles from './drawer-content.css?inline';

/**
 * @element nve-drawer-content
 * @description Contains the scrollable main body content within a drawer panel.
 * @since 0.16.0
 * @entrypoint \@nvidia-elements/core/drawer
 * @slot - default slot for the drawer content
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --width
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
@audit()
export class DrawerContent extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-drawer-content',
    version: '0.0.0',
    parents: ['nve-drawer']
  };

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}
