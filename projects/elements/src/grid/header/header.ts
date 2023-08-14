import { html, LitElement, PropertyValues } from 'lit';
import { useStyles, attachInternals } from '@elements/elements/internal';
import type { GridColumn } from '@elements/elements/grid';
import styles from './header.css?inline';

/**
 * @element nve-grid-header
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

  get #columns() {
    return Array.from(this.querySelectorAll<GridColumn>('nve-grid-column'))
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
    new ResizeObserver(() => this.#computeColumnWidths()).observe(this);
  }

  async #computeColumnWidths() {
    await this.updateComplete;
    this.#columns.forEach((c, i) => c.ariaColIndex = `${i + 1}`);
    this.parentElement.style.setProperty('--grid-auto-flow', 'initial');
    this.parentElement.style.setProperty('--grid-template-column', this.#columns.map((_, i) => `var(--c${i})`).join(' '));

    // compute initial column width
    this.#columns.forEach((c, i) => this.parentElement.style.setProperty(`--c${i}`, c.width ? c.width : `1fr`));

    // compute column width based on content
    await this.updateComplete;
    this.#columns.forEach((c, i) => this.parentElement.style.setProperty(`--c${i}`, c.width ? c.width : `minmax(auto, ${c.getBoundingClientRect().width}px)`));
  }
}
