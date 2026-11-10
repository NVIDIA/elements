// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement } from 'lit';

import { hostAttr } from '@nvidia-elements/core/internal';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';

import styles from './panel-footer.css?inline';

/**
 * @element nve-dashboard-panel-footer
 * @description Provides dashboard panel status and actions outside the scrolling body.
 * @documentation https://nvidia.github.io/elements/docs/elements/dashboard/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/dashboard
 * @slot - Status and supporting content in a bounded scrolling area.
 * @slot suffix - Application actions in a bounded scrolling area before the reserved resize control.
 * @cssprop --padding
 * @cssprop --suffix-padding - Padding around application actions. Defaults to 4px.
 * @cssprop --gap
 */
export class DashboardPanelFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = { tag: 'nve-dashboard-panel-footer', version: '0.0.0', parents: ['nve-dashboard-panel'] };

  /** @private */
  @hostAttr() slot = 'footer';

  render() {
    return html`
      <div internal-host><div class="content"><slot></slot></div><div class="suffix" ?data-empty=${!isServer && !this.querySelector(':scope > [slot="suffix"]')}><slot name="suffix" @slotchange=${() => this.requestUpdate()}></slot></div></div>
    `;
  }
}
