import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@elements/elements/icon';
import { useStyles, attachInternals, MlvBaseButton, I18nController } from '@elements/elements/internal';
import styles from './sort-button.css?inline';

const nextSort = {
  'none': 'ascending',
  'ascending': 'descending',
  'descending': 'none'
};

/**
 * @element nve-sort-button
 * @description A sort button is a control that enables users to sort a list of items in ascending or descending order.
 * @since 0.11.0
 * @event sort - emits the next sort type
 * @slot - default slot for content
 * @cssprop --width
 * @cssprop --height
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-sort-button-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=127-8456&t=TYtFvncSeBAKHOMe-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
 * @stable false
 */
export class SortButton extends MlvBaseButton {
  @property({ type: String, reflect: true }) sort: 'ascending' | 'descending' | 'none' = 'none';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-sort-button',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon': Icon
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host focus-within>
        <nve-icon .name=${this.sort === 'descending' ? 'sort-descending' : 'sort-ascending'} aria-hidden="true"></nve-icon>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'spinbutton';

    this.addEventListener('click', () => {
      this._internals.ariaLabel = `${this.#i18nController.i18n.sort} ${nextSort[this.sort]}`;
      this.dispatchEvent(new CustomEvent('sort', { detail: { value: this.sort, next: nextSort[this.sort] }, bubbles: true }));
    });
  }
}
