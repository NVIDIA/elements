// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { appendRootNodeStyle } from '@nvidia-elements/core/internal';
import { attachInternals } from '@nvidia-elements/foundations/internal/a11y';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import type { Grid } from '@nvidia-elements/core/grid';
import styles from './column.css?inline';

/**
 * @element nve-grid-column
 * @description Defines a column header within a grid, specifying the column's label, width, and alignment for all cells beneath it.
 * @documentation https://nvidia.github.io/elements/docs/elements/data-grid/
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/grid
 * @slot - Column heading text or controls.
 * @slot actions - slot for column actions
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --font-weight
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --min-width
 * @cssprop --justify-content
 * @cssprop --border-left
 * @cssprop --border-right
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export class GridColumn extends LitElement {
  /**
   * Only set a fixed px width when you know the grid width. Most cases this should remain unset.
   * If the total width of all columns is less than the grid width then the last column fills the remaining space.
   * By default column widths are evenly divided unless width is explicitly provided.
   */
  @property({ type: String, reflect: true }) width: string;

  /**
   * Set the `position` property or attribute to `fixed` or `sticky` to make the column fixed or sticky.
   * Fixed columns do not scroll horizontally with the grid. Sticky columns scroll horizontally with the grid
   * until the column reaches the edge of the grid.
   */
  @property({ type: String, reflect: true }) position: 'fixed' | 'sticky' | '';

  /**
   * Control the content alignment within a given column.
   */
  @property({ type: String, reflect: true, attribute: 'column-align' }) columnAlign: 'start' | 'center' | 'end';

  /**
   * @private
   */
  @property({ type: String, reflect: true, attribute: 'aria-colindex' }) ariaColIndex: string; // eslint-disable-line local/reserved-property-names

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-column',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  get #grid() {
    return this.parentElement!.parentElement as Grid;
  }

  render() {
    return html`
      <div internal-host focusable="active">
        <slot></slot>
        <slot name="actions"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'columnheader';
    this.addEventListener('sort', this.#onSort);
    const root = this.getRootNode();
    if (root instanceof Document || root instanceof ShadowRoot) this.#styleRoot = root;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('sort', this.#onSort);
    if (this.#styleRoot) {
      this.#styleRoot.adoptedStyleSheets = this.#styleRoot.adoptedStyleSheets.filter(
        sheet => sheet !== this.#positionStylesheet && sheet !== this.#alignmentStylesheet
      );
    }
    this.#positionStylesheet = undefined;
    this.#alignmentStylesheet = undefined;
    this.#styleRoot = undefined;
  }

  #onSort = (e: Event) => {
    this.ariaSort = (e as CustomEvent<{ next: string }>).detail.next;
  };

  willUpdate(props: PropertyValues<this>) {
    if (props.has('width') && this.width && Number.isFinite(Number(this.width))) {
      this.width = `${this.width}px`; // eslint-disable-line local/stateless-property
    }
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);

    if (props.get('columnAlign') !== this.columnAlign) {
      this.#computeColumnAlignment();
    }

    if (props.get('position') !== this.position) {
      this.#computeColumnPositions();
    }

    if (props.get('ariaColIndex') !== this.ariaColIndex) {
      this.#computeColumnPositions();
      this.#computeColumnAlignment();
    }

    if (props.get('width') !== this.width) {
      this.dispatchEvent(new CustomEvent('nve-grid-column-resize', { bubbles: true, composed: true }));
    }
  }

  #positionStylesheet?: CSSStyleSheet;
  #styleRoot?: Document | ShadowRoot;
  #alignmentStylesheet?: CSSStyleSheet;

  /** @private Refresh column-owned rules after the header settles its current order and widths. */
  refreshLayout() {
    this.#computeColumnAlignment();
    this.#computeColumnPositions();
  }

  #computeColumnPositions() {
    if (!this.isConnected || !this.#grid || !this.ariaColIndex) return;
    if (this.position !== 'fixed') {
      this.removeAttribute('left');
      this.removeAttribute('right');
      this.#positionStylesheet?.replaceSync('');
      return;
    }

    const { side, positionStyle, borderStyle } = this.#buildFixedStyles();
    const combinedStyle = `${positionStyle}\n${borderStyle}`;

    if (this.#positionStylesheet) {
      this.#positionStylesheet.replaceSync(combinedStyle);
    } else {
      this.#positionStylesheet = appendRootNodeStyle(this.#grid, combinedStyle);
    }

    this.setAttribute(side, '');
    this.removeAttribute(side === 'left' ? 'right' : 'left');
  }

  #buildFixedStyles() {
    const header = this.parentElement!;
    const layout = this.assignedSlot?.parentElement ?? header;
    const { direction, paddingLeft, paddingRight } = getComputedStyle(layout);
    const columns = Array.from(header.querySelectorAll<GridColumn>(GridColumn.metadata.tag));
    const rtl = direction === 'rtl';
    if (rtl) columns.reverse();
    const index = columns.indexOf(this);
    const rightStyle = columns
      .slice(index + 1)
      .reduce((width, column) => width + column.getBoundingClientRect().width, 0);
    // Track widths stay stable when sticky positioning shifts a column during scrolling.
    const leftStyle = rtl
      ? layout.getBoundingClientRect().width -
        parseFloat(paddingRight) -
        rightStyle -
        this.getBoundingClientRect().width
      : columns
          .slice(0, index)
          .reduce((width, column) => width + column.getBoundingClientRect().width, parseFloat(paddingLeft));
    const side = leftStyle < this.#grid.getBoundingClientRect().width / 2 ? 'left' : 'right';
    const selector = `[id='${this.#grid.id}'] nve-grid-column:nth-of-type(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-cell:nth-of-type(${this.ariaColIndex})`;

    const positionStyle = `
        ${selector} {
          position: sticky;
          z-index: 99;
          ${side === 'left' ? `left: ${leftStyle}px;` : `right: ${rightStyle}px;`}
        }
      `;

    const neighbor = columns[index + (side === 'left' ? 1 : -1)];
    const borderStyle = this.#buildBorderStyle(selector, side, neighbor);
    return { side, positionStyle, borderStyle };
  }

  #buildBorderStyle(selector: string, side: 'left' | 'right', neighbor?: GridColumn) {
    if (neighbor?.position === this.position) {
      return '';
    }

    return `
        ${selector} {
          box-shadow: var(--scroll-shadow);
          clip-path: inset(0px ${side === 'left' ? '-4px' : '0'} 0px ${side === 'right' ? '-4px' : '0'});
          --border-${side === 'right' ? 'left' : 'right'}: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
        }
      `;
  }

  #computeColumnAlignment() {
    if (!this.isConnected || !this.#grid || !this.ariaColIndex) return;
    const rule =
      this.columnAlign === undefined
        ? ''
        : `[id='${this.#grid.id}'] nve-grid-column:nth-of-type(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-cell:nth-of-type(${this.ariaColIndex}) {
          --justify-content: ${this.columnAlign}
        }`;
    if (this.#alignmentStylesheet) this.#alignmentStylesheet.replaceSync(rule);
    else if (rule) this.#alignmentStylesheet = appendRootNodeStyle(this.#grid, rule);
  }
}
