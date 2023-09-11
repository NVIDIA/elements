import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ColorPalette, I18nController, MlvBaseButton, TypeClosableController, useStyles, colorStateStyles } from '@elements/elements/internal';
import { Icon } from '@elements/elements/icon';
import styles from './tag.css?inline';

/**
 * @element mlv-tag
 * @description A interactive element that represents a category or group of content. Typically used to filter or organize content for one to many relations.
 * @since 0.10.0
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --color
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --font-weight
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-tag-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-10&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
export class Tag extends MlvBaseButton {
  /** Determines if tag is closable, if true, a close icon will be rendered. [Figma](https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=3622-86613&mode=design&t=qIZGochM1aUsCdOP-0) */
  @property({ type: Boolean }) closable = false;

  /** Determines the color of the tag. [Figma](https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=29-10&mode=design&t=uFeSKovl7yrHakis-0) */
  @property({ type: String, reflect: true }) color: ColorPalette;

  #typeClosableController = new TypeClosableController(this);

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'mlv-i18n' }) i18n = this.#i18nController.i18n;

  static styles = useStyles([styles, colorStateStyles]);

  static readonly metadata = {
    tag: 'mlv-tag',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-icon': Icon
  };

  render() {
    return html`
      <div internal-host interaction-state focus-within>
        <slot></slot>
        ${this.closable ? html`<mlv-icon @click=${() => this.#typeClosableController.close()} interaction="flat" name="cancel" size="sm" .ariaLabel=${this.i18n.close}></mlv-icon>` : ''}
      </div>
    `;
  }
}
