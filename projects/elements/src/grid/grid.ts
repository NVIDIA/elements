import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { ContainerElement } from '@nvidia-elements/core/internal';
import {
  keyNavigationGrid,
  useStyles,
  attachInternals,
  appendRootNodeStyle,
  generateId,
  tagSelector,
  audit
} from '@nvidia-elements/core/internal';
import { GridPlaceholder } from './placeholder/placeholder.js';
import { GridHeader } from './header/header.js';
import { GridColumn } from './column/column.js';
import { GridFooter } from './footer/footer.js';
import { GridRow } from './row/row.js';
import { GridCell } from './cell/cell.js';
import styles from './grid.css?inline';
import globalStyles from './grid.global.css?inline';

/**
 * @element nve-grid
 * @description A versatile table/datagrid component with built-in keyboard navigation for displaying and interacting with structured data. Use it for anything from simple read-only tables to fully interactive, spreadsheet experiences.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/grid
 * @slot - default slot for content
 * @slot footer - slot for grid-footer or toolbar
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --box-shadow
 * @cssprop --font-size
 * @cssprop --row-height
 * @cssprop --scroll-height
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
@audit()
@keyNavigationGrid<Grid>()
export class Grid extends LitElement implements ContainerElement {
  /**
   * Determines the container styles of component. Flat is used for nesting the grid within other containers. Full can be used for full edge to edge viewport width grids.
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
    children: [GridRow.metadata.tag, GridHeader.metadata.tag, GridFooter.metadata.tag, GridPlaceholder.metadata.tag]
  };

  static elementDefinitions = {};

  get keynavGridConfig() {
    return {
      columns: this.#columns,
      rows: [this.#header, ...this.#rows],
      cells: [...this.#columns, ...this.#cells]
    };
  }

  get #rows() {
    return Array.from(this.querySelectorAll<GridRow>(tagSelector(GridRow.metadata.tag)));
  }

  get #header() {
    return this.querySelector<GridHeader>(tagSelector(GridHeader.metadata.tag));
  }

  get #columns() {
    return Array.from(this.querySelectorAll<GridColumn>(tagSelector(GridColumn.metadata.tag)));
  }

  get #cells() {
    return Array.from(this.querySelectorAll<GridCell>(tagSelector(GridCell.metadata.tag)));
  }

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <div part="_scrollbox">
          <slot></slot>
        </div>
        <slot name="footer"></slot>
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

  scrollTo(options?: ScrollToOptions): Promise<void>;
  scrollTo(x: number, y: number): Promise<void>;
  async scrollTo(...args: [options?: ScrollToOptions] | [x: number, y: number]): Promise<void> {
    await this.shadowRoot.querySelector('[part="_scrollbox"]')?.scrollTo(...(args as [ScrollToOptions]));
  }
}
