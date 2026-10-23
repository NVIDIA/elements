// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators/state.js';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import styles from './tabs-item-group.css?inline';

/**
 * @element nve-tabs-item-group
 * @description Groups a tab item with application-owned accessory controls.
 * @documentation https://nvidia.github.io/elements/docs/elements/tabs/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/tabs
 * @slot - A single nve-tabs-item.
 * @slot prefix - Controls before the tab item.
 * @slot suffix - Controls after the tab item.
 * @cssprop --gap - Spacing between the tab item and accessories.
 * @cssprop --height
 * @cssprop --padding
 * @cssprop --width
 * @cssprop --border-radius
 */
@audit()
export class TabsItemGroup extends LitElement {
  /** @private */
  @state() accessoryTabEnabled = true;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-tabs-item-group',
    version: '0.0.0',
    parents: ['nve-tabs'],
    children: ['nve-tabs-item']
  };

  render() {
    return html`
      <div internal-host>
        <slot name="prefix" tabindex=${this.accessoryTabEnabled ? nothing : -1}></slot>
        <slot></slot>
        <slot name="suffix" tabindex=${this.accessoryTabEnabled ? nothing : -1}></slot>
      </div>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.accessoryTabEnabled = true;
  }
}
