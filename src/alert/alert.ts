import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { attachInternals, TypeClosableController, useStyles } from '@elements/elements/internal';
import styles from './alert.css?inline';

const icons = {
  info: 'information',
  warning: 'warning',
  success: 'passed-or-success',
  danger: 'warning'
}

/**
 * @alpha
 * @element nve-alert
 * @event close
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --color
 * @cssprop --icon-color
 * @cssprop --icon-size
 */
export class Alert extends LitElement {
  static styles = useStyles([styles]);

  @property({ type: String, reflect: true }) status: 'warning' | 'danger' | 'success' | 'info' | 'muted';

  @property({ type: Boolean }) closable = false;

  #typeClosableController = new TypeClosableController(this);

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        ${icons[this.status] ? html`<nve-icon .name=${icons[this.status]} part="status-icon"></nve-icon>` : ''}
        <slot></slot>
        ${this.closable ? html`<nve-icon-button @click=${() => this.#typeClosableController.close()} interaction="ghost" icon-name="cancel" aria-label="close"></nve-icon-button>` : ''}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }
}
