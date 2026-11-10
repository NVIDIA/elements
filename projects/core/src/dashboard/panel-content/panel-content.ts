// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';

import { useStyles } from '@nvidia-elements/foundations/internal/styles';

import styles from './panel-content.css?inline';

/**
 * @element nve-dashboard-panel-content
 * @description Provides padding for dashboard panel content.
 * @documentation https://nvidia.github.io/elements/docs/elements/dashboard/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/dashboard
 * @slot - Application content.
 * @cssprop --padding
 */
export class DashboardPanelContent extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = { tag: 'nve-dashboard-panel-content', version: '0.0.0', parents: ['nve-dashboard-panel'] };

  render() {
    return html`
      <div internal-host><slot></slot></div>
    `;
  }
}
