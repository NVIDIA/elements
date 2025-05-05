import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import {
  useStyles,
  attachInternals,
  appendRootNodeStyle,
  getAttributeChanges,
  tagSelector
} from '@nvidia-elements/core/internal';
import type { Grid } from '@nvidia-elements/core/grid';
import styles from './column.css?inline';

/**
 * @element nve-grid-column
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/grid
 * @slot - default slot for content
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
 * @storybook https://NVIDIA.github.io/elements/docs/elements/grid/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export class GridColumn extends LitElement {
  /**
   * Columns can individually have set widths using the `width` property or attribute and a valid CSS value type.
   * If the total width of all columns is less than the grid width then the last column will fill the remaining space.
   * By default columns are evenly devided unless width is explicitly provided. Content within a cell of a given
   * column will wrap content to fit the width of the column.
   */
  @property({ type: String, reflect: true }) width: string;

  /**
   * The `position` property or attribute can be set to `fixed` or `sticky` to make the column fixed or sticky.
   * Fixed columns will not scroll horizontally with the grid. Sticky columns will scroll horizontally with the grid
   * until the column reaches the edge of the grid.
   */
  @property({ type: String, reflect: true }) position: 'fixed' | 'sticky' | '';

  /**
   * Control the content alignment within a given column.
   */
  @property({ type: String, reflect: true, attribute: 'column-align' }) columnAlign: 'start' | 'center' | 'end';

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-column',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  get #grid() {
    return this.parentElement.parentElement as Grid;
  }

  #observers: (MutationObserver | ResizeObserver)[] = [];

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
    this.#observers.push(
      getAttributeChanges(this, 'aria-colindex', () => {
        this.#computeColumnPositions();
        this.#computeColumnAlignment();
      })
    );
    this.addEventListener('sort', (e: CustomEvent) => (this.ariaSort = e.detail.next));
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);

    if (props.get('columnAlign') !== this.columnAlign) {
      this.#computeColumnAlignment();
    }

    if (props.get('position') !== this.position) {
      this.#computeColumnPositions();
    }

    if (props.get('width') !== this.width) {
      this.dispatchEvent(new CustomEvent('nve-grid-column-resize', { bubbles: true }));
    }
  }

  #positionStylesheet: CSSStyleSheet;

  #computeColumnPositions() {
    if (this.position === 'fixed') {
      const columns = Array.from(this.parentElement.querySelectorAll<GridColumn>(tagSelector(GridColumn.metadata.tag)));
      const rightColumns = columns.slice(columns.indexOf(this) + 1, columns.length);
      const position = this.getBoundingClientRect();
      const gridPosition = this.#grid.getBoundingClientRect();
      const side = this.offsetLeft < gridPosition.width / 2 ? 'left' : 'right';
      const leftStyle = position.left - gridPosition.left;
      const rightStyle = rightColumns.reduce((width, c) => width + c.getBoundingClientRect().width, 0);
      const isLastLeft =
        this.position && side === 'left' && (this.nextElementSibling as GridColumn)?.position !== this.position;
      const isLastRight =
        this.position && side === 'right' && (this.previousElementSibling as GridColumn)?.position !== this.position;

      const positionStyle = `
        [id='${this.#grid.id}'] nve-grid-column:nth-child(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-cell:nth-child(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-column:nth-child(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-cell:nth-child(${this.ariaColIndex}) {
          position: sticky;
          z-index: 99;
          ${side === 'left' ? `left: ${leftStyle}px;` : `right: ${rightStyle}px;`}
        }
      `;

      const borderStyle =
        isLastLeft || isLastRight
          ? `
        [id='${this.#grid.id}'] nve-grid-column:nth-child(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-cell:nth-child(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-column:nth-child(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-cell:nth-child(${this.ariaColIndex}) {
          box-shadow: var(--scroll-shadow);
          clip-path: inset(0px ${isLastLeft ? '-4px' : '0'} 0px ${isLastRight ? '-4px' : '0'});
          --border-${side === 'right' ? 'left' : 'right'}: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
        }
      `
          : '';

      if (this.#positionStylesheet) {
        this.#positionStylesheet.replaceSync(`${positionStyle}\n${borderStyle}`);
      } else {
        this.#positionStylesheet = appendRootNodeStyle(this.#grid, `${positionStyle}\n${borderStyle}`);
      }

      this.setAttribute(side, '');
    } else {
      this.removeAttribute('left');
      this.removeAttribute('right');
      this.#positionStylesheet?.replaceSync('');
    }
  }

  #computeColumnAlignment() {
    if (this.columnAlign !== undefined) {
      appendRootNodeStyle(
        this.#grid,
        `
        [id='${this.#grid.id}'] nve-grid-column:nth-child(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-cell:nth-child(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-column:nth-child(${this.ariaColIndex}),
        [id='${this.#grid.id}'] nve-grid-cell:nth-child(${this.ariaColIndex}) {
          --justify-content: ${this.columnAlign}
        }
      `
      );
    }
  }
}
