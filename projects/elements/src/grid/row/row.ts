import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, attachInternals, stateSelected, audit } from '@nvidia-elements/core/internal';
import { GridCell } from '../cell/cell.js';
import styles from './row.css?inline';

/**
 * @element nve-grid-row
 * @since 0.11.0
 * @slot - default slot for `nve-grid-cell`
 * @cssprop --background
 * @cssprop --border-bottom
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-grid-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
@stateSelected()
@audit({ auditSlots: true })
export class GridRow extends LitElement {
  /**
   * The `selected` property or attribute can be set to `true` to indicate that the row is in a selected state.
   */
  @property({ type: Boolean }) selected: boolean;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-row',
    version: '0.0.0',
    children: [GridCell.metadata.tag]
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'row';
  }
}
