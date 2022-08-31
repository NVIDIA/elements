import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { attachInternals, useStyles } from '@elements/elements/internal';
import styles from './alert-group.css?inline';

/**
 * @alpha
 * @element nve-alert-group
 * @cssprop --gap
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --background
 * @cssprop --border-radius
 */
export class AlertGroup extends LitElement {
  static styles = useStyles([styles]);

  @property({ type: String, reflect: true }) status: 'warning' | 'danger' | 'success' | 'info' | 'muted';

  /** @private */
  declare _internals: ElementInternals;

  get #alerts() {
    return this.querySelectorAll('nve-alert');
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
