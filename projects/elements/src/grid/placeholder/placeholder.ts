// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { useStyles, attachInternals } from '@nvidia-elements/core/internal';
import styles from './placeholder.css?inline';

/**
 * @element nve-grid-placeholder
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/grid
 * @description Placeholder displays a message while data loads for the grid or shows empty states for datasets.
 * @slot - default slot for content
 * @cssprop --color
 * @cssprop --padding
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export class GridPlaceholder extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-placeholder',
    version: '0.0.0'
  };

  /** @private */
  _internals: ElementInternals;

  render() {
    return html`
      <div internal-host focusable="active" role="gridcell">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'row';
  }
}
