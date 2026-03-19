// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, attachInternals, stateSelected, audit } from '@nvidia-elements/core/internal';
import { GridCell } from '../cell/cell.js';
import styles from './row.css?inline';

/**
 * @element nve-grid-row
 * @description Represents a horizontal row of data cells within a grid, supporting selection and interactive states.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/grid
 * @slot - default slot for `nve-grid-cell`
 * @cssprop --background
 * @cssprop --border-bottom
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
@stateSelected()
@audit()
export class GridRow extends LitElement {
  /**
   * Setting the `selected` property or attribute to `true` shows the row in a selected state.
   */
  @property({ type: Boolean }) selected: boolean;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-row',
    version: '0.0.0',
    children: [GridCell.metadata.tag]
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
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
