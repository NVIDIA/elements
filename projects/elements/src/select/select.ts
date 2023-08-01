import { PropertyValues, html, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { appendRootNodeStyle, focusElementTimeout, onListboxActivate, useStyles, i18n, I18nController } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button/icon-button';
import { Menu, MenuItem } from '@elements/elements/menu';
import { Dropdown } from '@elements/elements/dropdown';
import { Tag } from '@elements/elements/tag';
import globalStyles from './select.global.css?inline';
import styles from './select.css?inline';

/**
 * @element mlv-select
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-select-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-24&t=clRGqnKDRGNhR0Yu-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
 */
@i18n<Select>()
export class Select extends Control {
  static styles = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-select',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-dropdown': Dropdown,
    'mlv-menu': Menu,
    'mlv-menu-item': MenuItem,
    'mlv-icon': Icon,
    'mlv-icon-button': IconButton,
    'mlv-tag': Tag
  }

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'mlv-i18n' }) i18n = this.#i18nController.i18n;

  get #select() {
    return (this.shadowRoot.querySelector('slot')?.assignedElements({ flatten: true })?.find(i => i.tagName === 'SELECT') ?? this.querySelector('select')) as HTMLSelectElement;
  }

  get #options() {
    return Array.from(this.#select?.options ? this.#select.options : []);
  }

  get #dropdown() {
    return this.shadowRoot.querySelector('mlv-dropdown');
  }

  get #menuItems() {
    return this.shadowRoot.querySelectorAll('mlv-menu-item');
  }

  get #input() {
    return this.shadowRoot.querySelector('[input]')
  }

  get #tags() {
    return this.shadowRoot.querySelector('.tags')
  }

  #resizeObserver: ResizeObserver;

  protected get prefixContent() {
    return this.input?.multiple ? html`
    <div class="tags-label" aria-hidden="true">${this.#options.filter(o => o.selected).length} ${this.i18n.selected}</div>
    <div class="tags">
      ${this.#options.filter(o => o.selected).map(o => html`
      <mlv-tag readonly color="gray-slate" closable .value=${o.value} @click=${() => this.#selectValue(o, false)}>${o.textContent}</mlv-tag>`)}
    </div>` : nothing;
  }

  protected get suffixContent() {
    return html`
      <mlv-icon name="caret" part="caret" direction="down"></mlv-icon>
      <mlv-dropdown @close=${e => e.target.hidden = true} hidden .anchor=${this.#input as HTMLElement} .trigger=${this.#select as HTMLElement} position="bottom" alignment="center">
        <mlv-menu role="listbox" style="--width: 100%; --min-width: fit-content" aria-label="select options">
          ${this.#options.map((o, i) => html`
          <mlv-menu-item role="option" @click=${() => this.#selectValue(o, !o.selected)} ?selected=${o.selected} aria-selected=${o.selected}>
            <slot name="option-${i + 1}">
              <mlv-icon name="checkmark"></mlv-icon> ${o.innerText}
            </slot>
          </mlv-menu-item>`)}
        </mlv-menu>
      </mlv-dropdown>`;
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
  }

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    await this.updateComplete;
    this.#setupCustomSelectUI();
    this.#setupOverflowListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#resizeObserver.disconnect();
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);
    if (this.#select?.size !== 0) {
      this._internals.states.add('--size');
    }

    if (this.#select?.multiple && this.#select?.size === 0) {
      this._internals.states.add('--multiple');
    }
  }

  #setupCustomSelectUI() {
    if (this.#select?.size === 0) {
      onListboxActivate(this.#select, () => {
        this.requestUpdate(); // update menu items
        this.#dropdown.style.setProperty('--min-width', `${this.#input.getBoundingClientRect().width}px`);
        this.#dropdown.hidden = false;
        focusElementTimeout(this.#menuItems[0]);
      });
    }
  }

  #setupOverflowListener() {
    this.#resizeObserver = new ResizeObserver((entries) => {
      if (this.input.multiple && this.#tags.getBoundingClientRect().width > entries[0].contentRect.width - 24) {
        this._internals.states.add('--multiple-overflow');
      } else {
        this._internals.states.delete('--multiple-overflow');
      }
    });
    this.#resizeObserver.observe(this.#input);
  }

  #selectValue(option: HTMLOptionElement, selected: boolean) {
    option.selected = selected;
    this.#select.dispatchEvent(new Event('input', { bubbles: true }));
    this.#select.dispatchEvent(new Event('change', { bubbles: true }));
    this.requestUpdate();

    if (!this.#select.multiple) {
      this.#dropdown.hidden = true;
    }
  }
}
