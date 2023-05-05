import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@elements/elements/internal';
import styles from './divider.css?inline';

/**
 * @alpha
 * @element mlv-divider
 * @cssprop --color
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-divider-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-17&t=amYlOylF8PkKNaxU-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr
 * @stable false
 */
export class Divider extends LitElement {
  // TODO: Implement vertical divider; only horizontal now
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'horizontal';

  // TODO: Implement thickness property; forced to only 1px now
  // @property({ type: String, reflect: true }) thickness = '1';

  @property({ type: String, reflect: true }) size = '100%';

  @property({ type: Boolean, reflect: true }) emphasis = false;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-divider',
    version: 'PACKAGE_VERSION'
  };

  #internals = this.attachInternals();

  render() {
    return html`
      <div internal-host><div divider-line style="width: ${this.size}"></div></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#internals.role = 'presentation';
  }
}
