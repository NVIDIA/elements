import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { keyNavigationGrid, useStyles, attachInternals, appendRootNodeStyle, generateId, stateScroll, ContainerElement } from '@elements/elements/internal';
import type { GridHeader } from './header/header.js';
import type { GridColumn } from './column/column.js';
import type { GridRow } from './row/row.js';
import type { GridCell } from './cell/cell.js';
import styles from './grid.css?inline';
import globalStyles from './grid.global.css?inline';

/**
 * @element mlv-grid
 * @slot - default slot for content
 * @cssprop --background
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-grid-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 * @stable false
 * @responsive false
 */
@stateScroll<Grid>()
@keyNavigationGrid<Grid>()
export class Grid extends LitElement implements ContainerElement {
  /** flat (embed into parent container) or full (full parent container width) */
  @property({ type: String, reflect: true }) container?: 'flat' | 'full';

  /** determine style variant stripe rows */
  @property({ type: Boolean, reflect: true }) stripe: boolean;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-grid',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {

  };

  get keynavGridConfig() {
    return {
      columns: this.#columns,
      rows: [this.querySelector<GridHeader>('mlv-grid-header'), ...this.#rows],
      cells: [...this.#columns, ...this.#cells]
    }
  }

  get stateScrollConfig() {
    return {
      target: this.shadowRoot.querySelector<HTMLElement>('[part=scrollbox]'),
      scrollOffset: 100
    }
  }

  get #columns() {
    return Array.from(this.querySelectorAll<GridColumn>('mlv-grid-column'));
  }

  get #rows() {
    return Array.from(this.querySelectorAll<GridRow>('mlv-grid-row'));
  }

  get #cells() {
    return Array.from(this.querySelectorAll<GridCell>('mlv-grid-cell'));
  }

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <div role="rowgroup" part="scrollbox">
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
}
