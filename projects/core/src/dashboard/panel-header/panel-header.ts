// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement } from 'lit';

import { hostAttr } from '@nvidia-elements/core/internal';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';

import styles from './panel-header.css?inline';

/**
 * @element nve-dashboard-panel-header
 * @description Supplies the required dashboard panel title and application controls.
 * @documentation https://nvidia.github.io/elements/docs/elements/dashboard/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/dashboard
 * @slot - Noninteractive title used as the default accessible panel name. Heading semantics remain application owned.
 * @slot prefix - Title decoration.
 * @slot suffix - Application controls.
 * @cssprop --padding
 * @cssprop --suffix-padding - Padding around application actions. Defaults to 4px.
 * @cssprop --gap
 * @cssprop --min-height
 */
export class DashboardPanelHeader extends LitElement {
  static styles = useStyles([styles]);
  static readonly metadata = { tag: 'nve-dashboard-panel-header', version: '0.0.0', parents: ['nve-dashboard-panel'] };

  /** @private */
  @hostAttr() slot = 'header';

  render() {
    return html`<div internal-host>
      <div class="title-group"><slot name="prefix" ?data-empty=${!isServer && !this.querySelector(':scope > [slot="prefix"]')} @slotchange=${() => this.requestUpdate()}></slot><div class="title"><slot></slot></div></div>
      <div class="suffix" ?data-empty=${!isServer && !this.querySelector(':scope > [slot="suffix"]')}><slot name="suffix" @slotchange=${() => this.requestUpdate()}></slot></div>
    </div>`;
  }
}
