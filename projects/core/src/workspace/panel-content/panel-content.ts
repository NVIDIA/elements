// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';

import { useStyles } from '@nvidia-elements/foundations/internal/styles';

import styles from './panel-content.css?inline';

/**
 * @element nve-workspace-panel-content
 * @description Wraps application content in the workspace panel body and provides its padding. Place the panel's title and actions in its header or footer.
 * @documentation https://nvidia.github.io/elements/docs/elements/workspace/
 * @since 2.23.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/workspace
 * @slot - Application content.
 * @cssprop --padding
 */
export class WorkspacePanelContent extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = { tag: 'nve-workspace-panel-content', version: '0.0.0', parents: ['nve-workspace-panel'] };

  render() {
    return html`
      <div internal-host><slot></slot></div>
    `;
  }
}
