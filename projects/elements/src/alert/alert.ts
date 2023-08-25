import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button';
import { attachInternals, I18nController, SupportStatus, TaskStatus, statusIcons, TypeClosableController, useStyles, statusStateStyles, supportStateStyles } from '@elements/elements/internal';
import styles from './alert.css?inline';

/**
 * @element mlv-alert
 * @event close
 * @slot icon
 * @slot prefix
 * @slot actions
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --color
 * @cssprop --icon-color
 * @cssprop --icon-size
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-alert-documentation--docs
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=76-5326&t=CAAM7yEBvG18tRRa-0
 */
export class Alert extends LitElement {
  static styles = useStyles([styles, statusStateStyles, supportStateStyles]);

  static readonly metadata = {
    tag: 'mlv-alert',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-icon': Icon,
    'mlv-icon-button': IconButton
  };

  /** visual treatment to represent a ongoing task or support status */
  @property({ type: String, reflect: true }) status: SupportStatus | TaskStatus | 'muted';

  /** enable closable alert when placed within a mlv-alert-group  */
  @property({ type: Boolean }) closable = false;

  #typeClosableController = new TypeClosableController(this);

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'mlv-i18n' }) i18n = this.#i18nController.i18n;

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
        <slot name="icon"><mlv-icon name=${statusIcons[this.status]}></mlv-icon></slot>
        ${this.#prefix.length ? html`<slot name="prefix"></slot>` : ''}
        <slot></slot>
        ${this.#actions.length ? html`<slot name="actions"></slot>` : ''}
        ${this.closable ? html`<mlv-icon-button @click=${() => this.#typeClosableController.close()} interaction="flat" icon-name="cancel" size="sm" .ariaLabel=${this.i18n.close}></mlv-icon-button>` : ''}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }
}
