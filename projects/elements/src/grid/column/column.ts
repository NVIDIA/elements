import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, attachInternals, appendRootNodeStyle, getAttributeChanges } from '@elements/elements/internal';
import type { Grid } from '@elements/elements/grid';
import type { IconButton } from '@elements/elements/icon-button';
import styles from './column.css?inline';


/**
 * @element nve-grid-column
 * @since 0.11.0
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
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-grid-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 * @stable false
 */
export class GridColumn extends LitElement {
  /** specify exact width using css value types */
  @property({ type: String, reflect: true }) width: string;

  @property({ type: String, reflect: true }) position: 'fixed' | 'sticky' | '';

  @property({ type: String, reflect: true, attribute: 'column-align' }) columnAlign: 'start' | 'center' | 'end';

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-column',
    version: 'PACKAGE_VERSION'
  };

  /** @private */
  declare _internals: ElementInternals;

  get #grid() {
    return this.parentElement.parentElement as Grid;
  }

  get #actions() {
    return Array.from(this.querySelectorAll<IconButton>('nve-sort-button, nve-icon-button[slot=actions]'))
  }

  #observers: (MutationObserver | ResizeObserver)[] = [];

  render() {
    return html`
      <div internal-host focusable="active">
        <slot></slot>
        <slot name="actions" @slotchange=${this.#updateActions}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'columnheader';
    this.#observers.push(getAttributeChanges(this, 'aria-colindex', () => {
      this.#computeColumnPositions();
      this.#computeColumnAlignment();
    }));
    this.addEventListener('sort', (e: CustomEvent) => this.ariaSort = e.detail.next);
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

  #updateActions() {
    this.#actions.forEach(action => {
      action.interaction = 'flat';
      action.iconName = action.iconName ? action.iconName : 'more-actions';
    });
  }

  #positionStylesheet: CSSStyleSheet;

  #computeColumnPositions() {
    if (this.position === 'fixed') {
      const columns = Array.from(this.parentElement.querySelectorAll<GridColumn>('nve-grid-column'));
      const rightColumns = columns.slice(columns.indexOf(this) + 1, columns.length);
      const position = this.getBoundingClientRect();
      const gridPosition = this.#grid.getBoundingClientRect();
      const side = this.offsetLeft < gridPosition.width / 2 ? 'left' : 'right';
      const leftStyle = position.left - gridPosition.left;
      const rightStyle = rightColumns.reduce((width, c) => width + c.getBoundingClientRect().width, 0);
      const isLastLeft = this.position && side === 'left' && (this.nextElementSibling as any)?.position !== this.position;
      const isLastRight = this.position && side === 'right' && (this.previousElementSibling as any)?.position !== this.position;

      const positionStyle = `
        nve-grid[id='${this.#grid.id}'] nve-grid-column:nth-child(${this.ariaColIndex}),
        nve-grid[id='${this.#grid.id}'] nve-grid-cell:nth-child(${this.ariaColIndex}) {
          position: sticky;
          z-index: 99;
          ${side === 'left' ? `left: ${leftStyle}px;` : `right: ${rightStyle}px;`}
        }
      `;

      const borderStyle = (isLastLeft || isLastRight) ? `
        nve-grid[id='${this.#grid.id}'] nve-grid-column:nth-child(${this.ariaColIndex}),
        nve-grid[id='${this.#grid.id}'] nve-grid-cell:nth-child(${this.ariaColIndex}) {
          box-shadow: var(--scroll-shadow);
          clip-path: inset(0px ${isLastLeft ? '-4px' : '0'} 0px ${isLastRight ? '-4px' : '0'});
          --border-${side === 'right' ? 'left' : 'right'}: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
        }
      ` : '';

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
    appendRootNodeStyle(this.#grid, `
      nve-grid[id='${this.#grid.id}'] nve-grid-column:nth-child(${this.ariaColIndex}),
      nve-grid[id='${this.#grid.id}'] nve-grid-cell:nth-child(${this.ariaColIndex}) {
        --justify-content: ${this.columnAlign}
      }
    `);
  }
}
