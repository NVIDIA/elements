import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@nvidia-elements/core/icon';
import { useStyles, BaseButton, I18nController } from '@nvidia-elements/core/internal';
import styles from './sort-button.css?inline';

const nextSort = {
  none: 'ascending',
  ascending: 'descending',
  descending: 'none'
};

/**
 * @element nve-sort-button
 * @description A sort button is a control that enables users to sort a list of items in ascending or descending order.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/sort-button
 * @event sort - Dispatched when the sort button is clicked, returns the current sort value and the next sort value.
 * @slot - default slot for content
 * @cssprop --width
 * @cssprop --height
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-sort-button-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=127-8456&t=TYtFvncSeBAKHOMe-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
 */
export class SortButton extends BaseButton {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-sort-button',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  /**
   * The current sort value, can be ascending, descending, or none.
   */
  @property({ type: String, reflect: true }) sort: 'ascending' | 'descending' | 'none' = 'none';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`
      <div internal-host focus-within>
        <nve-icon .name=${this.sort === 'descending' ? 'sort-descending' : 'sort-ascending'} aria-hidden="true"></nve-icon>
      </div>
    `;
  }

  constructor() {
    super();
    this.type = 'button';
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'spinbutton';

    this.addEventListener('click', () => {
      this._internals.ariaLabel = `${this.#i18nController.i18n.sort} ${nextSort[this.sort]}`;
      this.dispatchEvent(
        new CustomEvent('sort', { detail: { value: this.sort, next: nextSort[this.sort] }, bubbles: true })
      );
    });
  }
}
