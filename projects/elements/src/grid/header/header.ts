import { html, LitElement, PropertyValues } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { useStyles, attachInternals, debounce, LogService } from '@elements/elements/internal';
import type { Grid, GridColumn } from '@elements/elements/grid';
import styles from './header.css?inline';
import { GlobalStateService } from '@elements/elements/internal/services/global.service';

/**
 * @element nve-grid-header
 * @since 0.11.0
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --border-bottom
 * @cssprop --padding
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-grid-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 * @stable false
 */
export class GridHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-header',
    version: 'PACKAGE_VERSION'
  };

  /** @private */
  declare _internals: ElementInternals;

  /** @private */
  @queryAssignedElements({ selector: 'nve-grid-column', flatten: true }) columns!: GridColumn[];

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
    this.columns.forEach((c, i) => c.ariaColIndex = `${i + 1}`);
    this.#grid.style.setProperty('--grid-auto-flow', 'initial');
    this.#grid.style.setProperty('--grid-template-column', this.columns.map((_, i) => `var(--c${i})`).join(' '));

    // compute initial column width
    this.columns.forEach((c, i) => this.#grid.style.setProperty(`--c${i}`, c.width ? c.width : `1fr`));

    // compute column width based on content
    await this.updateComplete;
    this.columns.forEach((c, i) => this.#grid.style.setProperty(`--c${i}`, c.width ? c.width : `minmax(auto, ${c.getBoundingClientRect().width}px)`));
  }

  #validateColumns() {
    if (GlobalStateService.state.env !== 'production') {
      const cells = this.#grid.querySelector('nve-grid-row')?.querySelectorAll('nve-grid-cell');
      if (this.columns && cells && (this.columns.length !== cells.length)) {
        LogService.error(`Error: nve-grid-column (${this.columns.length}) and nve-grid-cell (${cells.length}) count mismatch`);
      }
    }
  }
}
