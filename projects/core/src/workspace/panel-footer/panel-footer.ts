// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';

import { hostAttr } from '@nvidia-elements/core/internal';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';

import styles from './panel-footer.css?inline';

/**
 * @element nve-workspace-panel-footer
 * @description Provides workspace panel status and actions outside the scrolling body.
 * @documentation https://nvidia.github.io/elements/docs/elements/workspace/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/workspace
 * @slot - Status and actions.
 * @cssprop --padding
 * @cssprop --border-top
 * @cssprop --gap
 */
export class WorkspacePanelFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = { tag: 'nve-workspace-panel-footer', version: '0.0.0', parents: ['nve-workspace-panel'] };

  /** @private */
  @hostAttr() slot = 'footer';

  render() {
    return html`
      <div internal-host><slot></slot></div>
    `;
  }
}
