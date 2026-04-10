// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { useStyles, attachInternals } from '@nvidia-elements/core/internal';
import styles from './cell.css?inline';

/**
 * @element nve-grid-cell
 * @description Represents an individual data cell within a grid row, displaying content aligned to its parent column.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/grid
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --min-height
 * @cssprop --min-width
 * @cssprop --font-weight
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --border-left
 * @cssprop --border-right
 * @cssprop --justify-content
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export class GridCell extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-cell',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host focusable="active">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'gridcell';
  }
}
