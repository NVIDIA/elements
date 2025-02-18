import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import {
  useStyles,
  attachInternals,
  debounce,
  LogService,
  tagSelector,
  audit,
  GlobalStateService
} from '@nvidia-elements/core/internal';
import styles from './header.css?inline';
import { GridColumn } from '../column/column.js';
import type { Grid } from '../grid.js';
import { GridRow } from '../row/row.js';
import { GridCell } from '../cell/cell.js';

/**
 * @element nve-grid-header
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/grid
 * @slot - default slot for `nve-grid-column`
 * @cssprop --background
 * @cssprop --border-bottom
 * @cssprop --padding
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-grid-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
@audit({ auditSlots: true })
export class GridHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-header',
    version: '0.0.0',
    children: [GridColumn.metadata.tag]
  };

  /** @private */
  declare _internals: ElementInternals;

  /** @private */
  @queryAssignedElements({
    selector: `${GridColumn.metadata.tag}, ${GridColumn.metadata.tag.replace('nve-', 'nve-')}`,
    flatten: true
  })
  columns!: GridColumn[];

  get #grid() {
    return this.parentElement as Grid;
  }

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${() => this.#computeColumnWidths()}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'row';
    this.addEventListener('nve-grid-column-resize', () => this.#computeColumnWidths());
  }

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    await this.updateComplete;
    const debounceFn = debounce(() => this.#computeColumnWidths(), 100);
    new ResizeObserver(debounceFn).observe(this);
    this.#validateColumns();
  }

  async #computeColumnWidths() {
    await this.updateComplete;
    this.columns.forEach((c, i) => (c.ariaColIndex = `${i + 1}`));
    this.#grid.style.setProperty('--grid-auto-flow', 'initial');
    this.#grid.style.setProperty('--grid-template-column', this.columns.map((_, i) => `var(--c${i})`).join(' '));

    // compute initial column width
    this.columns.forEach((c, i) => this.#grid.style.setProperty(`--c${i}`, c.width ? c.width : `1fr`));

    // compute column width based on content
    await this.updateComplete;
    this.columns.forEach((c, i) =>
      this.#grid.style.setProperty(`--c${i}`, c.width ? c.width : `minmax(auto, ${c.getBoundingClientRect().width}px)`)
    );
  }

  #validateColumns() {
    if (GlobalStateService.state.env !== 'production') {
      const cells = this.#grid
        .querySelector(tagSelector(GridRow.metadata.tag))
        ?.querySelectorAll(tagSelector(GridCell.metadata.tag));
      if (this.columns && cells && this.columns.length !== cells.length) {
        LogService.error(`grid-column (${this.columns.length}) and grid-cell (${cells.length}) count mismatch`);
      }
    }
  }
}
