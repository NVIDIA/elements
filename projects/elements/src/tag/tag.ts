import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { Color, Prominence } from '@nvidia-elements/core/internal';
import {
  I18nController,
  BaseButton,
  TypeClosableController,
  useStyles,
  colorStateStyles,
  scopedRegistry
} from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './tag.css?inline';

/**
 * @element nve-tag
 * @description A interactive element that represents a category or group of content. Typically used to filter or organize content for one to many relations.
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/tag
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --color
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --padding
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --font-weight
 * @cssprop --cursor
 * @cssprop --height
 * @cssprop --width
 * @cssprop --max-width
 * @cssprop --text-decoration
 * @csspart icon - The icon element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
@scopedRegistry()
export class Tag extends BaseButton {
  static styles = useStyles([colorStateStyles, styles]);

  static readonly metadata = {
    tag: 'nve-tag',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  /** Determines if tag is closable, if true, the component renders a close icon. */
  @property({ type: Boolean }) closable = false;

  /** Determines the color of the tag. */
  @property({ type: String, reflect: true }) color: Color;

  /** Determines the visual prominence or weight */
  @property({ type: String, reflect: true }) prominence?: Extract<Prominence, 'emphasis'>;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Updates internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  #typeClosableController = new TypeClosableController(this);

  render() {
    return html`
      <div internal-host interaction-state focus-within>
        <slot></slot>
        ${this.closable ? html`<nve-icon part="icon" @click=${() => this.#typeClosableController.close()} container="flat" name="cancel" size="sm" role="img" aria-label=${ifDefined(this.i18n.close)}></nve-icon>` : ''}
      </div>
    `;
  }

  constructor() {
    super();
    this.type = 'button';
  }
}
