import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@elements/elements/icon';
import { useStyles, TypeClosableController, I18nController } from '@elements/elements/internal';
import styles from './bulk-actions.css?inline';

/**
 * @deprecated
 * @description Bulk Actions are used for selecting and running an action on one to many selections by the user.
 * @since 0.11.0
 * @event close - Dispatched when the bulk actions close button is clicked.
 * @slot - Default content placed inside of the bulk actions.
 * @cssprop --background
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-bulk-actions-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=141-10016&t=Ypowt9RnBcKNg17i-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 * @stable false
 */
export class BulkActions extends LitElement {
  /**
   * Determines if a close button should render.
   */
  @property({ type: Boolean }) closable: boolean;

  /**
   * Visual treatment to represent support status.
   */
  @property({ type: String, reflect: true }) status: 'accent';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object, attribute: 'mlv-i18n' }) i18n = this.#i18nController.i18n;

  #typeClosableController = new TypeClosableController(this);

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-bulk-actions',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-icon': Icon
  };

  render() {
    return html`
      <div internal-host>
        ${this.closable ? html`<mlv-icon-button @click=${() => this.#typeClosableController.close()} .ariaLabel=${this.i18n.close} icon-name="cancel" interaction="flat"></mlv-icon-button>` : ''}
        <slot></slot>
      </div>
    `;
  }
}
