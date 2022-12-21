import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button';
import { attachInternals, Status, statusIcons, TypeClosableController, useStyles } from '@elements/elements/internal';
import styles from './alert.css?inline';

/**
 * @alpha
 * @element mlv-alert
 * @event close
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --color
 * @cssprop --icon-color
 * @cssprop --icon-size
 */
export class Alert extends LitElement {
  static styles = useStyles([styles]);

  @property({ type: String, reflect: true }) status: Status | 'muted';

  @property({ type: Boolean }) closable = false;

  #typeClosableController = new TypeClosableController(this);

  /** @private */
  declare _internals: ElementInternals;

  static elementDefinitions = {
    'mlv-icon': Icon,
    'mlv-icon-button': IconButton
  }

  render() {
    return html`
      <div internal-host>
        ${this.status !== 'muted' ? html`<mlv-icon name=${statusIcons[this.status] ?? 'information'}></mlv-icon>` : ''}
        <slot></slot>
        ${this.closable ? html`<mlv-icon-button @click=${() => this.#typeClosableController.close()} interaction="ghost" icon-name="cancel" aria-label="close"></mlv-icon-button>` : ''}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }
}
