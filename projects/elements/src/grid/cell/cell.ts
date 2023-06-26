import { html, LitElement } from 'lit';
import { useStyles, attachInternals } from '@elements/elements/internal';
import styles from './cell.css?inline';

/**
 * @element nve-grid-cell
 * @slot - default slot for content
 * @cssprop --background
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-grid-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 * @stable false
 */
export class GridCell extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-cell',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {

  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host focusable="active">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'gridcell';
  }
}
