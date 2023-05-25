import { html, LitElement } from 'lit';
import { useStyles, attachInternals } from '@elements/elements/internal';
import styles from './footer.css?inline';

/**
 * @element mlv-grid-footer
 * @slot - default slot for content
 * @cssprop --background
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-grid-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 * @stable false
 * @package false
 */
export class GridFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-grid-footer',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {

  };

  /** @private */
  _internals: ElementInternals;

  render() {
    return html`
      <div internal-host role="gridcell">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.slot = 'footer';
    attachInternals(this);
    this._internals.role = 'row';
  }
}
