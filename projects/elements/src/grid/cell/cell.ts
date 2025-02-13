import { html, LitElement } from 'lit';
import { useStyles, attachInternals } from '@nvidia-elements/core/internal';
import styles from './cell.css?inline';

/**
 * @element nve-grid-cell
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/grid
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --min-height
 * @cssprop --min-width
 * @cssprop --font-weight
 * @cssprop --height
 * @cssprop --border-left
 * @cssprop --border-right
 * @cssprop --justify-content
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-grid-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export class GridCell extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-cell',
    version: '0.0.0'
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
