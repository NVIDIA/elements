import { PropertyValues, html, nothing } from 'lit';
import { appendRootNodeStyle, focusElementTimeout, onListboxActivate, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button/icon-button';
import { Menu, MenuItem } from '@elements/elements/menu';
import { Dropdown } from '@elements/elements/dropdown';
import { Tag } from '@elements/elements/tag';
import globalStyles from './select.global.css?inline';
import styles from './select.css?inline';

/**
 * @element nve-select
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
export class Select extends Control {
  static styles = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-select',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-dropdown': Dropdown,
    'nve-menu': Menu,
    'nve-menu-item': MenuItem,
    'nve-icon': Icon,
    'nve-icon-button': IconButton,
    'nve-tag': Tag
  }

  get #select() {
    return (this.shadowRoot.querySelector('slot')?.assignedElements({ flatten: true })?.find(i => i.tagName === 'SELECT') ?? this.querySelector('select')) as HTMLSelectElement;
  }

  get #options() {
    return Array.from(this.#select?.options ? this.#select.options : []);
  }

  get #dropdown() {
    return this.shadowRoot.querySelector('nve-dropdown');
  }

  get #menuItems() {
    return this.shadowRoot.querySelectorAll('nve-menu-item');
  }

  get #input() {
    return this.shadowRoot.querySelector('[input]')
  }

  protected get prefixContent() {
    return this.input?.multiple ? html`${this.#options.filter(o => o.selected).map(o => html`
      <nve-tag readonly color="gray-slate" closable .value=${o.value} @click=${() => this.#selectValue(o, false)}>${o.textContent}</nve-tag>
    `)}` : nothing;
  }

  protected get suffixContent() {
    return html`
      <nve-icon name="caret" part="caret" direction="down"></nve-icon>
      <nve-dropdown @close=${e => e.target.hidden = true} hidden .anchor=${this.#input as HTMLElement} .trigger=${this.#select as HTMLElement} position="bottom" alignment="center">
        <nve-menu role="listbox" style="--width: 100%; --min-width: fit-content" aria-label="select options">
          ${this.#options.map((o, i) => html`
          <nve-menu-item role="option" @click=${() => this.#selectValue(o, !o.selected)} ?selected=${o.selected} aria-selected=${o.selected}>
            <slot name="option-${i + 1}">
              <nve-icon name="checkmark"></nve-icon> ${o.innerText}
            </slot>
          </nve-menu-item>`)}
        </nve-menu>
      </nve-dropdown>`;
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
  }

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    await this.updateComplete;

    if (this.#select.size === 0) {
      onListboxActivate(this.#select, () => {
        this.#dropdown.style.setProperty('--min-width', `${this.#input.getBoundingClientRect().width}px`);
        this.#dropdown.hidden = false;
        focusElementTimeout(this.#menuItems[0]);
      });
    }
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);
    if (this.#select.size !== 0) {
      this._internals.states.add('--size');
    }

    if (this.#select.multiple && this.#select.size === 0) {
      this._internals.states.add('--multiple');
    }
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
