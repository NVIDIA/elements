import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@elements/elements/internal';
import styles from './divider.css?inline';

/**
 * @alpha
 * @element nve-divider
 * @cssprop --color
 * @cssprop --emphasis-color
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
    tag: 'nve-divider',
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
