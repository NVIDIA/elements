import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button';
import { attachInternals, I18nController, SupportStatus, TaskStatus, statusIcons, TypeClosableController, useStyles, statusStateStyles, supportStateStyles } from '@elements/elements/internal';
import styles from './alert.css?inline';

/**
 * @beta
 * @element nve-alert
 * @event close
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --color
 * @cssprop --icon-color
 * @cssprop --icon-size
 */
export class Alert extends LitElement {
  static styles = useStyles([styles, statusStateStyles, supportStateStyles]);

  static readonly metadata = {
    tag: 'nve-alert',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon': Icon,
    'nve-icon-button': IconButton
  };

  /** visual treatment to represent a ongoing task or support status */
  @property({ type: String, reflect: true }) status: SupportStatus | TaskStatus | 'muted';

  /** enable closable alert when placed within a nve-alert-group  */
  @property({ type: Boolean }) closable = false;

  #typeClosableController = new TypeClosableController(this);

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;

  get #prefix() {
    return this.querySelectorAll('[slot="prefix"]');
  }

  get #actions() {
    return this.querySelectorAll('[slot="actions"]');
  }

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        ${this.status !== 'muted' ? html`<nve-icon name=${statusIcons[this.status] ?? 'dot'} .size=${statusIcons[this.status] === 'dot' ? 'sm' : undefined}></nve-icon>` : ''}
        ${this.#prefix.length ? html`<slot name="prefix"></slot>` : ''}
        <slot></slot>
        ${this.#actions.length ? html`<slot name="actions"></slot>` : ''}
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
