import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button';
import { attachInternals, I18nController, Status, statusIcons, TypeClosableController, useStyles } from '@elements/elements/internal';
import styles from './alert.css?inline';

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

  @property({ type: String, reflect: true }) status: Status | 'muted';

  @property({ type: Boolean }) closable = false;

  #typeClosableController = new TypeClosableController(this);

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;

  /** @private */
  declare _internals: ElementInternals;

  static elementDefinitions = {
    'nve-icon': Icon,
    'nve-icon-button': IconButton
  }

  render() {
    return html`
      <div internal-host>
        ${this.status !== 'muted' ? html`<nve-icon name=${statusIcons[this.status] ?? 'information'}></nve-icon>` : ''}
        <slot></slot>
        <slot name="actions"></slot>
        ${this.closable ? html`<nve-icon-button @click=${() => this.#typeClosableController.close()} interaction="ghost" icon-name="cancel" size="sm" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }
}
