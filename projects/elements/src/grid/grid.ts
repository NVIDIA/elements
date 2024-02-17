import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import {
  keyNavigationGrid,
  useStyles,
  attachInternals,
  appendRootNodeStyle,
  generateId,
  ContainerElement,
  validateSlots
} from '@elements/elements/internal';
import { GridHeader } from './header/header.js';
import { GridColumn } from './column/column.js';
import { GridRow } from './row/row.js';
import { GridCell } from './cell/cell.js';
import styles from './grid.css?inline';
import globalStyles from './grid.global.css?inline';

/**
 * @element nve-grid
 * @description A grid widget is a container that enables users to navigate the information or interactive elements it contains using directional navigation keys, such as arrow keys, Home, and End. As a generic container widget that offers flexible keyboard navigation, it can serve a wide variety of needs. It can be used for purposes as simple as grouping a collection of checkboxes or navigation links or as complex as creating a full-featured spreadsheet application. - ARIA Authoring Practices Guide
 * @since 0.11.0
 * @slot - default slot for content
 * @slot footer - slot for grid-footer or toolbar
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --box-shadow
 * @cssprop --font-size
 * @cssprop --row-height
 * @cssprop --scroll-height
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-data-grid-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
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
    version: 'PACKAGE_VERSION',
    children: ['nve-grid-row', 'nve-grid-header', 'nve-grid-placeholder']
  };

  static elementDefinitions = {};

  get keynavGridConfig() {
    return {
      columns: this.columns,
      rows: [this.header, ...this.rows],
      cells: [...this.columns, ...this.cells]
    };
  }

  @queryAssignedElements({ selector: GridHeader.metadata.tag, flatten: true }) private header!: GridHeader;

  @queryAssignedElements({ selector: GridRow.metadata.tag, flatten: true }) private rows!: GridRow[];

  @queryAssignedElements({ selector: GridColumn.metadata.tag, flatten: true }) private columns!: GridColumn[];

  @queryAssignedElements({ selector: GridCell.metadata.tag, flatten: true }) private cells!: GridColumn[];

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

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    validateSlots(this);
  }

  scrollTo(x: number, y: number): void;
  scrollTo(options?: ScrollToOptions): void;
  scrollTo(...args): void {
    this.shadowRoot.querySelector('[part="scrollbox"]').scrollTo(...args);
  }
}
