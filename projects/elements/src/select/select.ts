import { PropertyValues, html, nothing, render } from 'lit';
import { appendRootNodeStyle, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button/icon-button';
import { Menu, MenuItem } from '@elements/elements/menu';
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
    'nve-menu': Menu,
    'nve-menu-item': MenuItem,
    'nve-icon': Icon,
    'nve-icon-button': IconButton
  }

  protected get suffixContent() {
    return (this.input?.multiple || this.input?.size) ? nothing : html`<nve-icon part="caret" name="caret" direction="down"></nve-icon>`;
  }

  get #select() {
    return this.querySelector('select');
  }

  get #options() {
    return Array.from(this.querySelectorAll('option'));
  }

  get #dropdown() {
    return this.querySelector('nve-dropdown');
  }

  get #menu() {
    return this.querySelector('nve-menu');
  }

  get #menuItems() {
    return this.querySelectorAll('nve-menu-item');
  }

  protected get dropdown() {
    return html`
    <nve-dropdown hidden .anchor=${this.#select as HTMLElement} .trigger=${this.#select as HTMLElement} position="bottom" alignment="center">
      <nve-menu role="listbox">
        ${this.#options.map(o => html`<nve-menu-item role="option" aria-selected=${o.value === this.#select.value} ?selected=${o.value === this.#select.value} .value=${o.value}>${this.#getOptionLabel(o)}</nve-menu-item>`)}
      </nve-menu>
    </nve-dropdown>`
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
  }

  firstUpdated(props: PropertyValues<this>): void {
    super.firstUpdated(props);
    render(this.dropdown, this);
    this.#dropdown.addEventListener('close', () => this.#dropdown.toggleAttribute('hidden'));
    this.#dropdown.addEventListener('click', (e: any) => this.#selectValue(e.target.value));
    this.#select.addEventListener('pointerdown', (e: any) => {
      if (!this.#select.disabled && !this.#select.size && !this.#select.multiple) {
        e.preventDefault();
        this.#updateOptions();
        const width = this.#select.getBoundingClientRect().width;
        this.#menu.style.setProperty('--width', `${width}px`);
        this.#menu.style.setProperty('--min-width', `fit-content`);
        this.#dropdown.style.setProperty('--width', `${width}px`);
        this.#dropdown.hidden = false;
      }
    });
  }

  #selectValue(value) {
    if (value) {
      this.#select.value = value;
      this.#updateOptions();
      this.#select.dispatchEvent(new Event('input'));
      this.#select.dispatchEvent(new Event('change'));
      this.#dropdown.toggleAttribute('hidden');
    }
  }

  #updateOptions() {
    this.#menuItems.forEach((o: any) => o.selected = (o.value === this.#select.value))
  }

  #getOptionLabel(option: HTMLOptionElement) {
    const template = option.querySelector('template');
    return template ? template.content.cloneNode(true) : option.innerText;
  }
}
