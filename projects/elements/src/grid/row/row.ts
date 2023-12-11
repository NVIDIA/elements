import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, attachInternals, stateSelected } from '@elements/elements/internal';
import styles from './row.css?inline';

/**
 * @element nve-grid-row
 * @since 0.11.0
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --border-bottom
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-grid-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
@stateSelected()
export class GridRow extends LitElement {
  /**
   * The `selected` property or attribute can be set to `true` to indicate that the row is in a selected state.
   */
  @property({ type: Boolean }) selected: boolean;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-row',
    version: 'PACKAGE_VERSION',
    children: ['nve-grid-cell']
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
