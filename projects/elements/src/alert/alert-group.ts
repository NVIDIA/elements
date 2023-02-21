import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, Status, useStyles } from '@elements/elements/internal';
import styles from './alert-group.css?inline';

/**
 * @alpha
 * @element mlv-alert-group
 * @cssprop --gap
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --background
 * @cssprop --border-radius
 */
export class AlertGroup extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-alert-group',
    version: 'PACKAGE_VERSION'
  };

  @property({ type: String, reflect: true }) status: Status;

  /** @private */
  declare _internals: ElementInternals;

  get #alerts() {
    return this.querySelectorAll('mlv-alert');
  }

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${() => this.#updateStatus()}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#updateStatus();
  }

  #updateStatus() {
    this.#alerts.forEach(alert => alert.status = this.status);
  }
}
