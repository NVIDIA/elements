// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import type { ContainerElement } from '@nvidia-elements/core/internal';
import {
  keyNavigationGrid,
  stateScroll,
  type StateScrollConfig,
  appendRootNodeStyle,
  generateId,
  audit
} from '@nvidia-elements/core/internal';
import { attachInternals } from '@nvidia-elements/foundations/internal/a11y';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import { GridPlaceholder } from './placeholder/placeholder.js';
import { GridHeader } from './header/header.js';
import { GridColumn } from './column/column.js';
import { GridFooter } from './footer/footer.js';
import { GridRow } from './row/row.js';
import { GridCell } from './cell/cell.js';
import type { DraggableGridRowController, DraggableGridColumnController } from './draggable.controller.js';
import styles from './grid.css?inline';
import globalStyles from './grid.global.css?inline';

/**
 * @element nve-grid
 * @description A versatile table/datagrid component with built-in keyboard navigation for displaying and interacting with structured data. Use it for anything from simple read-only tables to fully interactive, spreadsheet experiences.
 * @documentation https://nvidia.github.io/elements/docs/elements/data-grid/
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/grid
 * @slot - `nve-grid-header`, `nve-grid-row`, `nve-virtual-list`, and `nve-grid-placeholder` elements.
 * @slot footer - slot for grid-footer or toolbar
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --box-shadow
 * @cssprop --font-size
 * @cssprop --row-height - fixed height of each row
 * @cssprop --scroll-height - height of the scrollable area
 * @event draggable-start - Pickup intent with Foundations DraggableSourceDetail. The application owns row and column order.
 * @event draggable-drag - Native movement with Foundations DraggableSourceDetail.
 * @event draggable-enter - A proposed row or column placement changed, with Foundations DraggableDropDetail.
 * @event draggable-over - Native movement over a valid placement with Foundations DraggableDropDetail.
 * @event draggable-leave - A proposed placement cleared, with Foundations DraggableDropDetail.
 * @event draggable-drop - Reorder request with Foundations DraggableDropDetail: source, target, sourceContainer, targetContainer, sourceIndex, targetIndex, placement, and interaction. Indices describe rendered rows or headers, excluding placeholders; targetIndex is the destination insertion index after source removal. The destination grid emits the event without moving DOM. For columns, reorder headers and every row's cells together. For virtual rows, map element identities to logical data; replacing the rendered window cancels pickup. Native dragging, keyboard pickup with arrows and Enter/Space, and click/tap placement share this contract.
 * @event draggable-end - Pickup ended with Foundations DraggableEndDetail; dropped indicates a request fired, not application acceptance.
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
@audit()
@stateScroll<Grid>()
@keyNavigationGrid<Grid>()
export class Grid extends LitElement implements ContainerElement {
  /** Enable handle-based row movement and transfers between row-enabled grids. Place a visible grid placeholder after the rows to accept append drops. In grids without a virtual list, the placeholder fills the remaining scroll area. Applications apply or ignore draggable-drop requests. */
  @property({ type: Boolean, attribute: 'draggable-rows', reflect: true }) draggableRows = false;

  /** Enable handle-based column reordering within this grid. Update the column data and all row cells in the draggable-drop handler. */
  @property({ type: Boolean, attribute: 'draggable-columns' }) draggableColumns = false;

  @state() private announcement = '';
  #announce = (message: string) => {
    this.announcement = message;
  };

  #draggableRows?: DraggableGridRowController;
  #draggableColumns?: DraggableGridColumnController;

  protected override scheduleUpdate() {
    const needsRows = this.draggableRows && !this.#draggableRows;
    const needsColumns = this.draggableColumns && !this.#draggableColumns;
    if (!needsRows && !needsColumns) return super.scheduleUpdate();

    return import('./draggable.controller.js').then(({ DraggableGridRowController, DraggableGridColumnController }) => {
      if (this.draggableRows) this.#draggableRows ??= new DraggableGridRowController(this, this.#announce);
      if (this.draggableColumns) this.#draggableColumns ??= new DraggableGridColumnController(this, this.#announce);
      return super.scheduleUpdate();
    });
  }

  /**
   * Determines the container styles of component. Flat nests the grid within other containers. Full spans the full edge-to-edge viewport width.
   */
  @property({ type: String, reflect: true }) container?: 'flat' | 'full';

  /**
   * Determine style variant stripe rows
   */
  @property({ type: Boolean, reflect: true }) stripe: boolean;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid',
    version: '0.0.0',
    children: [
      GridRow.metadata.tag,
      GridHeader.metadata.tag,
      GridFooter.metadata.tag,
      GridPlaceholder.metadata.tag,
      'nve-virtual-list'
    ]
  };

  static elementDefinitions = {};

  /** @private */
  get keynavGridConfig() {
    const header = this.#header;
    return {
      columns: this.#columns,
      rows: header ? [header, ...this.#rows] : this.#rows,
      cells: this.#cells
    };
  }

  get #scrollTarget() {
    return (
      this.querySelector<HTMLElement>(':scope > nve-virtual-list') ??
      this.shadowRoot?.querySelector<HTMLElement>('[part="_scrollbox"]') ??
      undefined
    );
  }

  /** @private */
  get stateScrollConfig(): StateScrollConfig {
    const target = this.#scrollTarget;
    return {
      target
    };
  }

  get #rows() {
    return Array.from(this.querySelectorAll<GridRow>(GridRow.metadata.tag));
  }

  get #header() {
    return this.querySelector<GridHeader>(GridHeader.metadata.tag);
  }

  get #columns() {
    return Array.from(this.querySelectorAll<GridColumn>(GridColumn.metadata.tag));
  }

  get #cells() {
    return Array.from(this.querySelectorAll<GridCell>(GridCell.metadata.tag));
  }

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <div part="_scrollbox">
          <slot part="_content" @slotchange=${() => this.requestUpdate()}></slot>
        </div>
        <slot name="footer"></slot>
        <span class="announcement" role="status" aria-live="polite" aria-atomic="true">${this.announcement}</span>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'grid';
    this.id ||= generateId();
    appendRootNodeStyle(this, globalStyles);
  }

  /**
   * Scroll to a specific position in the grid.
   */
  scrollTo(options?: ScrollToOptions): Promise<void>;
  scrollTo(x: number, y: number): Promise<void>;
  async scrollTo(...args: [options?: ScrollToOptions] | [x: number, y: number]): Promise<void> {
    const target = this.#scrollTarget;
    const options = typeof args[0] === 'number' ? { left: args[0], top: args[1] } : (args[0] ?? {});
    if (target?.localName === 'nve-virtual-list') {
      this.shadowRoot
        ?.querySelector('[part="_scrollbox"]')
        ?.scrollTo({ left: options.left, behavior: options.behavior });
      target.scrollTo({ top: options.top, behavior: options.behavior });
    } else target?.scrollTo(options);
  }
}
