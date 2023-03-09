import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ColorPalette, I18nController, MlvBaseButton, TypeClosableController, useStyles, colorStateStyles } from '@elements/elements/internal';
import { Icon } from '@elements/elements/icon';
import styles from './tag.css?inline';

/**
 * @alpha
 * @element nve-tag
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --color
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --font-weight
 */
export class Tag extends MlvBaseButton {
  @property({ type: Boolean }) closable = false;

  @property({ type: String, reflect: true }) color: ColorPalette;

  #typeClosableController = new TypeClosableController(this);

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;

  static styles = useStyles([styles, colorStateStyles]);

  static readonly metadata = {
    tag: 'nve-tag',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon': Icon
  };

  render() {
    return html`
      <div internal-host interaction-state focus-within>
        <slot></slot>
        ${this.closable ? html`<nve-icon @click=${() => this.#typeClosableController.close()} interaction="ghost" name="cancel" .ariaLabel=${this.i18n.close}></nve-icon>` : ''}
      </div>
    `;
  }
}
