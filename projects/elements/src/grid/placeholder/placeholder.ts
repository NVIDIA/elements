import { html, LitElement } from 'lit';
import { useStyles, attachInternals } from '@elements/elements/internal';
import styles from './placeholder.css?inline';

/**
 * @element mlv-grid-placeholder
 * @slot - default slot for content
 * @cssprop --background
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-grid-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 * @stable false
 * @responsive false
 */
export class GridPlaceholder extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-grid-placeholder',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {

  };

  /** @private */
  _internals: ElementInternals;

  render() {
    return html`
      <div internal-host focusable="active" role="gridcell">
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
